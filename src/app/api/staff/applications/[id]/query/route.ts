import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { auditIp, writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

/**
 * Raise a query: the application goes back to the customer, who can edit it
 * again. Status change and query are one transaction, both audited.
 */
const bodySchema = z.object({
  message: z
    .string({ error: "Say what you need from the customer, in a sentence" })
    .trim()
    .min(10, "Say what you need from the customer, in a sentence")
    .max(2000),
  relatedSection: z.string().max(120).optional(),
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
    select: { id: true, status: true },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ipAddress = await auditIp();

  await prisma.$transaction(async (tx) => {
    const query = await tx.query.create({
      data: {
        applicationId,
        message: parsed.data.message,
        relatedSection: parsed.data.relatedSection,
        raisedById: session.user.id,
      },
      select: { id: true },
    });

    await tx.application.update({
      where: { id: applicationId },
      data: { status: "QUERY_RAISED" },
    });

    await tx.statusEvent.create({
      data: {
        applicationId,
        fromStatus: application.status,
        toStatus: "QUERY_RAISED",
        note: parsed.data.message.slice(0, 200),
        byUserId: session.user.id,
      },
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

  return NextResponse.json({ ok: true });
}
