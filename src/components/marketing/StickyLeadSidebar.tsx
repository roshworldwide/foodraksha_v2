import { Suspense } from "react";
import { cn } from "@/lib/cn";
import { LeadForm, type LeadFormProps } from "./LeadForm";

/**
 * The lead form as a sticky sidebar — the Vakilsearch pattern. Drop it into the
 * right column of a two-column grid on any service page: it pins beside the
 * scrolling content on desktop and floats to the top on mobile (form-first).
 *
 * It is a thin, reusable wrapper around <LeadForm> — all LeadForm props pass
 * through (qualifier on/off, serviceInterest, preferredTime, labels). The form
 * itself is always compact so it fits a narrow column.
 */
export function StickyLeadSidebar({
  className,
  ...leadFormProps
}: LeadFormProps) {
  return (
    <aside
      className={cn(
        "order-first lg:order-last lg:sticky lg:top-24 lg:self-start",
        className,
      )}
    >
      <Suspense
        fallback={
          <div className="h-[520px] rounded-fr-card border-[0.5px] border-fr-sep bg-fr-panel" />
        }
      >
        <LeadForm compact {...leadFormProps} />
      </Suspense>
    </aside>
  );
}
