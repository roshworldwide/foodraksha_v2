"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { InvalidTransitionError, transition } from "@/lib/status-machine";

export interface RespondState {
  error?: string;
  ok?: boolean;
}

const responseSchema = z.object({
  queryId: z.string().min(1),
  message: z
    .string()
    .trim()
    .min(1, "Type a reply before sending.")
    .max(2000, "Keep your reply under 2000 characters."),
});

/**
 * The customer answers a staff query in the thread. The query is resolved with
 * their note, and — if it was the last open one and the file was parked in
 * QUERY_RAISED — the application returns to review through the state machine,
 * atomic with its StatusEvent. Ownership is enforced in the query, never
 * assumed from the session.
 */
export async function respondToQuery(
  _previous: RespondState,
  formData: FormData,
): Promise<RespondState> {
  const session = await requireCustomer();

  const parsed = responseSchema.safeParse({
    queryId: formData.get("queryId"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Could not send reply.",
    };
  }

  const query = await prisma.query.findFirst({
    where: {
      id: parsed.data.queryId,
      application: { customer: { userId: session.user.id } },
    },
    select: {
      resolvedAt: true,
      application: { select: { id: true, status: true } },
    },
  });
  if (!query) return { error: "That message no longer exists." };
  if (query.resolvedAt) {
    return { error: "This message has already been answered." };
  }

  const applicationId = query.application.id;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.query.update({
        where: { id: parsed.data.queryId },
        data: { resolvedAt: new Date(), resolutionNote: parsed.data.message },
      });

      // If this clears the last open query and the application is parked
      // waiting on the customer, hand it back to the team for review.
      const openRemaining = await tx.query.count({
        where: { applicationId, resolvedAt: null },
      });
      if (openRemaining === 0 && query.application.status === "QUERY_RAISED") {
        await transition(tx, {
          applicationId,
          from: "QUERY_RAISED",
          to: "UNDER_REVIEW",
          byUserId: session.user.id,
          note: "Customer answered the outstanding queries.",
        });
      }
    });
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      return { error: "This application can no longer be updated." };
    }
    throw error;
  }

  revalidatePath("/messages");
  return { ok: true };
}
