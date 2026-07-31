/**
 * Content for the home-page sections, matched to docs/client-design/index.html —
 * the source of truth. Copy is theirs verbatim; anything they mocked up as data
 * (stat values, client logos, the ledger feed) is either a verified value or
 * marked, since the layout may be theirs but the facts have to be ours.
 */

export interface ServiceCard {
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: "blue" | "green" | "orange";
  /** Keyed into SERVICE_ICON in HomeSections — lucide standing in for the HTML's FontAwesome. */
  icon: "registration" | "audit" | "training";
}

/**
 * Their Services section: three cards, copy verbatim from index.html.
 *
 * Two claims here are the client's own and are not ours to verify: "as fast as
 * 24 hours" and "FSSAI-empaneled experts" (empanelment is a specific
 * accreditation). Both are flagged for confirmation before launch.
 */
export const SERVICE_CARDS: ServiceCard[] = [
  {
    title: "FSSAI Registration",
    body: "Basic, State & Central licenses. Get your FSSAI number in as fast as 24 hours.",
    cta: "Learn More",
    href: "/fssai-calculator",
    tone: "blue",
    icon: "registration",
  },
  {
    title: "Compliance Audits",
    body: "Thorough hygiene & safety audits by FSSAI-empaneled experts.",
    cta: "Schedule Audit",
    href: "/book",
    tone: "green",
    icon: "audit",
  },
  {
    title: "FoSTaC Training",
    body: "Mandatory food safety training & certification programs.",
    cta: "View Courses",
    href: "/book",
    tone: "orange",
    icon: "training",
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
