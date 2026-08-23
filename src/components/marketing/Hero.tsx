import {
  BadgeCheck,
  ClipboardCheck,
  Lock,
  ShieldCheck,
  Store,
  TrendingUp,
  Wheat,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  CLIENT_HERO_STATS,
  HERO_TRUST_BADGE,
  TRUST,
  type HeroStat,
} from "@/content/trust";
import { EligibilityChecker } from "./EligibilityChecker";

/**
 * The home-page hero, matched to docs/client-design/index.html (the source of
 * truth — their components/* diverge from it): badge, headline with
 * `.gradient-text` on "Safe Food." and `.underline-swoosh` on "Trusted", subhead
 * and the compact Eligibility Checker on the left; stat cards on the right; an
 * "Aligned with" trust strip beneath.
 *
 * A Server Component apart from the checker.
 *
 * On the numbers: FR-001 shows "Businesses Licensed 25,386+", "Active Audits
 * 1,248+", "Food Certified 3.62M+" with +12/18/15% growth pills, a "Trusted by
 * 10,000+ Businesses" badge and a "★ 4.9/5" rating in the eyebrow. None of those
 * appear in any project source. They live in config as null (CLIENT_HERO_STATS,
 * HERO_TRUST_BADGE, TRUST.rating) and each hides itself, so the layout is FR-001's
 * but nothing invented ships. The cards that do render are the figures we can
 * stand behind. The "Real-time data" line is likewise omitted while the numbers
 * are static — it would be a claim about the data, not decoration.
 *
 * FR-001 shows an India map behind the cards. Their HeroSection has no such
 * asset — the right column is a gradient panel and the map exists only in the
 * mockup image — so the gradient is what is ported. Drop an SVG in and it sits
 * behind the same grid.
 */

const STAT_TONE: Record<string, { tile: string; plus: string }> = {
  blue: { tile: "bg-fr-blue-050 text-fr-blue", plus: "text-fr-blue" },
  green: {
    tile: "bg-fr-green-050 text-fr-green-deep",
    plus: "text-fr-green-deep",
  },
  orange: {
    tile: "bg-fr-orange-050 text-fr-orange-deep",
    plus: "text-fr-orange-deep",
  },
};

const STAT_ICON: Record<string, typeof Store> = {
  blue: Store,
  green: ClipboardCheck,
  orange: Wheat,
};

/** Their labels first when supplied, then the verified ones. Max three cards. */
function visibleStats(): (HeroStat & { value: string })[] {
  const hasValue = (stat: HeroStat): stat is HeroStat & { value: string } =>
    stat.value !== null;
  return [
    ...CLIENT_HERO_STATS.filter(hasValue),
    ...TRUST.heroStats.filter(hasValue),
  ].slice(0, 3);
}

/** FR-001's under-hero strip. Real regulatory marks where we have the logo. */
const ALIGNED: { label: string; note: string; logo: string | null }[] = [
  {
    label: "FSSAI",
    note: "Food Safety & Standards Authority of India",
    logo: "/media/logo-fssai.png",
  },
  {
    label: "FoSTaC",
    note: "Food Safety Training & Certification",
    logo: null,
  },
  {
    label: "NABL",
    note: "Accredited testing laboratories",
    logo: "/media/logo-nabl.png",
  },
];

