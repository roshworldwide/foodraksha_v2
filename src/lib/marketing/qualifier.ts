/**
 * The licence qualifier and the service pricing — one source of truth, reused
 * by the hero qualifier, the pricing section, /book and every "which licence?"
 * spot. Pure and tested.
 *
 * Two separate things:
 *  1. Which FSSAI LICENCE a business needs — decided by turnover (a real
 *     government rule).
 *  2. Which FoodRaksha SERVICE PLAN they buy — Starter / Standard / Elite,
 *     independent of licence type. Prices are real (docs/CONTACT.md,
 *     docs/Website-Structure-Teardown.md).
 *
 * Turnover → licence thresholds:
 *   ≤ ₹1.5 crore        → Basic Registration
 *   ₹1.5 crore – ₹50 cr → State Licence
 *   > ₹50 crore         → Central Licence
 */

export type LicenceKind = "BASIC" | "STATE" | "CENTRAL";

/** The one licence function. Boundaries: exactly ₹1.5cr is Basic; ₹50cr is State. */
export function licenceForTurnoverCrore(
  annualTurnoverCrore: number,
): LicenceKind {
  if (annualTurnoverCrore <= 1.5) return "BASIC";
  if (annualTurnoverCrore <= 50) return "STATE";
  return "CENTRAL";
}

/** Turnover bands the qualifier form offers, each mapped to a representative value. */
export const TURNOVER_BANDS = [
  { value: "up_to_1_5cr", label: "Up to ₹1.5 crore", crore: 1 },
  { value: "1_5cr_to_50cr", label: "₹1.5 crore – ₹50 crore", crore: 25 },
  { value: "over_50cr", label: "Above ₹50 crore", crore: 60 },
] as const;

export type TurnoverBand = (typeof TURNOVER_BANDS)[number]["value"];

export function licenceForBand(band: TurnoverBand | string): LicenceKind {
  const found = TURNOVER_BANDS.find((b) => b.value === band);
  return licenceForTurnoverCrore(found?.crore ?? 25);
}

/** Business types offered in the qualifier — for context, not for the licence rule. */
export const BUSINESS_TYPES = [
  "Restaurant / Café",
  "Manufacturer",
  "Trader / Retailer",
  "Cloud kitchen",
  "Transporter",
  "Importer / Exporter",
  "Other",
] as const;

/* ─────────────────────────────────────────────────── licence info */

export interface LicenceInfo {
  kind: LicenceKind;
  name: string;
  whoFor: string;
}

export const LICENCE_INFO: Record<LicenceKind, LicenceInfo> = {
  BASIC: {
    kind: "BASIC",
    name: "Basic Registration",
    whoFor: "small food businesses, turnover up to ₹1.5 crore",
  },
  STATE: {
    kind: "STATE",
    name: "State Licence",
    whoFor: "businesses operating within one state, ₹1.5–50 crore",
  },
  CENTRAL: {
    kind: "CENTRAL",
    name: "Central Licence",
    whoFor: "large, multi-state, import/export businesses over ₹50 crore",
  },
};

export function licenceInfo(kind: LicenceKind): LicenceInfo {
  return LICENCE_INFO[kind];
}

/* ─────────────────────────────────────────────────── service plans */

export interface Plan {
  id: "starter" | "standard" | "elite";
  name: string;
  /** Whole rupees, professional fee (government fee separate). */
  price: number;
  /** Previous price, struck through. */
  wasPrice?: number;
  suffix: string;
  desc: string;
  features: string[];
  featured: boolean;
}

/** Real pricing (confirmed from docs/CONTACT.md · docs/Website-Structure-Teardown.md). */
export const PRICING_IS_PLACEHOLDER = false;

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 699,
    suffix: "+ Govt Fee",
    desc: "Ideal for basic food licence customers.",
    features: [
      "15-min call with a licence expert",
      "Right licence type selected for you",
      "Application filed in 24 hours",
    ],
    featured: false,
  },
  {
    id: "standard",
    name: "Standard",
    price: 2999,
    wasPrice: 4999,
    suffix: "+ Govt Fee",
    desc: "For businesses with compliance needs.",
    features: [
      "Everything in Starter",
      "99% faster approval",
      "Priority document handling",
    ],
    featured: false,
  },
  {
    id: "elite",
    name: "Elite",
    price: 3999,
    wasPrice: 6999,
    suffix: "+ Govt Fee",
    desc: "Brand protection + faster approvals.",
    features: [
      "Everything in Standard",
      "GST registration + 1 year filing",
      "Trademark registration",
    ],
    featured: true,
  },
];

/** Membership plans (from the Enrollment flow — Stage 2). */
export const MEMBERSHIP_PLANS = [
  { name: "Gold", price: 3000 },
  { name: "Platinum", price: 6000 },
  { name: "Diamond", price: 9000 },
] as const;

/* ────────────────────────────────────── licence → recommendation */

export interface Recommendation {
  licence: LicenceInfo;
  /** The entry plan we suggest for this licence. */
  plan: Plan;
  /** Indicative filing/approval timeline. */
  timeline: string;
}

const RECOMMENDATION: Record<
  LicenceKind,
  { planId: Plan["id"]; timeline: string }
> = {
  BASIC: { planId: "starter", timeline: "filed in 24 hours" },
  STATE: { planId: "standard", timeline: "ready in ~7 days" },
  CENTRAL: { planId: "elite", timeline: "ready in ~15 days" },
};

/** Given a licence, the plan + timeline the qualifier shows. */
export function recommend(kind: LicenceKind): Recommendation {
  const rec = RECOMMENDATION[kind];
  const plan = PLANS.find((p) => p.id === rec.planId);
  if (!plan) throw new Error(`No plan for ${kind}`);
  return { licence: LICENCE_INFO[kind], plan, timeline: rec.timeline };
}

/* ─────────────────────────────────────────────────── formatting */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** "₹2,999". */
export function formatInr(amount: number): string {
  return INR.format(amount);
}
