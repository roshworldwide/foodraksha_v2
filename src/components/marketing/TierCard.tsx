import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ButtonLink } from "./Button";

/**
 * A pricing / licence-tier card. Used on the pricing strip and the qualifier
 * result. The featured tier gets a blue ring and a "Recommended" flag.
 */
export function TierCard({
  name,
  priceFrom,
  timeline,
  summary,
  features,
  featured = false,
  ctaLabel = "Get started",
  ctaHref = "/book",
  className,
}: {
  name: string;
  /** e.g. "from ₹4,999". */
  priceFrom: string;
  timeline: string;
  summary: string;
  features?: string[];
  featured?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-fr-card border bg-fr-bg p-6",
        featured
          ? "border-transparent shadow-fr-lift ring-2 ring-fr-blue"
          : "border-fr-sep shadow-fr-soft",
        className,
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-6 rounded-pill bg-fr-blue px-3 py-1 text-[12px] font-semibold text-white">
          Recommended
        </span>
      )}
      <h3 className="text-title-3 text-fr-ink">{name}</h3>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="text-title-1 font-bold tracking-[-0.02em] text-fr-ink">
          {priceFrom}
        </span>
      </p>
      <p className="mt-1 text-[14px] text-fr-ink-2">{timeline}</p>
      <p className="mt-3 text-[15px] leading-relaxed text-fr-ink-2">
        {summary}
      </p>

      {features && features.length > 0 && (
        <ul className="mt-5 flex flex-col gap-2.5">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-[15px] text-fr-ink"
            >
              <CheckIcon />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 pt-2">
        <ButtonLink
          href={ctaHref}
          variant={featured ? "blue" : "soft"}
          fullWidth
        >
          {ctaLabel}
        </ButtonLink>
      </div>
    </div>
  );
}

function CheckIcon(): ReactNode {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 size-[18px] shrink-0 text-fr-green"
    >
      <path
        d="M4 10.5 8 14.5 16 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
