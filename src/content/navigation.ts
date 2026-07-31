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

/** The Services mega-menu, four columns as in their Navbar. */
export const SERVICES_MEGA: MegaColumn[] = [
  {
    heading: "License Services",
    tone: "blue",
    links: [
      {
        label: "Licence classification & application",
        href: "/fssai-calculator",
      },
      {
        label: "Documentation prepared and filed",
        href: "/services#documents",
      },
      {
        label: "Follow-up & query response till conclusion",
        href: "/services",
      },
      { label: "Licence modification", href: "/book" },
      { label: "Fortified / Organic / Vegan endorsement", href: "/book" },
      { label: "Annual return filing guidance", href: "/membership" },
      { label: "Licence renewal", href: "/book" },
    ],
  },
  {
    heading: "Documentation",
    tone: "green",
    links: [
      { label: "FSMS documentation checklist", href: "/services#documents" },
      {
        label: "Preparation & verification by our team",
        href: "/services#documents",
      },
      { label: "On-field FSMS implementation", href: "/book" },
      { label: "FSSAI post-licence checklist", href: "/services#documents" },
      { label: "Import clearance query responses", href: "/book" },
      { label: "Annual medical exam assistance", href: "/membership" },
    ],
  },
  {
    heading: "Facility & Product",
    tone: "violet",
    links: [
      { label: "Internal audit field visits", href: "/book" },
      { label: "Facility layout audits", href: "/book" },
      { label: "Third-party FSSAI audits", href: "/book" },
      { label: "Labelling guidance & validation", href: "/book" },
      { label: "Advertising & claim verification", href: "/book" },
      { label: "Nutritional value testing", href: "/book" },
    ],
  },
  {
    heading: "Training & Legal",
    tone: "cyan",
    links: [
      {
        label: "Food handler & managerial training",
        href: "/fsm-registration",
      },
      { label: "Mandatory water & product testing", href: "/book" },
      { label: "Regulatory notice responses", href: "/book" },
      { label: "Adjudication & prosecution support", href: "/book" },
      { label: "Product recall & seizure support", href: "/book" },
    ],
  },
];

/** Top-level items. Their scroll-spy anchors become real pages. */
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Calculator", href: "/fssai-calculator" },
  { label: "Membership", href: "/membership" },
  { label: "Explore", href: "/explore" },
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
