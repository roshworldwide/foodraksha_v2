import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { auditIp, writeAudit } from "@/lib/audit";
import { notifyFiled } from "@/lib/filing/notify";
import { prisma } from "@/lib/prisma";

/**
 * Record that an application was filed with FoSCoS.
 *
 * Sets FILED, stores the FoSCoS reference and date, writes a StatusEvent and
 * audit row in one transaction, then notifies the customer (best effort).
 */
const bodySchema = z.object({
  referenceNo: z
    .string()
    .trim()
    .min(3, "Enter the FoSCoS reference or application number")
    .max(60),
  // The date printed in the portal, IST. Optional — defaults to today.
  filedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date")
    .optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id: applicationId } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Malformed request" },
      { status: 400 },
    );
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      status: true,
      applicationNo: true,
      customer: {
        select: {
          businessName: true,
          user: { select: { name: true, mobile: true, email: true } },
        },
      },
    },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (application.status === "FILED") {
    return NextResponse.json(
      { error: "This application is already recorded as filed." },
      { status: 409 },
    );
  }

  const filedAt = parsed.data.filedOn
    ? new Date(`${parsed.data.filedOn}T00:00:00+05:30`)
    : new Date();
  const ipAddress = await auditIp();

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: {
        status: "FILED",
        filedAt,
        // FoSCoS reference is not a schema column; it lives in the audit trail
        // and the StatusEvent note, which is where "what reference?" is asked.
      },
    });

    await tx.statusEvent.create({
      data: {
        applicationId,
        fromStatus: application.status,
        toStatus: "FILED",
        note: `Filed with FSSAI. Reference ${parsed.data.referenceNo}.`,
        byUserId: session.user.id,
      },
    });

    await writeAudit(tx, {
      userId: session.user.id,
      entity: "Application",
      entityId: applicationId,
      action: "status_change",
      before: { status: application.status },
      after: {
        status: "FILED",
        referenceNo: parsed.data.referenceNo,
        filedAt: filedAt.toISOString(),
      },
      ipAddress,
    });
  });

  await notifyFiled({
    name: application.customer.user.name,
    mobile: application.customer.user.mobile,
    email: application.customer.user.email,
    applicationNo: application.applicationNo,
    referenceNo: parsed.data.referenceNo,
  });

  return NextResponse.json({ ok: true, filedAt: filedAt.toISOString() });
}
