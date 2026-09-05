import Link from "next/link";
import { FileBadge, GraduationCap, ScanSearch } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  AUTHORITIES,
  HOME_PROCESS_STEPS,
  SERVICE_CARDS,
  type HomeProcessStep,
  type ServiceCard,
} from "@/content/home-sections";
import {
  KINDS_OF_BUSINESS,
  KOB_GROUPS,
  kobsInGroup,
} from "@/content/fssai-fees";

/**
 * The home-page sections from the client's build, rebuilt on this codebase's
 * server-rendered foundation.
 *
 * Format follows docs/client-design/index.html — the source of truth, not their
 * components/*, which diverge from it: a pill eyebrow in brandBlue on
 * brandBlueLight, an extrabold heading in the heading face with a `.gradient-text`
 * second clause, then a card grid — rounded-2xl, hairline border, soft shadow, a
 * tinted icon tile that inverts on hover, and an accent-coloured link with an
 * arrow.
 *
 * These are Server Components: their originals were "use client" only to carry
 * AOS scroll animations, which are not worth the JS or the layout shift.
 */

/* ─────────────────────────────────────────── shared bits */

const TONE: Record<
  string,
  { tile: string; hover: string; text: string; ring: string }
> = {
  blue: {
    tile: "bg-gradient-to-br from-fr-blue to-fr-blue-deep text-white",
    hover: "",
    text: "text-fr-blue",
    ring: "ring-fr-blue/25",
  },
  green: {
    tile: "bg-gradient-to-br from-fr-green to-fr-green-deep text-white",
    hover: "",
    text: "text-fr-green-deep",
    ring: "ring-fr-green/25",
  },
  orange: {
    tile: "bg-gradient-to-br from-fr-orange to-fr-orange-deep text-white",
    hover: "",
    text: "text-fr-orange-deep",
    ring: "ring-fr-orange/25",
  },
  violet: {
    tile: "bg-gradient-to-br from-fr-violet to-fr-violet-deep text-white",
    hover: "",
    text: "text-fr-violet-deep",
    ring: "ring-fr-violet/25",
  },
};

/**
 * Heading accents. `gradient` is index.html's `.gradient-text` (blue→green),
 * which is the house treatment for the second clause of a section heading —
 * Services, the ledger and the government band all use it.
 */
const ACCENT_TONE: Record<"blue" | "green" | "gradient", string> = {
  blue: "text-fr-blue",
  green: "text-fr-green-deep",
  gradient: "gradient-text",
};

/** The eyebrow accent colour. Blue by default; the process band uses green. */
const EYEBROW_INK: Record<"blue" | "green", string> = {
  blue: "text-fr-blue",
  green: "text-fr-green-deep",
};
const EYEBROW_RULE: Record<"blue" | "green", string> = {
  blue: "bg-fr-blue",
  green: "bg-fr-green-deep",
};

