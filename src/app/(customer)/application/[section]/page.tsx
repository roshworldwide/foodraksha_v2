import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  SectionForm,
  type MirrorInfo,
} from "@/components/questionnaire/SectionForm";
import { requireCustomer } from "@/lib/auth/guards";
import {
  buildMirrorMap,
  loadQuestionnaire,
  neighbourSections,
} from "@/lib/questionnaire/application";

export const metadata: Metadata = {
  title: "Your application — FoodRaksha",
};

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: sectionKey } = await params;

  const session = await requireCustomer();
  const context = await loadQuestionnaire(session.user.id);
  if (!context) redirect("/dashboard");

  const section = context.sections.find((entry) => entry.key === sectionKey);
  // Not just "unknown" — a section this category does not need is also 404.
  if (!section) notFound();

  const allMirrors = buildMirrorMap(context.sections);
  const mirrors: Record<string, MirrorInfo> = {};
  for (const field of section.fields) {
    const mirror = allMirrors.get(`${section.key}:${field.key}`);
    if (mirror) mirrors[field.key] = mirror;
  }

  const { previous, next } = neighbourSections(context.sections, section.key);
  const position =
    context.sections.findIndex((entry) => entry.key === section.key) + 1;

  return (
    <div className="pt-2">
      <p className="text-footnote text-label-2">
        Section {position} of {context.sections.length}
      </p>
      <h1 className="mt-1.5 text-title-1">{section.title}</h1>
      {section.description && (
        <p className="mt-2 mb-7 text-body text-label-2">
          {section.description}
        </p>
      )}

      <SectionForm
        applicationId={context.application.id}
        sectionKey={section.key}
        fields={section.fields}
        mirrors={mirrors}
        answers={context.answers}
        disabled={!context.isEditable}
        previousHref={previous ? `/application/${previous}` : null}
        nextHref={next ? `/application/${next}` : "/application/review"}
        nextLabel={next ? "Continue" : "Review & submit"}
      />
    </div>
  );
}
