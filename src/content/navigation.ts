/**
 * The marketing navigation, ported from docs/client-design/components/Navbar.tsx.
 *
 * Their mega-menu copy is kept — it is a genuine description of the practice and
 * the best inventory of services we have. Their links were all `href="#"`, so
 * every entry here is pointed at a route that actually exists; where a service
 * has no page yet it goes to the consultation flow rather than nowhere.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface MegaColumn {
  heading: string;
  tone: "blue" | "green" | "violet" | "orange" | "cyan" | "rose";
  links: NavLink[];
}

/**
 * The Services mega-menu, transcribed from docs/client-design/index.html — two
 * columns, License Services and Documentation Services. (Their components/*
 * Navbar has four columns; the HTML is the source of truth and it has two.)
 *
 * Every link in the HTML was `href="#"`; each is pointed at a real route here.
 */
export const SERVICES_MEGA: MegaColumn[] = [
  {
    heading: "License Services",
    tone: "blue",
    links: [
      {
        label: "License classification, documentation & application",
        href: "/fssai-calculator",
      },
      { label: "License modification application", href: "/book" },
      {
        label: "Fortified / Organic / Vegan Endorsement",
        href: "/book",
      },
      { label: "Annual Return Filing Guidance", href: "/membership" },
      { label: "License Renewal", href: "/book" },
    ],
  },
  {
    heading: "Documentation Services",
    tone: "green",
    links: [
      { label: "FSMS Documentation Checklist", href: "/services#documents" },
      {
        label: "FSMS preparation & verification",
        href: "/services#documents",
      },
      { label: "Post-License documentation", href: "/services#documents" },
      { label: "Import Clearance query responses", href: "/book" },
      { label: "Annual Medical Exam assistance", href: "/membership" },
      { label: "Internal Audit checklist", href: "/book" },
    ],
  },
];

/**
 * Top-level items, per FR-016/FR-017: Services · License Types · Industries ·
 * Resources · About Us. Services opens the mega menu; the rest are direct links.
 *
 * Their scroll-spy anchors become real destinations — "Industries" points at the
 * Industry Hub section that exists on the home page rather than a page we have
 * not built.
 */
export const NAV_LINKS: NavLink[] = [
  { label: "License Types", href: "/services" },
  { label: "Industries", href: "/#sectors" },
  { label: "Resources", href: "/explore" },
  { label: "About Us", href: "/about" },
];

/** Footer link groups, from their Footer. */
export const FOOTER_GROUPS: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "Our clients", href: "/clients" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "Find your licence", href: "/fssai-calculator" },
      { label: "Documents required", href: "/services#documents" },
      { label: "Membership & pricing", href: "/membership" },
      { label: "FoSTaC training", href: "/fsm-registration" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQs", href: "/faq" },
      { label: "Book a consultation", href: "/book" },
      { label: "Privacy policy", href: "/privacy" },
      // Their footer lists "Terms", but no terms page exists yet — a link to
      // /terms would 404. Restore this the moment the page is written.
    ],
  },
];

/**
 * The "Aligned with" strip in their footer. FSSAI, FoSTaC and NABL are real
 * bodies we work to; their fourth item ("100% Legal & Compliant") is a claim
 * rather than an alignment, so it is dropped.
 */
export const ALIGNED_WITH: { name: string; note: string }[] = [
  { name: "FSSAI", note: "Food Safety & Standards Authority of India" },
  { name: "FoSTaC", note: "Food Safety Training & Certification" },
  { name: "NABL", note: "Accredited testing laboratories" },
];
