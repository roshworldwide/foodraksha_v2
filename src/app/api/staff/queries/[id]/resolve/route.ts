import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { auditIp, writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { InvalidTransitionError, transition } from "@/lib/status-machine";

/**
 * Resolve a query. Marks it resolved and, if it was the last open query,
 * returns the application to UNDER_REVIEW. One transaction, audited.
 */
const bodySchema = z.object({
  resolutionNote: z.string().trim().max(2000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id: queryId } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const query = await prisma.query.findUnique({
    where: { id: queryId },
    select: {
      id: true,
      resolvedAt: true,
      application: { select: { id: true, status: true } },
    },
  });
  if (!query) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (query.resolvedAt) {
    return NextResponse.json(
      { error: "This query is already resolved." },
      { status: 409 },
    );
  }

  const ipAddress = await auditIp();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.query.update({
        where: { id: queryId },
        data: {
          resolvedAt: new Date(),
          resolutionNote: parsed.data.resolutionNote ?? null,
        },
      });

      // Any other open queries? Only return to review once they are all closed.
      const openLeft = await tx.query.count({
        where: { applicationId: query.application.id, resolvedAt: null },
      });

      if (openLeft === 0 && query.application.status === "QUERY_RAISED") {
        await transition(tx, {
          applicationId: query.application.id,
          from: "QUERY_RAISED",
          to: "UNDER_REVIEW",
          byUserId: session.user.id,
          note: "Query resolved.",
        });
      }

      await writeAudit(tx, {
        userId: session.user.id,
        entity: "Query",
        entityId: queryId,
        action: "query_raised",
        before: { resolved: false },
        after: { resolved: true, note: parsed.data.resolutionNote ?? null },
        ipAddress,
      });
    });
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      // The status moved under us; the query is still marked resolved.
      return NextResponse.json({ ok: true });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
