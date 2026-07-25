/**
 * The licence qualifier — the single source of truth that turns a business's
 * turnover into the FSSAI licence it needs, and the indicative price + timeline
 * we quote for it. Reused by the hero qualifier, the Book Appointment page and
 * every "which licence do I need?" spot. Pure and tested.
 *
 * Turnover → licence thresholds (as briefed):
 *   ≤ ₹1.5 crore        → Basic Registration
 *   ₹1.5 crore – ₹50 cr → State Licence
 *   > ₹50 crore         → Central Licence
 */

export type LicenceKind = "BASIC" | "STATE" | "CENTRAL";

/**
 * The one function. Everything else is a lookup off its result.
 * Boundaries: exactly ₹1.5cr is Basic; exactly ₹50cr is State.
 */
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
  { value: "over_50cr", label: "Over ₹50 crore", crore: 60 },
] as const;

export type TurnoverBand = (typeof TURNOVER_BANDS)[number]["value"];

export function licenceForBand(band: TurnoverBand | string): LicenceKind {
  const found = TURNOVER_BANDS.find((b) => b.value === band);
  // An unknown band is treated as the safest broad default rather than throwing
  // in a form handler; callers validate the band with Zod before this.
  return licenceForTurnoverCrore(found?.crore ?? 25);
}

/**
 * Indicative price + timeline per licence.
 *
 * ⚠️ PLACEHOLDER: the real figures come from docs/Website-Structure-Teardown.md,
 * which does not exist yet. These are indicative round numbers so the qualifier
 * has something to show; swap them and set PRICING_IS_PLACEHOLDER = false when
 * the teardown arrives. Prices are professional-fee "from" figures, exclusive
 * of government fees.
 */
export const PRICING_IS_PLACEHOLDER = true;

export interface LicenceInfo {
  kind: LicenceKind;
  name: string;
  /** Professional fee, indicative "from", in whole rupees. */
  priceFromInr: number;
  timeline: string;
  summary: string;
}

export const LICENCE_INFO: Record<LicenceKind, LicenceInfo> = {
  BASIC: {
    kind: "BASIC",
    name: "Basic Registration",
    priceFromInr: 1499,
    timeline: "3–7 working days",
    summary:
      "For small food businesses up to ₹12 lakh turnover — the entry-level FSSAI registration.",
  },
  STATE: {
    kind: "STATE",
    name: "State Licence",
    priceFromInr: 4999,
    timeline: "20–30 working days",
    summary:
      "For mid-sized businesses operating within one state — restaurants, manufacturers and traders.",
  },
  CENTRAL: {
    kind: "CENTRAL",
    name: "Central Licence",
    priceFromInr: 9999,
    timeline: "30–45 working days",
    summary:
      "For large operations, importers, exporters and multi-state businesses.",
  },
};

export function licenceInfo(kind: LicenceKind): LicenceInfo {
  return LICENCE_INFO[kind];
}

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** "from ₹1,499" — the way a price is quoted on the site. */
export function formatPriceFrom(kind: LicenceKind): string {
  return `from ${INR.format(LICENCE_INFO[kind].priceFromInr)}`;
}

// One quiet build-time note so nobody ships placeholder pricing unknowingly.
if (PRICING_IS_PLACEHOLDER && typeof window === "undefined") {
  console.warn(
    "\n⚠️  [marketing/qualifier] Using PLACEHOLDER pricing — docs/Website-Structure-Teardown.md is missing.\n" +
      "    Update LICENCE_INFO in src/lib/marketing/qualifier.ts and set PRICING_IS_PLACEHOLDER = false before launch.\n",
  );
}
