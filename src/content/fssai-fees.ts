/**
 * FSSAI licence + government fee engine — the authoritative matrix.
 *
 * Mirrors `docs/fssai-fees.md`, which is the client's official "FSSAI Calculator
 * Document" updated 01.04.2026. Every fee, threshold and kind-of-business rule
 * in here comes from that file: do not re-derive them from prose elsewhere on
 * the site, and do not hardcode a fee in a component.
 *
 * Government fees are **per annum** and are the government's charge only —
 * Food Raksha's professional fee is quoted separately (see PROFESSIONAL_FEE_NOTE).
 *
 * This module is the shared source for the hero calculator, the /services
 * qualifier and the standalone /fssai-calculator page. It imports nothing from
 * the app so it stays pure and cheap to test.
 */

/* ─────────────────────────────────────────────────── fee outcomes */

export interface FeeOutcome {
  /** Licence name as the government calls it, shown verbatim in the result. */
  licence: string;
  /** Government fee in whole rupees, per annum. 0 means the fee is waived. */
  govtFee: number;
}

export const CENTRAL: FeeOutcome = {
  licence: "Central License",
  govtFee: 7500,
};
export const STATE: FeeOutcome = { licence: "State License", govtFee: 5000 };
export const REGISTRATION: FeeOutcome = {
  licence: "Registration",
  govtFee: 100,
};
/** Registration with the fee waived — hawkers and Anganwadi centres. */
export const REGISTRATION_FREE: FeeOutcome = {
  licence: "Registration",
  govtFee: 0,
};
/** Central licence at the concessional fee — govt-agency / railway catering. */
export const CENTRAL_2000: FeeOutcome = {
  licence: "Central License",
  govtFee: 2000,
};
export const CENTRAL_REG_100: FeeOutcome = {
  licence: "Central Registration",
  govtFee: 100,
};
export const CENTRAL_RAILWAYS_2000: FeeOutcome = {
  licence: "Central License [Railways]",
  govtFee: 2000,
};
export const CENTRAL_REG_RAILWAYS_100: FeeOutcome = {
  licence: "Central Registration [Railways]",
  govtFee: 100,
};

/* ─────────────────────────────────────────────────── thresholds */

/** One crore in rupees. Turnover is handled in rupees throughout. */
export const CRORE = 10_000_000;
/** More than this and a plain Registration is no longer enough: ₹1.5 crore. */
export const STATE_THRESHOLD = 1.5 * CRORE;
/** More than this and a State licence is no longer enough: ₹50 crore. */
export const CENTRAL_THRESHOLD = 50 * CRORE;

/**
 * Bands are inclusive of their lower edge: "up to ₹1.5cr" is Registration,
 * "more than ₹1.5cr up to ₹50cr" is State, "more than ₹50cr" is Central. So
 * exactly ₹1.5 crore is Registration and exactly ₹50 crore is State.
 */

/* ─────────────────────────────────────────────────── rules */

export type FssaiRule =
  | "STANDARD"
  | "CENTRAL_ALWAYS"
  | "STATE_OR_REG"
  | "CENTRAL_OR_STATE"
  | "REG_ONLY"
  | "HAWKER"
  | "ANGANWADI"
  | "GENERAL_MFG"
  | "HOTEL"
  | "GOVT_CATERING"
  | "RAILWAY";

export type KobGroup =
  | "Manufacturer"
  | "Trade / Retail"
  | "Food Services"
  | "Central Government Agencies"
  | "Head Office";

/** The order groups appear in the picker — follows FoSCoS. */
export const KOB_GROUPS: KobGroup[] = [
  "Manufacturer",
  "Trade / Retail",
  "Food Services",
  "Central Government Agencies",
  "Head Office",
];

export interface Kob {
  /** Stable slug — safe for form values, URLs and analytics. */
  id: string;
  /** Shown in the picker. */
  label: string;
  group: KobGroup;
  rule: FssaiRule;
  /** Extra detail too long for the option label. */
  detail?: string;
}

