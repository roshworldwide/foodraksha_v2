"use server";

import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import {
  loadQuestionnaire,
  sectionStates,
} from "@/lib/questionnaire/application";

export interface SubmitState {
  error?: string;
}

/**
 * Submitting hands the application to staff: status, timestamp and a
 * StatusEvent, in one transaction. Everything is re-validated here — the
 * client's opinion of "complete" is never the deciding one.
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

  const states = sectionStates(context.sections, context.answers);
  const incomplete = states.filter((state) => !state.isComplete);
  if (incomplete.length > 0) {
    return {
      error: `${incomplete.length} section${
        incomplete.length === 1 ? " is" : "s are"
      } still incomplete: ${incomplete.map((state) => state.title).join(", ")}.`,
    };
  }

  await prisma.$transaction(async (tx) => {
    const current = await tx.application.findUniqueOrThrow({
      where: { id: context.application.id },
      select: { status: true },
    });

    await tx.application.update({
      where: { id: context.application.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        completedSections: states.map((state) => state.key),
      },
    });

    await tx.statusEvent.create({
      data: {
        applicationId: context.application.id,
        fromStatus: current.status,
        toStatus: "SUBMITTED",
        note: "Submitted by the customer from the questionnaire.",
        byUserId: session.user.id,
      },
    });
  });

  redirect("/dashboard?submitted=1");
}
