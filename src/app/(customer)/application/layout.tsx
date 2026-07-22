import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Progress } from "@/components/ui";
import { requireCustomer } from "@/lib/auth/guards";
import {
  completedCount,
  loadQuestionnaire,
  sectionStates,
} from "@/lib/questionnaire/application";
import { QuestionnaireNav } from "./QuestionnaireNav";

/**
 * Desktop-first wizard shell: 260px section list on the left, a 720px content
 * column, and the progress bar pinned to the top of that column.
 */
export default async function ApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireCustomer();
  const context = await loadQuestionnaire(session.user.id);
  if (!context) redirect("/dashboard");

  const states = sectionStates(
    context.sections,
    context.answers,
    context.uploaded,
  );
  const done = completedCount(states);
  const percent = states.length ? Math.round((done / states.length) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-[1180px] items-start gap-9 px-6 py-8">
      <QuestionnaireNav
        sections={states}
        applicationNo={context.application.applicationNo}
      />

      <div className="min-w-0 flex-1">
        <div className="sticky top-16 z-10 -mx-3 bg-bg/[0.88] px-3 pt-3 pb-4 backdrop-blur-[20px]">
          <div className="max-w-[720px]">
            <Progress
              thin
              value={percent}
              label={`Application progress: ${percent} percent`}
            />
            <p className="mt-2 text-footnote text-label-2">
              {done} of {states.length} sections complete
            </p>
          </div>
        </div>

        <div className="max-w-[720px]">{children}</div>
      </div>
    </div>
  );
}