export const KINDS_OF_BUSINESS: Kob[] = [
  /* ── Manufacturer */
  {
    id: "dairy-units",
    label: "Dairy units (milk & milk products)",
    group: "Manufacturer",
    rule: "STANDARD",
  },
  {
    id: "vegetable-oil-processing",
    label: "Vegetable Oil Processing Units",
    group: "Manufacturer",
    rule: "STANDARD",
  },
  {
    id: "slaughtering-unit",
    label: "Slaughtering unit",
    group: "Manufacturer",
    rule: "STANDARD",
  },
  {
    id: "meat-processing",
    label: "Meat Processing units",
    group: "Manufacturer",
    rule: "STANDARD",
  },
  {
    id: "fish-and-fish-products",
    label: "Fish and Fish Products",
    group: "Manufacturer",
    rule: "STANDARD",
  },
  {
    id: "general-manufacturing",
    label: "General Manufacturing",
    group: "Manufacturer",
    rule: "GENERAL_MFG",
  },
  {
    id: "substances-added-to-food",
    label: "Substances Added to Food",
    group: "Manufacturer",
    rule: "STANDARD",
  },
  {
    id: "relabeller",
    label: "Relabeller",
    group: "Manufacturer",
    rule: "STANDARD",
  },
  {
    id: "repacker",
    label: "Repacker",
    group: "Manufacturer",
    rule: "STANDARD",
  },
  {
    id: "proprietary-food",
    label: "Proprietary Food",
    group: "Manufacturer",
    rule: "CENTRAL_ALWAYS",
  },
  {
    id: "supplements-nutraceuticals",
    label: "Food or Health Supplements & Nutraceuticals",
    group: "Manufacturer",
    rule: "CENTRAL_ALWAYS",
  },
  {
    id: "non-specified-food",
    label: "Non-specified food & food ingredients",
    group: "Manufacturer",
    rule: "CENTRAL_ALWAYS",
  },
  {
    id: "ayurveda-aahara",
    label: "Ayurveda Aahara",
    group: "Manufacturer",
    rule: "CENTRAL_ALWAYS",
  },
  {
    id: "radiation-processing",
    label: "Radiation Processing of Food",
    group: "Manufacturer",
    rule: "CENTRAL_ALWAYS",
  },
  {
    id: "export-oriented-unit",
    label: "100% Export Oriented Units",
    group: "Manufacturer",
    rule: "CENTRAL_ALWAYS",
  },
  {
    id: "exporter-manufacturer",
    label: "Exporter – Manufacturer",
    group: "Manufacturer",
    rule: "CENTRAL_ALWAYS",
  },

  /* ── Trade / Retail */
  {
    id: "storage-cold",
    label: "Storage (Cold / Refrigerated)",
    group: "Trade / Retail",
    rule: "STANDARD",
  },
  {
    id: "storage-controlled-atmosphere-cold",
    label: "Storage (Controlled Atmosphere + Cold)",
    group: "Trade / Retail",
    rule: "STANDARD",
  },
  {
    id: "storage-other",
    label: "Storage (except Controlled Atmosphere + Cold)",
    group: "Trade / Retail",
    rule: "STANDARD",
  },
  {
    id: "transportation",
    label: "Transportation",
    group: "Trade / Retail",
    rule: "STANDARD",
  },
  {
    id: "wholesaler",
    label: "Wholesaler",
    group: "Trade / Retail",
    rule: "STANDARD",
  },
  {
    id: "distributor",
    label: "Distributor",
    group: "Trade / Retail",
    rule: "STANDARD",
  },
  {
    id: "retailer",
    label: "Retailer",
    group: "Trade / Retail",
    rule: "STANDARD",
  },
  {
    id: "direct-seller",
    label: "Direct Seller",
    group: "Trade / Retail",
    rule: "STANDARD",
  },
  {
    id: "food-vending-agencies",
    label: "Food Vending Agencies",
    group: "Trade / Retail",
    rule: "STANDARD",
  },
  {
    id: "importer",
    label: "Importer",
    group: "Trade / Retail",
    rule: "CENTRAL_ALWAYS",
  },
  {
    id: "e-commerce",
    label: "E-Commerce",
    group: "Trade / Retail",
    rule: "CENTRAL_ALWAYS",
  },
  {
    id: "trader-merchant-exporter",
    label: "Trader / Merchant – Exporter",
    group: "Trade / Retail",
    rule: "CENTRAL_ALWAYS",
  },

  /* ── Food Services */
  {
    id: "petty-retailer",
    label: "Petty Retailer of snacks / tea shops",
    group: "Food Services",
    rule: "REG_ONLY",
  },
  {
    id: "hawker",
    label: "Hawker (itinerant / mobile vendor)",
    group: "Food Services",
    rule: "HAWKER",
  },
  { id: "hotel", label: "Hotel", group: "Food Services", rule: "HOTEL" },
  {
    id: "restaurants",
    label: "Restaurants",
    group: "Food Services",
    rule: "STANDARD",
  },
  {
    id: "club-canteen",
    label: "Club / Canteen",
    group: "Food Services",
    rule: "STATE_OR_REG",
  },
  {
    id: "caterer",
    label: "Caterer",
    group: "Food Services",
    rule: "CENTRAL_OR_STATE",
  },
  {
    id: "dhaba",
    label: "Dhaba",
    group: "Food Services",
    rule: "STATE_OR_REG",
    detail: "Food Vending Establishment",
  },
  {
    id: "boarding-house",
    label: "Boarding houses serving food",
    group: "Food Services",
    rule: "STATE_OR_REG",
    detail: "Food Vending Establishment",
  },
  {
    id: "banquet-hall",
    label: "Banquet halls with catering",
    group: "Food Services",
    rule: "STATE_OR_REG",
    detail: "Food Vending Establishment",
  },
  {
    id: "home-based-canteen",
    label: "Home Based Canteens / Dabba Wallas",
    group: "Food Services",
    rule: "STATE_OR_REG",
    detail: "Food Vending Establishment",
  },
  {
    id: "stall-holder",
    label: "Permanent / Temporary Stall Holder",
    group: "Food Services",
    rule: "STATE_OR_REG",
  },
  {
    id: "religious-fair-stall",
    label: "Food stalls / religious gatherings / fairs",
    group: "Food Services",
    rule: "STATE_OR_REG",
  },
  {
    id: "mid-day-meal-caterer",
    label: "Mid-day Meal Caterer",
    group: "Food Services",
    rule: "CENTRAL_OR_STATE",
  },
  {
    id: "mid-day-meal-canteen",
    label: "Mid-Day Meal Canteen",
    group: "Food Services",
    rule: "STATE_OR_REG",
  },
  {
    id: "anganwadi",
    label: "Anganwadi [ICDS] Centres",
    group: "Food Services",
    rule: "ANGANWADI",
  },

  /* ── Central Government Agencies */
  {
    id: "central-govt-food-business",
    label: "Food Business Activities at Central Govt Agencies",
    group: "Central Government Agencies",
    rule: "CENTRAL_ALWAYS",
    detail: "Storage, wholesale, retail and similar activities",
  },
  {
    id: "central-govt-catering",
    label: "Food Catering Services under Central Govt Agencies",
    group: "Central Government Agencies",
    rule: "GOVT_CATERING",
  },
  {
    id: "airport-seaport",
    label: "Food Business Activities at Airport / Seaport",
    group: "Central Government Agencies",
    rule: "CENTRAL_ALWAYS",
  },
  {
    id: "railway-station",
    label: "Food Business Activities at Railway Stations",
    group: "Central Government Agencies",
    rule: "RAILWAY",
  },

  /* ── Head Office */
  {
    id: "head-office",
    label: "Head Office / Registered Office",
    group: "Head Office",
    rule: "CENTRAL_ALWAYS",
  },
];

