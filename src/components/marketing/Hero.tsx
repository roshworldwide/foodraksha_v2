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
 * The home-page hero — a dark, cinematic treatment over a looping company
 * video. White headline with bright blue→green gradient accents, glassy chips,
 * and the eligibility checker + verified stat cards as clean white surfaces
 * floating over the footage. A Server Component apart from the checker.
 *
 * Unverified figures (25,386+ etc.) remain null in config and simply don't
 * render; only the numbers we can stand behind appear.
 */

const STAT_TONE: Record<string, string> = {
  blue: "bg-gradient-to-br from-fr-blue to-fr-blue-deep text-white",
  green: "bg-gradient-to-br from-fr-green to-fr-green-deep text-white",
  orange: "bg-gradient-to-br from-fr-orange to-fr-orange-deep text-white",
};

const STAT_ICON: Record<string, typeof Store> = {
  blue: Store,
  green: ClipboardCheck,
  orange: Wheat,
};

function visibleStats(): (HeroStat & { value: string })[] {
  const hasValue = (stat: HeroStat): stat is HeroStat & { value: string } =>
    stat.value !== null;
  return [
    ...CLIENT_HERO_STATS.filter(hasValue),
    ...TRUST.heroStats.filter(hasValue),
  ].slice(0, 3);
}

/** Under-hero trust strip. Real regulatory marks where we have the logo. */
const ALIGNED: { label: string; note: string; logo: string | null }[] = [
  {
    label: "FSSAI",
    note: "Food Safety & Standards Authority of India",
    logo: "/media/logo-fssai.png",
  },
  { label: "FoSTaC", note: "Food Safety Training & Certification", logo: null },
  {
    label: "NABL",
    note: "Accredited testing laboratories",
    logo: "/media/logo-nabl.png",
  },
];

const CHIPS = [
  { icon: BadgeCheck, label: "Aligned with FSSAI", tone: "text-[#3ddc84]" },
  { icon: Zap, label: "24-Hour Processing", tone: "text-[#f6b73c]" },
  { icon: Lock, label: "100% Secure", tone: "text-[#5b9bff]" },
];

export function Hero() {
  const stats = visibleStats();

  return (
    <div
      className="relative overflow-hidden bg-fr-night pt-10 pb-16 lg:pt-16 lg:pb-20"
      id="home"
    >
      {/* Background company video — muted, looping, ambient. Drop a real clip at
          public/media/hero-loop.mp4 and it plays automatically. */}
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
        {/* Cinematic dark scrims — darkest under the copy, clearing to the right. */}
        <div className="absolute inset-0 bg-gradient-to-r from-fr-night/94 via-fr-night/82 to-fr-night/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-fr-night/70 via-transparent to-fr-night/95" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="fr-glass mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[12.5px] font-semibold text-white shadow-fr-lift">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-fr-green opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-fr-green" />
          </span>
          India&rsquo;s Leading FSSAI Compliance Partner
          {TRUST.rating !== null && (
            <span className="font-bold text-[#3ddc84]">★ {TRUST.rating}/5</span>
          )}
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left — copy + checker */}
          <div className="space-y-6 lg:col-span-6">
            <h1 className="fr-display fr-display-tight text-[52px] text-balance text-white sm:text-[68px] lg:text-[84px]">
              Powering <span className="text-[#5b9bff]">Safe Food.</span>
              <br />
              Building Trusted Brands.
            </h1>

            <p className="max-w-xl text-[16px] leading-relaxed font-medium text-white/75 sm:text-[18px]">
              From FSSAI registration to compliance audits and food safety
              training — we make the entire process{" "}
              <strong className="font-bold text-white">
                simple, fast and hassle-free
              </strong>
              .
            </p>

            <div className="flex flex-wrap gap-3 text-[13px] font-semibold text-white">
              {CHIPS.map((chip) => (
                <span
                  key={chip.label}
                  className="fr-glass flex items-center gap-2 rounded-full px-3.5 py-2"
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

          {/* Right — verified stat cards floating over the footage */}
          <div className="relative lg:col-span-6">
            <div className="relative rounded-3xl p-2 sm:p-4">
              {HERO_TRUST_BADGE && (
                <div className="mb-6 flex justify-end">
                  <div className="fr-glass inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-white">
                    <span
                      aria-hidden="true"
                      className="flex size-7 items-center justify-center rounded-full bg-fr-green/20 text-[#3ddc84]"
                    >
                      <ShieldCheck className="size-4" />
                    </span>
                    <span className="text-[12.5px] font-semibold text-white/80">
                      Trusted by{" "}
                      <strong className="font-extrabold text-white">
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
                    const tile = STAT_TONE[stat.tone] ?? STAT_TONE.blue;
                    const Icon = STAT_ICON[stat.tone] ?? Store;
                    return (
                      <li
                        key={stat.label}
                        className="fr-elevate rounded-2xl border border-white/10 bg-fr-bg p-5"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mb-3 flex size-11 items-center justify-center rounded-xl",
                            tile,
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
                              <TrendingUp aria-hidden="true" className="size-3" />
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

      {/* Aligned strip — a bright surface so the regulatory logos read on dark. */}
      <div className="relative z-10 mx-auto mt-14 max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="fr-elevate flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-2xl border border-white/10 bg-fr-bg/95 px-6 py-5 backdrop-blur">
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
                className="h-9 w-auto object-contain opacity-85 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-10"
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
