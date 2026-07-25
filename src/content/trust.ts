/**
 * Trust content for the marketing site — the one place the numbers, logos and
 * testimonials live. Everything here is real-or-null: any value that is not yet
 * confirmed stays null / empty, and the component that would show it hides
 * itself. We never fabricate a star rating, a testimonial, or a press logo.
 *
 * Confirmed sources: the prototype and Website-Structure-Teardown (35+ years,
 * 120+ experts, 24-hour filing, 100% confidential; the real client names).
 * Rating, testimonials and ISO/press badges are unconfirmed — left empty.
 */

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
}

export interface TrustContent {
  /** e.g. 4.9 — null hides the star rating entirely. Never invent one. */
  rating: number | null;
  reviewCount: number | null;
  reviewSource: string | null;
  /** Short reassurance chips shown under the hero CTAs. */
  chips: string[];
  /** Badges across the top of the Book Appointment page. */
  bookBadges: string[];
  /** 1–2 chips floated over the hero photo, Cleartax-style. */
  heroFloatingChips: string[];
  /** Concrete numbers for the trust stack. */
  stats: { value: string; label: string }[];
  /** Real client brand names. */
  clientLogos: string[];
  /** Named testimonials — empty until real ones are supplied (block hides). */
  testimonials: Testimonial[];
  /** ISO / press / media badges — empty until real (block hides). */
  badges: string[];
}

export const TRUST: TrustContent = {
  // No verified Google/Trustpilot rating yet → the star rating is hidden.
  rating: null,
  reviewCount: null,
  reviewSource: null,

  chips: [
    "35+ years experience",
    "120+ experts",
    "Filed in 24 hours",
    "100% confidential",
  ],

  heroFloatingChips: ["Filed in 24 hours", "100% confidential"],

  // The current Book page also shows a live-consultation count; it's dynamic and
  // unverifiable here, so it's omitted rather than faked.
  bookBadges: ["120+ experts online", "100% confidential"],

  stats: [
    { value: "35+", label: "years of experience" },
    { value: "120+", label: "licensing experts" },
    { value: "24 hrs", label: "typical filing time" },
    { value: "100%", label: "confidential" },
  ],

  clientLogos: [
    "Dr Agarwals",
    "Karim's",
    "Marine Lifesciences",
    "Criticam",
    "Vinati Organics",
    "Smayan",
    "Allianz Bio",
    "Medwell Ventures",
  ],

  // Shape kept for when the client supplies real ones, e.g.:
  //   { quote: "…", name: "Rakesh Kumar", title: "Owner", company: "…" }
  testimonials: [],

  // e.g. "ISO 27001", "Forbes", "ET" — none confirmed yet.
  badges: [],
};