export function findKob(kobId: string): Kob | undefined {
  return KINDS_OF_BUSINESS.find((k) => k.id === kobId);
}

export function kobsInGroup(group: KobGroup): Kob[] {
  return KINDS_OF_BUSINESS.filter((k) => k.group === group);
}

/* ─────────────────────────────────────────────────── star ratings */

export type StarRating = "5_plus" | "up_to_4";

/**
 * Labels are kept close in length on purpose — they render as the two halves of
 * a segmented control, which looks lopsided if one is much longer.
 */
export const STAR_RATINGS: { value: StarRating; label: string }[] = [
  { value: "5_plus", label: "5-star & above" },
  { value: "up_to_4", label: "4-star or below" },
];

/* ─────────────────────────────────────────────────── which inputs */

/**
 * Which step-2 questions a kind of business needs. The widget renders from
 * this rather than deciding for itself, so the rule set stays in one place.
 */
export interface RequiredInputs {
  turnover: boolean;
  stars: boolean;
  milling: boolean;
}

const NEEDS: Record<FssaiRule, RequiredInputs> = {
  STANDARD: { turnover: true, stars: false, milling: false },
  STATE_OR_REG: { turnover: true, stars: false, milling: false },
  CENTRAL_OR_STATE: { turnover: true, stars: false, milling: false },
  GOVT_CATERING: { turnover: true, stars: false, milling: false },
  RAILWAY: { turnover: true, stars: false, milling: false },
  GENERAL_MFG: { turnover: true, stars: false, milling: true },
  HOTEL: { turnover: true, stars: true, milling: false },
  // Fixed outcomes — asking for turnover would be a pointless question.
  CENTRAL_ALWAYS: { turnover: false, stars: false, milling: false },
  REG_ONLY: { turnover: false, stars: false, milling: false },
  HAWKER: { turnover: false, stars: false, milling: false },
  ANGANWADI: { turnover: false, stars: false, milling: false },
};

