import { cn } from "@/lib/cn";
import { TRUST } from "@/content/trust";
import { FssaiCalculator } from "./FssaiCalculator";

/**
 * The home page hero, following FR-001 of the reference deck: status pill, a
 * large two-tone headline with the accent word underlined, the lede, the fee
 * calculator, and floating metric cards on the right over a faint grid.
 *
 * The deck puts a single turnover input here that hands off elsewhere. The whole
 * calculator sits inline instead: sending someone to another page to get the
 * answer the hero just promised loses most of them, and turnover alone cannot
 * decide the licence anyway — an importer, a 5-star hotel and a caterer are
 * decided by what they do, not what they earn. So the hero asks the two
 * questions that actually settle it and answers on the spot.
 *
 * A Server Component apart from the calculator. The metric cards come from
 * TRUST.heroStats and any card with a null value drops out, so the hero holds
 * three, two or one without ever showing an invented figure — the deck's own
 * counts (25,386+ businesses, 3.62M+ metric tons, "Trusted by 10,000+") are not
 * in any project source and are therefore absent.
 */

const STAT_TONE: Record<string, { tile: string; value: string }> = {
  blue: { tile: "bg-fr-blue-050 text-fr-blue", value: "text-fr-blue" },
  green: {
    tile: "bg-fr-green-050 text-fr-green-deep",
    value: "text-fr-green-deep",
  },
  orange: {
    tile: "bg-fr-orange-050 text-fr-orange-deep",
    value: "text-fr-orange-deep",
  },
};

const STAT_GLYPH: Record<string, string> = {
  blue: "▤",
  green: "✓",
  orange: "◷",
};

export function Hero() {
  const stats = TRUST.heroStats.filter(
    (stat): stat is typeof stat & { value: string } => stat.value !== null,
  );

  return (
    <header
      className={cn(
        "relative overflow-hidden border-b-[0.5px] border-fr-sep",
        "bg-[radial-gradient(120%_90%_at_78%_-10%,var(--color-fr-blue-050),transparent_58%)]",
      )}
    >
      {/* The deck's faint graph-paper grid. Decorative, so it is masked out
          before it reaches the text on the left. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[linear-gradient(to_right,var(--color-fr-sep)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-fr-sep)_1px,transparent_1px)]",
          "bg-[size:44px_44px] opacity-60",
          "[mask-image:radial-gradient(80%_70%_at_75%_10%,black,transparent_70%)]",
        )}
      />

      <div className="relative mx-auto grid max-w-[1120px] items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-pill border-[0.5px] border-fr-sep bg-fr-bg px-3.5 py-1.5 text-[13.5px] font-medium text-fr-ink shadow-fr-soft">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-fr-green"
            />
            India&rsquo;s FSSAI compliance partner
          </p>

          <h1 className="mt-5 text-[40px] leading-[1.04] font-bold tracking-[-0.032em] text-balance text-fr-ink sm:text-[54px]">
            Powering Safe Food.
            <br />
            Building{" "}
            <span className="relative whitespace-nowrap text-fr-blue">
              Trusted
              {/* The deck underlines the accent word with a hand-drawn swoosh. */}
              <svg
                aria-hidden="true"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-[9px] w-full text-fr-blue/40"
              >
                <path
                  d="M2 8c40-5 100-6 196-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            Businesses.
          </h1>

          <p className="mt-6 max-w-[520px] text-[19px] leading-relaxed tracking-[-0.01em] text-fr-ink-2">
            From FSSAI registration to compliance and beyond — we make it
            simple, fast and hassle-free.
          </p>

          <FssaiCalculator
            title="Check your licence & fee"
            className="mt-7 max-w-[520px]"
          />
        </div>

        {/* Metric cards, staggered as in the deck. */}
        {stats.length > 0 && (
          <ul className="flex flex-col gap-4 sm:flex-row sm:items-start lg:justify-end">
            {stats.map((stat, index) => {
              const tone = STAT_TONE[stat.tone] ?? STAT_TONE.blue;
              return (
                <li
                  key={stat.label}
                  className={cn(
                    "flex-1 rounded-[20px] border-[0.5px] border-fr-sep bg-fr-bg p-5 shadow-fr-lift",
                    // Stagger on desktop only, so the mobile stack stays even.
                    index === 1 && "sm:-mt-6",
                    index === 2 && "sm:mt-4",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-11 items-center justify-center rounded-[13px] text-[19px]",
                      tone.tile,
                    )}
                  >
                    {STAT_GLYPH[stat.tone] ?? "▤"}
                  </span>
                  <p className="mt-3.5 text-[14px] leading-tight font-semibold text-fr-ink">
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      "mt-1.5 text-[30px] leading-none font-bold tracking-[-0.03em] tabular-nums",
                      tone.value,
                    )}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-[13px] text-fr-ink-2">
                    {stat.sublabel}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </header>
  );
}
