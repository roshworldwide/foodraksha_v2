import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { AppStatus } from "@prisma/client";
import { getSession } from "@/lib/auth/guards";
import { auditIp, writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import {
  InvalidTransitionError,
  nextStatuses,
  transition,
} from "@/lib/status-machine";

/**
 * Generic staff status change with an optional note. Every legal transition
 * that is not owned by a richer endpoint (filing, licence issue, queries) runs
 * through here, and every one is validated by the status machine.
 */
const APP_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUERY_RAISED",
  "READY_TO_FILE",
  "FILED",
  "FSSAI_QUERY",
  "ISSUED",
  "REJECTED",
  "CLOSED",
] as const;

const bodySchema = z.object({
  to: z.enum(APP_STATUSES),
  note: z.string().trim().max(2000).optional(),
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
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { status: true },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const to = parsed.data.to as AppStatus;
  const ipAddress = await auditIp();

  try {
    await prisma.$transaction(async (tx) => {
      await transition(tx, {
        applicationId,
        from: application.status,
        to,
        byUserId: session.user.id,
        note: parsed.data.note ?? null,
      });

      await writeAudit(tx, {
        userId: session.user.id,
        entity: "Application",
        entityId: applicationId,
        action: "status_change",
        before: { status: application.status },
        after: { status: to, note: parsed.data.note ?? null },
        ipAddress,
      });
    });
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      return NextResponse.json(
        {
          error: `Cannot move from ${application.status} to ${to}.`,
          allowed: nextStatuses(application.status),
        },
        { status: 409 },
      );
    }
    throw error;
  }

  return NextResponse.json({ ok: true, status: to });
}
