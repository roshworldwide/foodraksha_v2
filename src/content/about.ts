/**
 * Everything the About page says about Food Raksha.
 *
 * Same discipline as @/content/trust: real-or-null. Any figure, photo, face or
 * credential that has not been confirmed by the client stays `null` / empty, and
 * the page hides that piece rather than showing a placeholder number or a stock
 * portrait. A compliance buyer checks these things; one invented statistic costs
 * more trust than a missing one.
 *
 * Confirmed sources: docs/Website-Structure-Teardown.md §2 (the About hero copy
 * and positioning), the site footer ("35+ years of experience in food handler
 * and food manager training and compliance. Good work, fair price."), and
 * @/content/trust for the two verified numbers.
 */

export interface AboutStat {
  /** null hides this stat. Never guess one. */
  value: string | null;
  label: string;
}

export interface AboutPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface TeamMember {
  name: string;
  role: string;
  /** null renders an initials monogram — honest, unlike a stock face. */
  photo: AboutPhoto | null;
}

export interface AboutValue {
  glyph: string;
  tone: "blue" | "green";
  title: string;
  /** The concrete proof, not a platitude. Keep it checkable. */
  proof: string;
}

/* ─────────────────────────────────────────────────── hero + story */

export const ABOUT_HERO = {
  eyebrow: "About us",
  title: "About Food Raksha",
  /** One word two-toned, per the site's headline treatment. */
  accent: "Raksha",
  accentColor: "green" as const,
  lede: "Good work at a fair price. FSSAI licensing that actually helps — saves you time, money and stress.",
};

/**
 * The story, in the founder's voice. Short paragraphs on purpose: this is the
 * one place on the site that is allowed to be personal.
 */
export const ABOUT_STORY = {
  heading: "Why Food Raksha exists",
  accent: "exists",
  paragraphs: [
    "We have spent 35+ years around food businesses — food handler and food manager training, audits, and the compliance paperwork that comes with all of it. Long enough to know exactly where it goes wrong for the person running the kitchen.",
    "What we kept seeing was the same thing: an owner who wanted to do the right thing, a form they had never seen before, and a quote that made no sense. Some pay far too much. Others get filed under the wrong licence and find out months later.",
    "So we built Food Raksha to actually help — to save you time, money and stress. We tell you which licence you need, show the government fee separately from our fee, prepare every document, and file it. Good work at a fair price. You can compare us with anyone.",
  ],
  /**
   * A real photograph of the team or office. Kept null until the client supplies
   * one — the page renders a fixed-ratio placeholder so there is no layout
   * shift when it lands. No stock imagery.
   */
  photo: null as AboutPhoto | null,
};

/* ─────────────────────────────────────────────────── by the numbers */

/**
 * The credibility anchor. "35+" and "120+" are the same confirmed figures as
 * TRUST.stats; the other two are things only the client can tell us, so they
 * stay null and drop out of the band.
 */
export const ABOUT_STATS: AboutStat[] = [
  { value: "35+", label: "years in food compliance" },
  { value: null, label: "licences filed" },
  { value: null, label: "businesses served" },
  { value: "120+", label: "licensing experts" },
];

/** Only the stats we can actually stand behind. */
export function visibleStats(): { value: string; label: string }[] {
  return ABOUT_STATS.filter(
    (stat): stat is { value: string; label: string } => stat.value !== null,
  );
}

/* ─────────────────────────────────────────────────── values */

export const ABOUT_VALUES: AboutValue[] = [
  {
    glyph: "✓",
    tone: "blue",
    title: "Reliable",
    proof:
      "We do what we say. Your file is handled by people who file these every day — not passed to whoever is free.",
  },
  {
    glyph: "₹",
    tone: "green",
    title: "Fair-priced",
    proof:
      "Transparent pricing, with the government fee always shown separately from our fee. No surprises at the end.",
  },
  {
    glyph: "⚡",
    tone: "blue",
    title: "Fast",
    proof:
      "Most applications are filed within 24 hours of your documents reaching us.",
  },
  {
    glyph: "∞",
    tone: "green",
    title: "In it for the long term",
    proof:
      "We keep your compliance on track year after year — annual returns, renewals, modifications — not just the first filing.",
  },
];

/* ─────────────────────────────────────────────────── team */

/**
 * Real faces, names and roles. Empty until the client supplies photographs and
 * consents to publishing them, at which point the section appears on its own.
 * A member without a photo renders as an initials monogram; we never substitute
 * a stock portrait for a real person.
 */
export const ABOUT_TEAM: TeamMember[] = [];

/** "Priya Nair" → "PN". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/* ─────────────────────────────────────────────────── structured data */

/**
 * Year the business was founded, for Organization.foundingDate.
 *
 * NOT derived from "35+ years": that is a floor, not a date, and subtracting it
 * would put a fabricated year into structured data. Set it when the client
 * confirms, and the property appears; until then it is omitted.
 */
export const FOUNDED_YEAR: number | null = null;

/** Factual subject-matter expertise — what we do, not a claim about how well. */
export const KNOWS_ABOUT: string[] = [
  "FSSAI licensing",
  "FSSAI registration",
  "FSSAI State Licence",
  "FSSAI Central Licence",
  "Food safety compliance",
  "Food handler training",
  "Food manager training",
  "FoSCoS filing",
  "Annual returns and renewals",
];