export function requiredInputs(rule: FssaiRule): RequiredInputs {
  return NEEDS[rule];
}

/* ─────────────────────────────────────────────────── resolvers */

/**
 * The plain turnover ladder most kinds of business follow. Exported because the
 * site's older turnover-band qualifier (@/lib/marketing/qualifier) delegates to
 * it, so there is exactly one place where a threshold is written down.
 */
export function standardOutcome(turnover: number): FeeOutcome {
  if (turnover > CENTRAL_THRESHOLD) return CENTRAL;
  if (turnover > STATE_THRESHOLD) return STATE;
  return REGISTRATION;
}

function standard(turnover: number): FeeOutcome {
  return standardOutcome(turnover);
}

function stateOrReg(turnover: number): FeeOutcome {
  return turnover > STATE_THRESHOLD ? STATE : REGISTRATION;
}

/** No registration tier — a caterer is State at minimum. */
function centralOrState(turnover: number): FeeOutcome {
  return turnover > CENTRAL_THRESHOLD ? CENTRAL : STATE;
}

/** Any grain, cereal or pulses milling is State at any turnover. */
function generalMfg(turnover: number, milling: boolean): FeeOutcome {
  return milling ? STATE : standard(turnover);
}

function hotel(stars: StarRating, turnover: number): FeeOutcome {
  if (stars === "5_plus") return CENTRAL;
  return turnover <= STATE_THRESHOLD ? REGISTRATION : STATE;
}

/** Special concessional fees — never falls back to STANDARD. */
function govtCatering(turnover: number): FeeOutcome {
  return turnover > STATE_THRESHOLD ? CENTRAL_2000 : CENTRAL_REG_100;
}

function railway(turnover: number): FeeOutcome {
  return turnover > STATE_THRESHOLD
    ? CENTRAL_RAILWAYS_2000
    : CENTRAL_REG_RAILWAYS_100;
}

/* ─────────────────────────────────────────────────── compute */

export interface FssaiInput {
  /** A `Kob.id`. */
  kob: string;
  /** Annual turnover in rupees. */
  turnover?: number;
  stars?: StarRating;
  milling?: boolean;
}

interface FssaiResultBase {
  /** True when this kind of business needs a turnover figure at all. */
  needsTurnover: boolean;
  /** A short, factual line explaining why — shown under the result. */
  note: string;
}

export type FssaiResult = FssaiResultBase &
  (
    | {
        /** Every required input is present: licence and fee are final. */
        resolved: true;
        licence: string;
        govtFee: number;
      }
    | {
        /** Still waiting on an input — there is deliberately no fee to show. */
        resolved: false;
        licence: null;
        govtFee: null;
      }
  );

const WAIVED_HAWKER =
  "Registration fee for hawkers was waived with effect from 28 September 2024.";
const WAIVED_ANGANWADI =
  "Registration fee for Anganwadi (ICDS) centres was waived with effect from 12 March 2025.";

/** The line the UI must always show alongside the fee. */
export const PROFESSIONAL_FEE_NOTE =
  "This is the government fee only. Food Raksha's professional fee is quoted after a quick review.";

