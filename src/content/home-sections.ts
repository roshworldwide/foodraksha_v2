/**
 * Content for the home-page sections in the client's build
 * (/Reference/FoodRaksha-NextJS/components/*). Copy follows theirs wherever it
 * describes something real; anything they mocked up is either replaced with a
 * verified value or marked.
 */

export interface ServiceCard {
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: "blue" | "green" | "orange";
  glyph: string;
}

/** Their ServicesSection, three cards, copy as written. */
export const SERVICE_CARDS: ServiceCard[] = [
  {
    title: "FSSAI Registration",
    body: "Registration, State and Central licences. We identify the right one and file it — most within 24 hours of your documents.",
    cta: "Check your licence",
    href: "/fssai-calculator",
    tone: "blue",
    glyph: "▤",
  },
  {
    title: "Compliance Audits",
    body: "Hygiene and food-safety audits, annual returns and the paperwork that keeps your licence in good standing.",
    cta: "See what's covered",
    href: "/membership",
    tone: "green",
    glyph: "✓",
  },
  {
    title: "FoSTaC Training",
    body: "Food handler and food manager training and certification — the ground we have been on for 35+ years.",
    cta: "Talk to us",
    href: "/book",
    tone: "orange",
    glyph: "◎",
  },
];

export interface Authority {
  name: string;
  fullName: string;
  description: string;
  websiteUrl: string;
}

/**
 * Their GovAlignment section. Every authority, URL and description is real and
 * publicly verifiable, so this section is used as supplied.
 */
export const AUTHORITIES: Authority[] = [
  {
    name: "FSSAI",
    fullName: "Food Safety and Standards Authority of India",
    description: "Apex statutory body establishing food safety standards",
    websiteUrl: "https://www.fssai.gov.in",
  },
  {
    name: "FoSTaC",
    fullName: "Food Safety Training & Certification",
    description: "Mandatory training ecosystem for food handlers",
    websiteUrl: "https://fostac.fssai.gov.in",
  },
  {
    name: "NABL",
    fullName:
      "National Accreditation Board for Testing and Calibration Laboratories",
    description: "Accreditation standard for food analysis laboratories",
    websiteUrl: "https://nabl-india.org",
  },
  {
    name: "MoHFW",
    fullName: "Ministry of Health & Family Welfare",
    description: "Parent ministry overseeing the food regulatory framework",
    websiteUrl: "https://www.mohfw.gov.in",
  },
  {
    name: "BIS",
    fullName: "Bureau of Indian Standards",
    description: "National standards body for product quality certifications",
    websiteUrl: "https://www.bis.gov.in",
  },
];

export interface LedgerEvent {
  title: string;
  location: string;
  minutesAgo: number;
  tone: "blue" | "green" | "orange" | "violet";
}

/**
 * The operations ledger feed.
 *
 * SIMULATED, at the client's instruction — these are not real filings. The
 * section labels itself as illustrative on screen, because a ticker of invented
 * client activity presented as live would be a straightforward misrepresentation
 * to anyone reading it.
 *
 * To make it real: replace this array with a query over Application /
 * StatusEvent (both already carry the status and timestamp needed), drop the
 * "illustrative" caption, and the component needs no other change.
 */
export const LEDGER_IS_SIMULATED = true;

export const LEDGER_EVENTS: LedgerEvent[] = [
  {
    title: "State Licence filed for a dairy plant",
    location: "Pune, Maharashtra",
    minutesAgo: 2,
    tone: "green",
  },
  {
    title: "Central Licence approved",
    location: "Chennai, Tamil Nadu",
    minutesAgo: 5,
    tone: "blue",
  },
  {
    title: "FSSAI Registration completed",
    location: "Ahmedabad, Gujarat",
    minutesAgo: 8,
    tone: "violet",
  },
  {
    title: "Pre-licence audit completed",
    location: "Kolkata, West Bengal",
    minutesAgo: 12,
    tone: "orange",
  },
  {
    title: "Renewal approved",
    location: "Hyderabad, Telangana",
    minutesAgo: 15,
    tone: "green",
  },
  {
    title: "Annual return filed",
    location: "Indore, Madhya Pradesh",
    minutesAgo: 19,
    tone: "blue",
  },
];
