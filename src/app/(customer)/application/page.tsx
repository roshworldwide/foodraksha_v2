import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/auth/guards";
import {
  firstIncompleteSection,
  loadQuestionnaire,
  sectionStates,
} from "@/lib/questionnaire/application";

/** Resume: straight back to the first section that still needs work. */
export default async function ApplicationIndexPage() {
  const session = await requireCustomer();
  const context = await loadQuestionnaire(session.user.id);
  if (!context) redirect("/dashboard");

  const states = sectionStates(context.sections, context.answers);
  const resumeAt = firstIncompleteSection(states);

  redirect(resumeAt ? `/application/${resumeAt}` : "/application/review");
}