/** The trust chip — the fee schedule these rules come from. */
export const FEES_UPDATED_LABEL = "Updated April 2026";

/** The same chip for a phone-width card, where the full label will not fit. */
export const FEES_UPDATED_LABEL_SHORT = "Apr 2026";

function pending(note: string): FssaiResult {
  return { resolved: false, licence: null, govtFee: null, needsTurnover: true, note };
}

function resolved(
  outcome: FeeOutcome,
  needsTurnover: boolean,
  note: string,
): FssaiResult {
  return {
    resolved: true,
    licence: outcome.licence,
    govtFee: outcome.govtFee,
    needsTurnover,
    note,
  };
}

/** "₹1.5 crore", "₹50 crore" — for building notes. */
function croreLabel(rupees: number): string {
  const crore = rupees / CRORE;
  return `₹${crore % 1 === 0 ? crore : crore.toFixed(1)} crore`;
}

function bandNote(turnover: number, outcome: FeeOutcome): string {
  if (outcome === REGISTRATION)
    return `Turnover up to ${croreLabel(STATE_THRESHOLD)} needs a Registration.`;
  if (outcome === STATE)
    return `Turnover above ${croreLabel(STATE_THRESHOLD)} needs a State License.`;
  return `Turnover above ${croreLabel(CENTRAL_THRESHOLD)} needs a Central License.`;
}

/**
 * The one licence + fee decision for the whole site.
 *
 * Pure. Returns `resolved: false` when a required input is still missing, so a
 * caller can never accidentally render a fee for an incomplete answer. An
 * unknown `kob` also returns `resolved: false` rather than guessing.
 */
export function computeFssai({
  kob,
  turnover,
  stars,
  milling,
}: FssaiInput): FssaiResult {
  const definition = findKob(kob);
  if (!definition) {
    return pending("Choose your kind of business to see the licence and fee.");
  }

  const rule = definition.rule;
  const needs = requiredInputs(rule);
  const hasTurnover = typeof turnover === "number" && Number.isFinite(turnover);

  switch (rule) {
    case "CENTRAL_ALWAYS":
      return resolved(
        CENTRAL,
        false,
        "This kind of business needs a Central License whatever the turnover.",
      );

    case "REG_ONLY":
      return resolved(
        REGISTRATION,
        false,
        "Petty retailers and tea shops are registered whatever the turnover.",
      );

    case "HAWKER":
      return resolved(REGISTRATION_FREE, false, WAIVED_HAWKER);

    case "ANGANWADI":
      return resolved(REGISTRATION_FREE, false, WAIVED_ANGANWADI);

    case "GENERAL_MFG": {
      // Milling settles it on its own — no turnover needed.
      if (milling) {
        return resolved(
          STATE,
          needs.turnover,
          "Milling grains, cereals or pulses needs a State License at any turnover.",
        );
      }
      if (!hasTurnover) return pending("Add your annual turnover to see the fee.");
      const outcome = generalMfg(turnover, false);
      return resolved(outcome, needs.turnover, bandNote(turnover, outcome));
    }

    case "HOTEL": {
      if (!stars) {
        return pending("Choose your star rating to see the licence and fee.");
      }
      if (stars === "5_plus") {
        return resolved(
          CENTRAL,
          needs.turnover,
          "Hotels rated 5-star and above need a Central License whatever the turnover.",
        );
      }
      if (!hasTurnover) return pending("Add your annual turnover to see the fee.");
      const outcome = hotel(stars, turnover);
      return resolved(
        outcome,
        needs.turnover,
        outcome === REGISTRATION
          ? `A hotel up to 4-star with turnover up to ${croreLabel(STATE_THRESHOLD)} needs a Registration.`
          : `A hotel up to 4-star with turnover above ${croreLabel(STATE_THRESHOLD)} needs a State License.`,
      );
    }

    case "GOVT_CATERING": {
      if (!hasTurnover) return pending("Add your annual turnover to see the fee.");
      const outcome = govtCatering(turnover);
      return resolved(
        outcome,
        needs.turnover,
        "Catering under a central government agency carries its own concessional fee.",
      );
    }

    case "RAILWAY": {
      if (!hasTurnover) return pending("Add your annual turnover to see the fee.");
      const outcome = railway(turnover);
      return resolved(
        outcome,
        needs.turnover,
        "Food businesses at railway stations carry their own concessional fee.",
      );
    }

    case "STATE_OR_REG": {
      if (!hasTurnover) return pending("Add your annual turnover to see the fee.");
      const outcome = stateOrReg(turnover);
      return resolved(outcome, needs.turnover, bandNote(turnover, outcome));
    }

    case "CENTRAL_OR_STATE": {
      if (!hasTurnover) return pending("Add your annual turnover to see the fee.");
      const outcome = centralOrState(turnover);
      return resolved(
        outcome,
        needs.turnover,
        outcome === STATE
          ? `This kind of business starts at a State License — there is no registration tier — up to ${croreLabel(CENTRAL_THRESHOLD)}.`
          : bandNote(turnover, outcome),
      );
    }

    case "STANDARD": {
      if (!hasTurnover) return pending("Add your annual turnover to see the fee.");
      const outcome = standard(turnover);
      return resolved(outcome, needs.turnover, bandNote(turnover, outcome));
    }
  }
}

