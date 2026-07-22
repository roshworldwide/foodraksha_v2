import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  List,
  ListGroup,
  ListGroupHeader,
  StatusPill,
} from "@/components/ui";
import { requireCustomer } from "@/lib/auth/guards";
import {
  buildMirrorMap,
  loadQuestionnaire,
  ownFields,
  sectionStates,
} from "@/lib/questionnaire/application";
import { formatAnswer } from "@/lib/questionnaire/format";
import { APP_STATUS } from "@/lib/status";
import { ReviewSubmit } from "./ReviewSubmit";

export const metadata: Metadata = {
  title: "Review your application — FoodRaksha",
};

export default async function ReviewPage() {
  const session = await requireCustomer();
  const context = await loadQuestionnaire(session.user.id);
  if (!context) redirect("/dashboard");

  const states = sectionStates(context.sections, context.answers);
  const incomplete = states.filter((state) => !state.isComplete);
  const mirrors = buildMirrorMap(context.sections);
  const status = APP_STATUS[context.application.status];

  return (
    <div className="pt-2 pb-4">
      <h1 className="text-title-1">Review your application</h1>
      <p className="mt-2 mb-7 text-body text-label-2">
        Read it back the way our team will. Anything wrong here becomes wrong on
        all {context.sections.length > 0 ? "17 government forms" : "forms"}, so
        it is worth a minute.
      </p>

      {!context.isEditable && (
        <Card className="mb-6">
          <div className="mb-2">
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
          </div>
          <p className="text-body text-label-2">
            This application is with our team. Answers are read-only until they
            come back to you.
          </p>
        </Card>
      )}

      {incomplete.length > 0 && context.isEditable && (
        <Card className="mb-6">
          <h2 className="text-title-3">
            {incomplete.length} section{incomplete.length === 1 ? "" : "s"} left
          </h2>
          <p className="mt-1.5 mb-3 text-body text-label-2">
            Finish these and the submit button turns on.
          </p>
          <ul className="flex flex-wrap gap-2">
            {incomplete.map((state) => (
              <li key={state.key}>
                <Link
                  href={`/application/${state.key}`}
                  className="inline-block rounded-pill bg-quiet px-[13px] py-1.5 text-footnote font-semibold hover:bg-quiet-hover"
                >
                  {state.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {context.sections.map((section) => {
        const fields = ownFields(section, mirrors);
        return (
          <ListGroup key={section.key}>
            <div className="flex items-baseline justify-between gap-4 pr-4">
              <ListGroupHeader className="pr-0">
                {section.title}
              </ListGroupHeader>
              <Link
                href={`/application/${section.key}`}
                className="text-footnote font-semibold text-label underline"
              >
                Edit
              </Link>
            </div>

            <List>
              {fields.map((field) => {
                const lines = formatAnswer(field, context.answers[field.key]);
                return (
                  <li
                    key={field.key}
                    className="border-b-[0.5px] border-separator px-4 py-[13px] last:border-b-0"
                  >
                    <p className="text-footnote text-label-2">{field.label}</p>
                    {lines.length > 0 ? (
                      lines.map((line, index) => (
                        <p
                          key={`${field.key}-${index}`}
                          className="mt-0.5 text-[17px] tracking-[-0.011em]"
                        >
                          {line}
                        </p>
                      ))
                    ) : (
                      <p className="mt-0.5 text-[17px] tracking-[-0.011em] text-label-3">
                        {field.required ? "Still needed" : "Not answered"}
                      </p>
                    )}
                  </li>
                );
              })}
            </List>
          </ListGroup>
        );
      })}

      {context.isEditable && (
        <div className="mt-8 border-t-[0.5px] border-separator pt-6">
          <ReviewSubmit blocked={incomplete.length > 0} />
        </div>
      )}
    </div>
  );
}
