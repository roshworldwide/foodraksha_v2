import { cn } from "@/lib/cn";
import { formatInr, type Plan } from "@/lib/marketing/qualifier";
import { ButtonLink } from "./Button";

/**
 * A service-plan pricing card (Starter / Standard / Elite). The featured plan
 * gets a blue ring and a "Recommended" badge. Prices are real; the government
 * fee is shown as a separate suffix, never baked in.
 */
export function TierCard({
  plan,
  ctaLabel = "Get started",
  ctaHref = "/book",
  className,
}: {
  plan: Plan;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-fr-card border bg-fr-bg p-7",
        plan.featured
          ? "border-transparent shadow-fr-lift ring-2 ring-fr-blue"
          : "border-fr-sep shadow-fr-soft",
        className,
      )}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill bg-fr-blue px-3.5 py-1 text-[12px] font-bold whitespace-nowrap text-white">
          Recommended
        </span>
      )}
      <h3 className="text-title-3 text-fr-ink">{plan.name}</h3>
      <p className="mt-1 min-h-[38px] text-[14px] text-fr-ink-2">{plan.desc}</p>

      <p className="mt-1 flex items-baseline gap-1.5">
        {plan.wasPrice && (
          <span className="text-[16px] font-medium text-fr-ink-3 line-through">
            {formatInr(plan.wasPrice)}
          </span>
        )}
        <span className="text-[38px] font-bold tracking-[-0.02em] text-fr-ink">
          {formatInr(plan.price)}
        </span>
        <span className="text-[14px] font-medium text-fr-ink-2">
          {plan.suffix}
        </span>
      </p>

      <ul className="mt-5 mb-6 flex flex-col">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="relative border-t-[0.5px] border-fr-sep py-2 pl-7 text-[14px] text-fr-ink"
          >
            <span
              aria-hidden="true"
              className="absolute top-2 left-0 font-bold text-fr-green"
            >
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <ButtonLink
          href={ctaHref}
          variant={plan.featured ? "blue" : "soft"}
          fullWidth
        >
          {ctaLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
