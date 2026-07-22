import { ButtonLink } from "@/components/ui";

/**
 * Back / Continue for sections that are not questionnaire forms — documents,
 * photo and signature. These save as they go, so there is nothing to flush.
 */
export function SectionFooter({
  previousHref,
  nextHref,
  nextLabel,
}: {
  previousHref: string | null;
  nextHref: string;
  nextLabel: string;
}) {
  return (
    <div className="mt-8 flex items-center gap-3 border-t-[0.5px] border-separator pt-6">
      <ButtonLink href={previousHref ?? "/dashboard"} variant="quiet">
        {previousHref ? "Back" : "Dashboard"}
      </ButtonLink>
      <ButtonLink href={nextHref}>{nextLabel}</ButtonLink>
    </div>
  );
}
