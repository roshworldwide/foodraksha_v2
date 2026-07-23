"use server";

import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import {
  loadQuestionnaire,
  sectionStates,
} from "@/lib/questionnaire/application";
import { InvalidTransitionError, transition } from "@/lib/status-machine";

export interface SubmitState {
  error?: string;
}

/**
 * Submitting hands the application to staff. Everything is re-validated here —
 * the client's opinion of "complete" is never the deciding one — and the status
 * change goes through the machine, atomic with its StatusEvent.
 *
 * From DRAFT this is the first submission (-> SUBMITTED). From QUERY_RAISED the
 * customer is answering a query, so it resolves their open queries and returns
 * the file to review (-> UNDER_REVIEW).
 */
export async function submitApplication(
  _previous: SubmitState,
  _formData: FormData,
): Promise<SubmitState> {
  const session = await requireCustomer();
  const context = await loadQuestionnaire(session.user.id);

  if (!context) return { error: "No application to submit." };
  if (!context.isEditable) {
    return { error: "This application has already been submitted." };
  }

  const states = sectionStates(
    context.sections,
    context.answers,
    context.uploaded,
  );
  const incomplete = states.filter((state) => !state.isComplete);
  if (incomplete.length > 0) {
    return {
      error: `${incomplete.length} section${
        incomplete.length === 1 ? " is" : "s are"
      } still incomplete: ${incomplete.map((state) => state.title).join(", ")}.`,
    };
  }

  const from = context.application.status;
  const answeringQuery = from === "QUERY_RAISED";
  const to = answeringQuery ? "UNDER_REVIEW" : "SUBMITTED";

  try {
    await prisma.$transaction(async (tx) => {
      if (answeringQuery) {
        await tx.query.updateMany({
          where: { applicationId: context.application.id, resolvedAt: null },
          data: {
            resolvedAt: new Date(),
            resolutionNote: "Customer updated the application.",
          },
        });
      }

      await transition(tx, {
        applicationId: context.application.id,
        from,
        to,
        byUserId: session.user.id,
        note: answeringQuery
          ? "Customer responded to the query."
          : "Submitted by the customer from the questionnaire.",
        data: {
          completedSections: states.map((state) => state.key),
          ...(answeringQuery ? {} : { submittedAt: new Date() }),
        },
      });
    });
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      return { error: "This application can no longer be submitted." };
    }
    throw error;
  }

  redirect(answeringQuery ? "/dashboard?resolved=1" : "/dashboard?submitted=1");
}