/** The client's pill eyebrow + extrabold two-tone heading. */
export function SectionIntro({
  eyebrow,
  eyebrowTone = "blue",
  title,
  accent,
  accentTone = "blue",
  lede,
  align = "center",
  className,
}: {
  eyebrow: string;
  eyebrowTone?: "blue" | "green";
  title: string;
  accent?: string;
  accentTone?: "blue" | "green" | "gradient";
  lede?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn("mb-12", align === "center" && "text-center", className)}
    >
      <span
        className={cn(
          "fr-eyebrow inline-flex items-center gap-3 text-[13px]",
          align === "center" && "justify-center",
          EYEBROW_INK[eyebrowTone],
        )}
      >
        <span
          aria-hidden="true"
          className={cn("h-px w-7", EYEBROW_RULE[eyebrowTone])}
        />
        {eyebrow}
      </span>
      <h2 className="fr-display mt-4 text-[34px] text-balance text-fr-ink lg:text-[50px]">
        {title}{" "}
        {accent && <span className={ACCENT_TONE[accentTone]}>{accent}</span>}
      </h2>
      {lede && (
        <p
          className={cn(
            "mt-4 text-[17px] leading-relaxed text-fr-ink-2",
            align === "center" && "mx-auto max-w-[640px]",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

function Shell({
  id,
  tinted = false,
  children,
}: {
  id?: string;
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-20 py-16 lg:py-20", tinted && "bg-fr-cream")}
    >
      <div className="mx-auto max-w-[1120px] px-6">{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────── 1 · Services */

/** lucide equivalents for the HTML's FontAwesome glyphs, per the spec. */
const SERVICE_ICON: Record<ServiceCard["icon"], typeof FileBadge> = {
  registration: FileBadge, // fa-file-certificate
  audit: ScanSearch, // fa-magnifying-glass-chart
  training: GraduationCap, // fa-graduation-cap
};

/** Real work photos give the service grid life instead of a wall of icons. */
const SERVICE_PHOTO: Record<ServiceCard["icon"], string> = {
  registration: "/media/img-registration.jpg",
  audit: "/media/img-audit.jpg",
  training: "/media/img-training.jpg",
};

function ServiceTile({ card }: { card: ServiceCard }) {
  const tone = TONE[card.tone];
  const Icon = SERVICE_ICON[card.icon];
  const photo = SERVICE_PHOTO[card.icon];
  return (
    <Link
      href={card.href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[20px] border-[0.5px] border-fr-sep bg-fr-bg shadow-fr-soft",
        "transition-[transform,box-shadow] duration-300 ease-ios",
        "hover:-translate-y-1.5 hover:shadow-fr-lift",
      )}
    >
      {/* real work photo — quiet at rest, gently zooms on hover */}
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover transition-transform duration-[600ms] ease-ios group-hover:scale-[1.07]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-fr-navy/55 via-fr-navy/10 to-transparent"
        />
      </div>

      <div className="relative flex flex-1 flex-col p-6">
        {/* gradient icon tile lifts over the photo edge with a white ring */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute -top-8 left-6 flex size-14 items-center justify-center rounded-[16px] shadow-fr-lift ring-4 ring-fr-bg",
            "transition-transform duration-300 group-hover:scale-105",
            tone.tile,
          )}
        >
          <Icon className="size-6" />
        </span>
        <h3 className="mt-9 text-[18px] font-bold text-fr-ink">{card.title}</h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-fr-ink-2">
          {card.body}
        </p>
        <span
          className={cn(
            "mt-4 flex items-center gap-1.5 text-[14px] font-semibold",
            "transition-[gap] duration-300 group-hover:gap-2.5",
            tone.text,
          )}
        >
          {card.cta}
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export function ServicesSection() {
  return (
    <Shell id="services">
      <SectionIntro
        eyebrow="Our Services"
        title="Everything You Need for"
        accent="FSSAI Compliance"
        accentTone="gradient"
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICE_CARDS.map((card) => (
          <ServiceTile key={card.title} card={card} />
        ))}
      </div>
    </Shell>
  );
}

/* ─────────────────────────────────────────── 2 · Process */

/** Step 4 is purple-600 in the HTML; fr-violet is the token nearest it. */
const STEP_TONE: Record<HomeProcessStep["tone"], string> = {
  blue: "bg-fr-blue",
  green: "bg-fr-green",
  amber: "bg-fr-amber",
  violet: "bg-fr-violet",
};

export function ProcessSection() {
  return (
    <Shell id="how-it-works" tinted>
      <SectionIntro
        eyebrow="Process"
        eyebrowTone="green"
        title="Get Licensed in"
        accent="4 Simple Steps"
        accentTone="green"
        className="mb-10"
      />
      <div className="relative">
        {/* connector timeline shows through the gaps between the cards */}
        <div
          aria-hidden="true"
          className="absolute top-[52px] right-[12%] left-[12%] hidden border-t-2 border-dashed border-fr-sep lg:block"
        />
        <ol className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_PROCESS_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="group relative flex flex-col items-center overflow-hidden rounded-[18px] border-[0.5px] border-fr-sep bg-fr-bg p-6 text-center shadow-fr-soft transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-1.5 hover:shadow-fr-lift"
            >
              <span aria-hidden="true" className="fr-shine" />
              <span
                aria-hidden="true"
                className={cn(
                  "relative flex size-14 items-center justify-center rounded-2xl text-[19px] font-extrabold text-white shadow-fr-lift transition-transform duration-300 group-hover:scale-105",
                  STEP_TONE[step.tone],
                )}
              >
                {index + 1}
              </span>
              <h3 className="relative mt-5 text-[16px] font-bold text-fr-ink">
                {step.title}
              </h3>
              <p className="relative mt-1.5 text-[14px] leading-relaxed text-fr-ink-2">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Shell>
  );
}

/* ─────────────────────────────────────────── 3 · Sector hub */

const SECTOR_TONE = ["blue", "green", "orange", "violet", "blue"] as const;

export function SectorHub() {
  return (
    <Shell id="sectors">
      <SectionIntro
        eyebrow="Industry Hub"
        title="We cover every"
        accent="kind of food business"
        lede={`All ${KINDS_OF_BUSINESS.length} FSSAI categories, grouped exactly as FoSCoS lists them.`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {KOB_GROUPS.map((group, index) => {
          const kobs = kobsInGroup(group);
          const tone = TONE[SECTOR_TONE[index] ?? "blue"];
          return (
            <div
              key={group}
              className="flex flex-col rounded-[18px] border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-soft"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[17px] font-bold text-fr-ink">{group}</h3>
                <span
                  className={cn(
                    "shrink-0 rounded-pill px-2.5 py-1 text-[12px] font-bold",
                    tone.tile,
                  )}
                >
                  {kobs.length}
                </span>
              </div>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {kobs.slice(0, 6).map((kob) => (
                  <li
                    key={kob.id}
                    className="rounded-pill bg-fr-panel px-2.5 py-1 text-[12.5px] text-fr-ink-2"
                  >
                    {kob.label}
                  </li>
                ))}
                {kobs.length > 6 && (
                  <li className="rounded-pill bg-fr-panel px-2.5 py-1 text-[12.5px] font-semibold text-fr-ink-2">
                    +{kobs.length - 6} more
                  </li>
                )}
              </ul>
              <Link
                href="/services#documents"
                className={cn(
                  "mt-5 flex items-center gap-1.5 text-[14px] font-semibold",
                  tone.text,
                )}
              >
                See documents required
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

/* ─────────────────────────────────────────── 4 · Gov alignment */

export function GovAlignment() {
  return (
    <Shell tinted>
      <SectionIntro
        eyebrow="Government Alignment"
        title="Aligned with the authorities that"
        accent="set the standard"
        accentTone="green"
        lede="We work to the frameworks these bodies publish. Every link goes to the authority's own site."
      />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {AUTHORITIES.map((authority) => (
          <li key={authority.name}>
            <a
              href={authority.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex h-full flex-col rounded-[18px] border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-soft",
                "transition-[transform,box-shadow] duration-300 ease-ios",
                "hover:-translate-y-1 hover:shadow-fr-lift",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-fr-blue to-fr-blue-deep text-[15px] font-extrabold text-white shadow-fr-soft"
                >
                  {authority.name.slice(0, 2)}
                </span>
                <span className="text-[17px] font-bold text-fr-ink">
                  {authority.name}
                </span>
              </div>
              <p className="mt-3 text-[13px] font-semibold text-fr-ink-2">
                {authority.fullName}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-fr-ink-2">
                {authority.description}
              </p>
              <span className="mt-4 flex items-center gap-1.5 text-[13.5px] font-semibold text-fr-blue transition-[gap] duration-300 group-hover:gap-2.5">
                Visit official site
                <span aria-hidden="true">↗</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