/* ─────────────────────────────────────────────────── formatting */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** "₹5,000 / year", or "₹0 — fee waived" when the fee is nil. */
export function formatGovtFee(govtFee: number): string {
  if (govtFee === 0) return `${INR.format(0)} — fee waived`;
  return `${INR.format(govtFee)} / year`;
}

/**
 * A readable turnover for the lead note: "₹80 lakh", "₹10 crore". Falls back to
 * plain rupees below a lakh.
 */
export function formatTurnover(rupees: number): string {
  if (rupees >= CRORE) {
    const crore = rupees / CRORE;
    return `₹${Number(crore.toFixed(2))} crore`;
  }
  if (rupees >= 100_000) {
    const lakh = rupees / 100_000;
    return `₹${Number(lakh.toFixed(2))} lakh`;
  }
  return INR.format(rupees);
}

/* ─────────────────────────────────────────────────── indexable content */

/** "Registration (₹100 / year)" — one outcome, spelled out. */
function outcomeLabel(outcome: FeeOutcome): string {
  return `${outcome.licence} (${formatGovtFee(outcome.govtFee)})`;
}

const UP_TO_STATE = `up to ${croreLabel(STATE_THRESHOLD)}`;
const ABOVE_STATE = `above ${croreLabel(STATE_THRESHOLD)}`;
const ABOVE_CENTRAL = `above ${croreLabel(CENTRAL_THRESHOLD)}`;

/**
 * Each rule in plain English, composed from the fee constants rather than
 * retyped — the fee table on /fssai-calculator renders from this, so the page
 * can never drift from the engine.
 */
export const RULE_SUMMARY: Record<FssaiRule, string> = {
  STANDARD: `Turnover ${UP_TO_STATE}: ${outcomeLabel(REGISTRATION)}. ${ABOVE_STATE}: ${outcomeLabel(STATE)}. ${ABOVE_CENTRAL}: ${outcomeLabel(CENTRAL)}.`,
  STATE_OR_REG: `Turnover ${UP_TO_STATE}: ${outcomeLabel(REGISTRATION)}. ${ABOVE_STATE}: ${outcomeLabel(STATE)} at any turnover above that.`,
  CENTRAL_OR_STATE: `No registration tier — ${outcomeLabel(STATE)} up to ${croreLabel(CENTRAL_THRESHOLD)}, then ${outcomeLabel(CENTRAL)}.`,
  CENTRAL_ALWAYS: `${outcomeLabel(CENTRAL)} whatever the turnover.`,
  REG_ONLY: `${outcomeLabel(REGISTRATION)} whatever the turnover.`,
  HAWKER: `${outcomeLabel(REGISTRATION_FREE)} — ${WAIVED_HAWKER}`,
  ANGANWADI: `${outcomeLabel(REGISTRATION_FREE)} — ${WAIVED_ANGANWADI}`,
  GENERAL_MFG: `Milling grains, cereals or pulses: ${outcomeLabel(STATE)} at any turnover. Otherwise the standard ladder applies.`,
  HOTEL: `5-star and above: ${outcomeLabel(CENTRAL)}. Up to 4-star, turnover ${UP_TO_STATE}: ${outcomeLabel(REGISTRATION)}, ${ABOVE_STATE}: ${outcomeLabel(STATE)}.`,
  GOVT_CATERING: `Turnover ${UP_TO_STATE}: ${outcomeLabel(CENTRAL_REG_100)}. ${ABOVE_STATE}: ${outcomeLabel(CENTRAL_2000)}.`,
  RAILWAY: `Turnover ${UP_TO_STATE}: ${outcomeLabel(CENTRAL_REG_RAILWAYS_100)}. ${ABOVE_STATE}: ${outcomeLabel(CENTRAL_RAILWAYS_2000)}.`,
};