export function Hero() {
  const stats = visibleStats();

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-b from-fr-panel via-fr-blue-050/40 to-fr-panel pt-10 pb-16 lg:pt-16"
      id="home"
    >
      {/* Background company video — muted, looping, ambient. Until a real clip
          is provided the poster image shows; drop the file at
          public/media/hero-loop.mp4 (H.264 MP4, ideally a WebM too) and it
          plays automatically. */}
      <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/hero-poster.jpg"
          className="h-full w-full object-cover"
        >
          <source src="/media/hero-loop.mp4" type="video/mp4" />
        </video>
        {/* Legibility scrims — strongest under the copy, clearing to the right,
            and a soft top/bottom fade so the footage blends into the page. */}
        <div className="absolute inset-0 bg-gradient-to-r from-fr-panel/95 via-fr-panel/85 to-fr-panel/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-fr-panel/70 via-transparent to-fr-panel/90" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-fr-sep bg-fr-bg/80 px-4 py-2 text-[12.5px] font-semibold text-fr-ink shadow-fr-soft backdrop-blur-sm">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-fr-green opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-fr-green" />
          </span>
          India&rsquo;s Leading FSSAI Compliance Partner
          {/* The mockup's "★ 4.9/5" renders only with a verified rating. */}
          {TRUST.rating !== null && (
            <span className="font-bold text-fr-green-deep">
              ★ {TRUST.rating}/5
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left — copy + checker */}
          <div className="space-y-6 lg:col-span-6">
            <h1 className="text-[34px] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-fr-ink sm:text-[42px] lg:text-[52px]">
              Powering <span className="gradient-text">Safe Food.</span>
              <br />
              Building <span className="underline-swoosh">Trusted</span> Brands.
            </h1>

            <p className="max-w-xl text-[16px] leading-relaxed font-medium text-fr-ink-2 sm:text-[18px]">
              From FSSAI registration to compliance audits and food safety
              training — we make the entire process{" "}
              <strong className="font-bold text-fr-ink">
                simple, fast and hassle-free
              </strong>
              .
            </p>

            <div className="flex flex-wrap gap-3 text-[13px] font-semibold text-fr-ink">
              {[
                {
                  icon: BadgeCheck,
                  label: "Aligned with FSSAI",
                  tone: "text-fr-green-deep",
                },
                {
                  icon: Zap,
                  label: "24-Hour Processing",
                  tone: "text-fr-amber",
                },
                {
                  icon: Lock,
                  label: "100% Secure",
                  tone: "text-fr-blue",
                },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="flex items-center gap-2 rounded-full border border-fr-sep bg-fr-bg px-3 py-2 shadow-fr-soft"
                >
                  <chip.icon
                    aria-hidden="true"
                    className={cn("size-4", chip.tone)}
                  />
                  {chip.label}
                </span>
              ))}
            </div>

            <EligibilityChecker />
          </div>

          {/* Right — stat cards over the gradient panel */}
          <div className="relative lg:col-span-6">
            <div className="relative rounded-3xl bg-gradient-to-b from-fr-blue-050/60 to-transparent p-4 sm:p-8">
              {HERO_TRUST_BADGE && (
                <div className="mb-6 flex justify-end">
                  <div className="inline-flex items-center gap-3 rounded-full border border-fr-sep bg-fr-bg px-5 py-2.5 shadow-fr-lift">
                    <span
                      aria-hidden="true"
                      className="flex size-7 items-center justify-center rounded-full bg-fr-green-050 text-fr-green-deep"
                    >
                      <ShieldCheck className="size-4" />
                    </span>
                    <span className="text-[12.5px] font-semibold text-fr-ink-2">
                      Trusted by{" "}
                      <strong className="font-extrabold text-fr-ink">
                        {HERO_TRUST_BADGE}
                      </strong>{" "}
                      Businesses
                    </span>
                  </div>
                </div>
              )}

              {stats.length > 0 && (
                <ul className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {stats.map((stat) => {
                    const tone = STAT_TONE[stat.tone] ?? STAT_TONE.blue;
                    const Icon = STAT_ICON[stat.tone] ?? Store;
                    return (
                      <li
                        key={stat.label}
                        className="rounded-2xl border border-fr-sep bg-fr-bg p-5 shadow-fr-lift"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mb-3 flex size-11 items-center justify-center rounded-xl",
                            tone.tile,
                          )}
                        >
                          <Icon className="size-5" />
                        </span>
                        <p className="text-[12px] font-bold text-fr-ink">
                          {stat.label}
                        </p>
                        <p className="mt-2 text-[26px] leading-none font-extrabold tracking-[-0.03em] text-fr-ink lg:text-[30px]">
                          {stat.value}
                        </p>
                        <p className="mt-1.5 text-[11.5px] text-fr-ink-2">
                          {stat.sublabel}
                        </p>
                        {stat.delta && (
                          <div className="mt-4 flex justify-end border-t border-fr-sep pt-3">
                            <span className="flex items-center gap-1 rounded-full bg-fr-green-050 px-2.5 py-1 text-[11px] font-bold text-fr-green-deep">
                              <TrendingUp
                                aria-hidden="true"
                                className="size-3"
                              />
                              {stat.delta}
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Under-hero trust strip (FR-001) */}
      <div className="relative z-10 mx-auto mt-12 max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-2xl border border-fr-sep bg-fr-bg/70 px-6 py-5 backdrop-blur-sm">
          <span className="text-[11.5px] font-bold tracking-[0.14em] text-fr-ink-2 uppercase">
            Aligned with
          </span>
          {ALIGNED.map((body) =>
            body.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={body.label}
                src={body.logo}
                alt={`${body.label} — ${body.note}`}
                title={`${body.label} — ${body.note}`}
                className="h-9 w-auto object-contain opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-10"
              />
            ) : (
              <span key={body.label} className="text-center" title={body.note}>
                <span className="block text-[16px] font-extrabold tracking-tight text-fr-ink">
                  {body.label}
                </span>
                <span className="block text-[10px] text-fr-ink-2">
                  {body.note}
                </span>
              </span>
            ),
          )}
          <span className="flex items-center gap-2 text-[13px] font-semibold text-fr-ink">
            <ShieldCheck aria-hidden="true" className="size-4 text-fr-blue" />
            100% Legal &amp; Compliant
          </span>
        </div>
      </div>
    </div>
  );
}
