import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { auditIp, writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

/**
 * Approve a document, or reject it with a reason the customer will read on
 * their own dashboard. A rejection without a reason is useless to them, so
 * the reason is required here rather than optional-with-a-default.
 */
const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({
    action: z.literal("reject"),
    reason: z
      .string({ error: "Tell the customer what is wrong, in a sentence" })
      .trim()
      .min(10, "Tell the customer what is wrong, in a sentence")
      .max(500),
  }),
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Choose approve or reject.",
      },
      { status: 400 },
    );
  }

  const existing = await prisma.document.findUnique({
    where: { id },
    select: { id: true, status: true, rejectionReason: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const review = parsed.data;
  const approve = review.action === "approve";
  const ipAddress = await auditIp();

  const document = await prisma.$transaction(async (tx) => {
    const updated = await tx.document.update({
      where: { id },
      data: {
        status: approve ? "APPROVED" : "REJECTED",
        rejectionReason: review.action === "reject" ? review.reason : null,
        reviewedAt: new Date(),
        reviewedById: session.user.id,
      },
      select: {
        id: true,
        status: true,
        rejectionReason: true,
        docType: true,
        applicationId: true,
      },
    });

    await writeAudit(tx, {
      userId: session.user.id,
      entity: "Document",
      entityId: id,
      action: "document_review",
      before: {
        status: existing.status,
        rejectionReason: existing.rejectionReason,
      },
      after: {
        status: updated.status,
        rejectionReason: updated.rejectionReason,
        docType: updated.docType,
      },
      ipAddress,
    });

    return updated;
  });

  return NextResponse.json({ document });
}
