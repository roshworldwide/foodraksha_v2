import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { auditIp, writeAudit } from "@/lib/audit";
import { notifyFiled } from "@/lib/notifications/customer";
import { prisma } from "@/lib/prisma";
import { InvalidTransitionError, transition } from "@/lib/status-machine";

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

  try {
    await prisma.$transaction(async (tx) => {
      // READY_TO_FILE is the pipeline's "internally approved" step before
      // FILED. Recording a filing implies approval, so advance through it in
      // one go rather than making staff click twice.
      if (application.status === "UNDER_REVIEW") {
        await transition(tx, {
          applicationId,
          from: "UNDER_REVIEW",
          to: "READY_TO_FILE",
          byUserId: session.user.id,
          note: "Approved for filing.",
        });
      }

      const from =
        application.status === "UNDER_REVIEW"
          ? "READY_TO_FILE"
          : application.status;

      await transition(tx, {
        applicationId,
        from,
        to: "FILED",
        byUserId: session.user.id,
        // FoSCoS reference is not a schema column; it lives in the StatusEvent
        // note and the audit trail, which is where "what reference?" is asked.
        note: `Filed with FSSAI. Reference ${parsed.data.referenceNo}.`,
        data: { filedAt },
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
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      return NextResponse.json(
        { error: "An application can only be filed once it is ready to file." },
        { status: 409 },
      );
    }
    throw error;
  }

  await notifyFiled(
    {
      name: application.customer.user.name,
      mobile: application.customer.user.mobile,
      email: application.customer.user.email,
    },
    {
      applicationNo: application.applicationNo,
      referenceNo: parsed.data.referenceNo,
    },
  );

  return NextResponse.json({ ok: true, filedAt: filedAt.toISOString() });
}
