import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { auditIp, writeAudit } from "@/lib/audit";
import { notifyQueryRaised } from "@/lib/notifications/customer";
import { prisma } from "@/lib/prisma";
import { InvalidTransitionError, transition } from "@/lib/status-machine";

/**
 * Raise a query against a section or document. Moves the application to
 * QUERY_RAISED through the status machine, records the query and audit row in
 * one transaction, then tells the customer (best effort).
 */
const bodySchema = z.object({
  message: z
    .string({ error: "Say what you need from the customer, in a sentence" })
    .trim()
    .min(10, "Say what you need from the customer, in a sentence")
    .max(2000),
  relatedSection: z.string().max(120).optional(),
  relatedDocType: z.string().max(120).optional(),
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
      { error: parsed.error.issues[0]?.message ?? "Write a message." },
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
          user: { select: { name: true, mobile: true, email: true } },
        },
      },
    },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ipAddress = await auditIp();

  try {
    await prisma.$transaction(async (tx) => {
      const query = await tx.query.create({
        data: {
          applicationId,
          message: parsed.data.message,
          relatedSection: parsed.data.relatedSection,
          relatedDocType: parsed.data.relatedDocType,
          raisedById: session.user.id,
        },
        select: { id: true },
      });

      await transition(tx, {
        applicationId,
        from: application.status,
        to: "QUERY_RAISED",
        byUserId: session.user.id,
        note: parsed.data.message.slice(0, 200),
      });

      await writeAudit(tx, {
        userId: session.user.id,
        entity: "Query",
        entityId: query.id,
        action: "query_raised",
        before: { status: application.status },
        after: { status: "QUERY_RAISED", message: parsed.data.message },
        ipAddress,
      });
    });
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      return NextResponse.json(
        {
          error:
            "A query can only be raised while the application is under review.",
        },
        { status: 409 },
      );
    }
    throw error;
  }

  await notifyQueryRaised(
    {
      name: application.customer.user.name,
      mobile: application.customer.user.mobile,
      email: application.customer.user.email,
    },
    { applicationNo: application.applicationNo, message: parsed.data.message },
  );

  return NextResponse.json({ ok: true });
}
