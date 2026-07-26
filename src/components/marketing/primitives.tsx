import type { ComponentPropsWithRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────── Placeholder */

/**
 * A clearly-marked amber pill for a value the client still has to supply
 * (phone, address, …). Loud on purpose — a fake number is worse than an
 * obvious blank. See lib/marketing/contact.isPlaceholder.
 */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-[#FFF4E5] px-1.5 py-0.5 text-[0.92em] text-[#B85C00]">
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────── LinkArrow */

/** A text link with an arrow that nudges forward on hover. */
export function LinkArrow({
  href,
  children,
  accent = "blue",
  className,
}: {
  href: string;
  children: ReactNode;
  accent?: "blue" | "green" | "ink";
  className?: string;
}) {
  const color =
    accent === "green"
      ? "text-fr-green"
      : accent === "ink"
        ? "text-fr-ink"
        : "text-fr-blue";
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-[15px] font-semibold tracking-[-0.01em]",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fr-blue/35 rounded-md",
        color,
        className,
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className="transition-transform duration-200 ease-ios group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}

/* ───────────────────────────────────────────────────────────── Card */

/** Soft-shadowed surface with an optional hover-lift. */
export function Card({
  hover = false,
  className,
  children,
  ...props
}: {
  hover?: boolean;
} & ComponentPropsWithRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-soft",
        hover &&
          "transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-1 hover:shadow-fr-lift",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────── SectionHeading */

/**
 * Apple-style section heading: an optional small eyebrow, a large balanced
 * title with one word optionally accented blue or green, and optional lede.
 */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  accentColor = "blue",
  lede,
  align = "left",
  /** 1 renders an <h1> — use once per page, for a page hero. Default 2. */
  level = 2,
  className,
}: {
  eyebrow?: string;
  title: string;
  /** A word or phrase within the title to colour. Matched once. */
  accent?: string;
  accentColor?: "blue" | "green";
  lede?: string;
  align?: "left" | "center";
  level?: 1 | 2;
  className?: string;
}) {
  const accentClass =
    accentColor === "green" ? "text-fr-green" : "text-fr-blue";

  let titleNode: ReactNode = title;
  if (accent && title.includes(accent)) {
    const [before, after] = title.split(accent);
    titleNode = (
      <>
        {before}
        <span className={accentClass}>{accent}</span>
        {after}
      </>
    );
  }

  const Title = level === 1 ? "h1" : "h2";

  return (
    <div
      className={cn(
        align === "center"
          ? "mx-auto max-w-[720px] text-center"
          : "max-w-[720px]",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-2.5 text-[13px] font-semibold tracking-[0.06em] text-fr-ink-3 uppercase">
          {eyebrow}
        </p>
      )}
      <Title className="text-title-1 text-balance text-fr-ink sm:text-large-title">
        {titleNode}
      </Title>
      {lede && (
        <p className="mt-3.5 text-[18px] leading-relaxed tracking-[-0.01em] text-fr-ink-2">
          {lede}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────── TrustBar */

/** A single reassurance chip: green dot + label. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[14px] font-medium text-fr-ink-2">
      <span
        aria-hidden="true"
        className="size-[7px] rounded-full bg-fr-green"
      />
      {children}
    </span>
  );
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span
      aria-label={`${value} out of 5 stars`}
      className="text-[15px] tracking-[1px] text-fr-green"
    >
      {"★".repeat(rounded)}
      <span className="text-fr-ink-3">{"★".repeat(5 - rounded)}</span>
    </span>
  );
}

/**
 * The hero trust bar: an optional star rating (only when a real one exists)
 * followed by the reassurance chips. Never renders a fabricated rating.
 */
export function TrustBar({
  rating,
  reviewCount,
  reviewSource,
  chips,
  className,
}: {
  rating?: number | null;
  reviewCount?: number | null;
  reviewSource?: string | null;
  chips: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-3",
        className,
      )}
    >
      {rating != null && (
        <span className="flex items-center gap-2 text-[14px] font-medium text-fr-ink-2">
          <Stars value={rating} />
          <b className="font-bold text-fr-ink">{rating.toFixed(1)}</b>
          {reviewCount != null && (
            <span>
              from {reviewCount.toLocaleString("en-IN")}+ reviews
              {reviewSource ? ` on ${reviewSource}` : ""}
            </span>
          )}
        </span>
      )}
      {chips.map((chip) => (
        <Chip key={chip}>{chip}</Chip>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────── Testimonial */

export function TestimonialCard({
  quote,
  name,
  title,
  company,
}: {
  quote: string;
  name: string;
  title: string;
  company: string;
}) {
  return (
    <figure className="flex flex-col rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-soft">
      <blockquote className="text-[16px] leading-relaxed text-fr-ink">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-4 text-[14px]">
        <span className="font-semibold text-fr-ink">{name}</span>
        <span className="block text-fr-ink-2">
          {title}
          {company ? `, ${company}` : ""}
        </span>
      </figcaption>
    </figure>
  );
}

/* ────────────────────────────────────────────────────────── TrustRow */

/**
 * Column count follows the item count, so a row whose unconfirmed figures have
 * been filtered out stays centred instead of hugging the left of a 4-column
 * grid. Whole class strings, not interpolated, so Tailwind's scanner sees them.
 */
const TRUST_ROW_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

/** A row of proof points — a number and a label each. */
export function TrustRow({
  items,
  className,
}: {
  items: { value: string; label: string }[];
  className?: string;
}) {
  const cols = TRUST_ROW_COLS[Math.min(items.length, 4)] ?? TRUST_ROW_COLS[4];

  return (
    <dl className={cn("grid gap-x-6 gap-y-6", cols, className)}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-title-1 font-bold tracking-[-0.02em] text-fr-ink tabular-nums">
            {item.value}
          </dt>
          <dd className="mt-1 text-[14px] text-fr-ink-2">{item.label}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ───────────────────────────────────────────────────────── LogoStrip */

/** A muted strip of partner / recognition wordmarks. */
export function LogoStrip({
  label,
  logos,
  className,
}: {
  label?: string;
  logos: string[];
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      {label && (
        <p className="mb-5 text-[13px] font-medium tracking-[0.02em] text-fr-ink-3">
          {label}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {logos.map((logo) => (
          <span
            key={logo}
            className="text-[17px] font-semibold tracking-[-0.01em] text-fr-ink-3"
          >
            {logo}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── CTABand */

/** A full-width call-to-action band. Blue by default, green as the accent. */
export function CTABand({
  title,
  lede,
  children,
  tone = "blue",
  className,
}: {
  title: string;
  lede?: string;
  /** Actions (buttons). */
  children?: ReactNode;
  tone?: "blue" | "green" | "ink";
  className?: string;
}) {
  /* `ink` reads as deep navy rather than near-black: the reference deck uses a
     navy band for full-width dark sections (FR-003's operations ledger, the
     FR-014 hero), not a neutral black. */
  const bg =
    tone === "green"
      ? "bg-fr-green"
      : tone === "ink"
        ? "bg-fr-navy"
        : "bg-fr-blue";
  return (
    <section
      className={cn(
        "rounded-fr-card px-6 py-12 text-center text-white sm:px-12 sm:py-16",
        bg,
        className,
      )}
    >
      <h2 className="mx-auto max-w-[640px] text-title-1 text-balance sm:text-large-title">
        {title}
      </h2>
      {lede && (
        <p className="mx-auto mt-3.5 max-w-[560px] text-[18px] leading-relaxed text-white/85">
          {lede}
        </p>
      )}
      {children && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {children}
        </div>
      )}
    </section>
  );
}
