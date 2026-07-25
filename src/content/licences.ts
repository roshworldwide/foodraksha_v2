import type { LicenceKind } from "@/lib/marketing/qualifier";

/**
 * SEO content for the three FSSAI licences — the Services page and, later, the
 * per-licence pages. Post-reform accurate (July 2026): licences carry perpetual
 * validity (no renewals), Basic Registration under ₹1.5 crore is instant, and
 * the turnover thresholds are ₹1.5 crore and ₹50 crore.
 */

export interface LicenceDetail {
  kind: LicenceKind;
  name: string;
  turnover: string;
  whoNeedsIt: string;
  examples: string[];
  included: string[];
  documents: string[];
  timeline: string;
}

export const LICENCES: LicenceDetail[] = [
  {
    kind: "BASIC",
    name: "Basic Registration",
    turnover: "Turnover up to ₹1.5 crore",
    whoNeedsIt:
      "The smallest food businesses. Since the 2026 reform, registration under ₹1.5 crore is instant — no pre-inspection.",
    examples: [
      "Home kitchens & home bakers",
      "Petty retailers & hawkers",
      "Small traders",
      "Tea stalls & food carts",
    ],
    included: [
      "Eligibility check on your turnover and category",
      "The right form, filled and filed for you",
      "Your registration certificate",
    ],
    documents: [
      "Photo ID (Aadhaar / PAN)",
      "Passport-size photograph",
      "Proof of business address",
      "Declaration of the nature of business",
    ],
    timeline: "Instant to 3 working days",
  },
  {
    kind: "STATE",
    name: "State Licence",
    turnover: "Turnover ₹1.5 crore – ₹50 crore",
    whoNeedsIt:
      "Mid-sized businesses operating within a single state. We prepare Form B and the full document set and file it for you.",
    examples: [
      "Restaurants & cafés",
      "Cloud kitchens",
      "Mid-size manufacturers",
      "Traders & distributors",
    ],
    included: [
      "Form B prepared from your answers",
      "Document checklist and layout-plan guidance",
      "Food-safety management (FSMS) declaration",
      "Filing with FoSCoS and follow-up",
    ],
    documents: [
      "Form B (we prepare it)",
      "ID & address proof of the proprietor / partners",
      "Premises layout plan",
      "List of directors / partners / proprietor",
      "Water test report (for manufacturers)",
      "NOC from the premises owner",
    ],
    timeline: "20–30 working days",
  },
  {
    kind: "CENTRAL",
    name: "Central Licence",
    turnover: "Turnover above ₹50 crore, importers & exporters",
    whoNeedsIt:
      "Large operations, importers and exporters, e-commerce sellers, multi-state chains, and businesses at ports and airports.",
    examples: [
      "Importers & exporters",
      "Large manufacturers",
      "Multi-state chains",
      "E-commerce food sellers",
    ],
    included: [
      "Form B and the complete document set",
      "Import/Export (IE) code guidance where needed",
      "Food-safety management (FSMS) plan",
      "Filing and liaison with the central authority",
    ],
    documents: [
      "Form B (we prepare it)",
      "ID & address proof",
      "Premises layout plan",
      "Water test report",
      "FSMS plan",
      "IE code (for import / export)",
    ],
    timeline: "30–45 working days",
  },
];

/** FAQ for the Services page — used on the page and in FAQPage JSON-LD. */
export const SERVICES_FAQ: { q: string; a: string }[] = [
  {
    q: "Which FSSAI licence do I need?",
    a: "It depends on your annual turnover: up to ₹1.5 crore needs Basic Registration, ₹1.5–50 crore needs a State Licence, and above ₹50 crore (or any importer/exporter) needs a Central Licence. Use the qualifier on this page and we'll tell you in seconds.",
  },
  {
    q: "Do FSSAI licences need to be renewed?",
    a: "No. Since the 2026 reform, FSSAI registrations and licences carry perpetual validity — there are no renewals. Only legacy licences issued before the reform still carry an expiry.",
  },
  {
    q: "How long does it take to get a licence?",
    a: "Basic Registration is instant to about 3 working days. A State Licence typically takes 20–30 working days and a Central Licence 30–45, depending on the authority.",
  },
  {
    q: "What does it cost?",
    a: "Our professional fees start at ₹699 for Basic Registration; the government fee is separate and shown before you pay. State and Central applications are quoted after a free consultation.",
  },
];
