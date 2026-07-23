import type { AppStatus, Prisma } from "@prisma/client";

/**
 * The application status pipeline — the one place legal transitions are
 * defined and enforced.
 *
 *   DRAFT → SUBMITTED → UNDER_REVIEW → (QUERY_RAISED ⇄) → READY_TO_FILE →
 *   FILED → (FSSAI_QUERY ⇄) → ISSUED → CLOSED
 *
 * REJECTED and CLOSED are terminal. An application can be rejected from any
 * live review state; nothing moves out of a terminal state.
 */

const TRANSITIONS: Record<AppStatus, AppStatus[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["QUERY_RAISED", "READY_TO_FILE", "REJECTED"],
  // A raised query is answered by returning to review.
  QUERY_RAISED: ["UNDER_REVIEW", "REJECTED"],
  READY_TO_FILE: ["FILED", "UNDER_REVIEW", "REJECTED"],
  // The authority can query, grant, or reject after filing.
  FILED: ["FSSAI_QUERY", "ISSUED", "REJECTED"],
  FSSAI_QUERY: ["FILED", "REJECTED"],
  ISSUED: ["CLOSED"],
  REJECTED: [],
  CLOSED: [],
};

export function canTransition(from: AppStatus, to: AppStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: AppStatus): AppStatus[] {
  return TRANSITIONS[from];
}

export class InvalidTransitionError extends Error {
  constructor(
    readonly from: AppStatus,
    readonly to: AppStatus,
  ) {
    super(`Cannot move an application from ${from} to ${to}.`);
    this.name = "InvalidTransitionError";
  }
}

export interface TransitionInput {
  applicationId: string;
  from: AppStatus;
  to: AppStatus;
  byUserId: string;
  note?: string | null;
  /** Extra fields to set on the application alongside the status. */
  data?: Prisma.ApplicationUpdateInput;
}

/**
 * Apply a transition inside an existing transaction. Rejects an illegal move
 * before touching anything, and writes the status change and its StatusEvent
 * together — they can never come apart.
 *
 * The `from` is used as an optimistic guard in the WHERE clause: if the status
 * moved under us, the update matches no row and we throw rather than record a
 * transition that did not happen.
 */
export async function transition(
  tx: Prisma.TransactionClient,
  input: TransitionInput,
): Promise<void> {
  if (!canTransition(input.from, input.to)) {
    throw new InvalidTransitionError(input.from, input.to);
  }

  const updated = await tx.application.updateMany({
    where: { id: input.applicationId, status: input.from },
    data: { ...input.data, status: input.to },
  });

  if (updated.count !== 1) {
    // Someone else changed the status between our read and our write.
    throw new InvalidTransitionError(input.from, input.to);
  }

  await tx.statusEvent.create({
    data: {
      applicationId: input.applicationId,
      fromStatus: input.from,
      toStatus: input.to,
      note: input.note ?? null,
      byUserId: input.byUserId,
    },
  });
}

/* ─────────────────────────────────────────── customer-facing timeline */

/**
 * The milestones a customer sees. Internal-only states (READY_TO_FILE, the
 * exact review sub-states) never appear here — the customer sees a clean line,
 * not our workflow.
 */
export const CUSTOMER_MILESTONES = [
  { key: "created", label: "Account created" },
  { key: "submitted", label: "Details submitted" },
  { key: "review", label: "Under review" },
  { key: "filed", label: "Filed with FSSAI" },
  { key: "issued", label: "Licence issued" },
] as const;

export type MilestoneKey = (typeof CUSTOMER_MILESTONES)[number]["key"];

/** Where a given status sits on the customer timeline. */
export function milestoneForStatus(status: AppStatus): MilestoneKey {
  switch (status) {
    case "DRAFT":
      return "created";
    case "SUBMITTED":
      return "submitted";
    case "UNDER_REVIEW":
    case "QUERY_RAISED":
    case "READY_TO_FILE":
      return "review";
    case "FILED":
    case "FSSAI_QUERY":
      return "filed";
    case "ISSUED":
    case "CLOSED":
      return "issued";
    case "REJECTED":
      // Rejection is shown separately; on the line it rests at review.
      return "review";
  }
}