/**
 * FAQs for /fssai-calculator — also emitted as FAQPage structured data. Every
 * answer is drawn from docs/fssai-fees.md; nothing here is invented.
 */
export const CALCULATOR_FAQ: { q: string; a: string }[] = [
  {
    q: "How much is the FSSAI government fee?",
    a: `It depends on the licence your business needs. A Registration is ${formatGovtFee(REGISTRATION.govtFee)}, a State License is ${formatGovtFee(STATE.govtFee)} and a Central License is ${formatGovtFee(CENTRAL.govtFee)}. Hawkers and Anganwadi (ICDS) centres pay nothing — the registration fee is waived. Catering under a central government agency and food businesses at railway stations use concessional fees of ₹100 or ₹2,000 a year.`,
  },
  {
    q: "Which FSSAI licence do I need?",
    a: `For most kinds of business it follows annual turnover: ${UP_TO_STATE} needs a Registration, ${ABOVE_STATE} needs a State License, and ${ABOVE_CENTRAL} needs a Central License. But a good number of kinds of business ignore turnover entirely — importers, e-commerce, nutraceuticals, exporters and head offices always need a Central License. The calculator on this page applies the full official matrix rather than turnover alone.`,
  },
  {
    q: "Is the FSSAI fee a one-time payment?",
    a: "No. The government fee is charged per annum, and it is quoted per year of licence you apply for.",
  },
  {
    q: "Do importers and exporters pay more?",
    a: `Importers, exporters, e-commerce food businesses, 100% export-oriented units and head offices need a Central License regardless of turnover, so the government fee is ${formatGovtFee(CENTRAL.govtFee)}.`,
  },
  {
    q: "What licence does a hotel need?",
    a: `A hotel rated 5-star or above needs a Central License at ${formatGovtFee(CENTRAL.govtFee)} whatever its turnover. A hotel up to 4-star follows turnover: ${UP_TO_STATE} is a Registration, above that a State License.`,
  },
  {
    q: "Do flour mills need a State licence?",
    a: `Yes. A general manufacturing unit that mills grains, cereals or pulses needs a State License at any turnover — there is no upper turnover limit and no registration tier for milling.`,
  },
  {
    q: "Does a caterer ever qualify for basic registration?",
    a: `No. Caterers and mid-day meal caterers start at a State License — there is no registration tier for them — and move to a Central License ${ABOVE_CENTRAL}.`,
  },
  {
    q: "Is Food Raksha's fee included in this figure?",
    a: PROFESSIONAL_FEE_NOTE,
  },
];

/**
 * The one-line summary the calculator sends with a lead, so the sales team sees
 * exactly what the customer was told: KOB · turnover · licence · govt fee.
 */
export function calculatorSummary(input: FssaiInput): string | null {
  const definition = findKob(input.kob);
  const result = computeFssai(input);
  if (!definition || !result.resolved) return null;

  const parts = [definition.label];
  if (input.stars) {
    const rating = STAR_RATINGS.find((r) => r.value === input.stars);
    if (rating) parts.push(rating.label);
  }
  if (definition.rule === "GENERAL_MFG") {
    parts.push(input.milling ? "mills grains/cereals/pulses" : "no milling");
  }
  if (result.needsTurnover && typeof input.turnover === "number") {
    parts.push(formatTurnover(input.turnover));
  }
  parts.push(result.licence, `govt fee ${formatGovtFee(result.govtFee)}`);
  return parts.join(" · ");
}
