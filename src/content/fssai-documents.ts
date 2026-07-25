import { findKob, type KobGroup } from "./fssai-fees";

/**
 * What an FSSAI application actually needs, per kind of business.
 *
 * Source: docs/FINDINGS.md §1, which cleaned the legacy site's
 * `GetDocumentRequirements` response. Two things came out of that investigation
 * and both are encoded here:
 *
 *  1. The list splits in two. Some documents can be GENERATED from the
 *     questionnaire answers (Form IX, the directors list, the recall plan, the
 *     proprietorship declaration, the equipment schedule) — those are the ones
 *     Food Raksha prepares. The rest must be obtained and uploaded by the
 *     customer, because no data can conjure a rent agreement or a water report.
 *     `preparedByUs` marks the difference, and the UI must show it: it is the
 *     single most persuasive fact on the page.
 *  2. The legacy source was dirty — single requirements split on commas into two
 *     rows, and `kindOfBusiness=All` returned 144 undeduplicated rows. This file
 *     is the cleaned ~18 unique requirements mapped to categories, which is
 *     exactly what FINDINGS.md said had to happen before reuse.
 *
 * Sample documents are the FSSAI's own specimens, already in the repo at
 * docs/forms and published to /samples. A document with no sample simply shows
 * no link — we never invent a foscos.fssai.gov.in URL.
 */

export interface DocumentRequirement {
  id: string;
  label: string;
  /** The condition that makes this one apply, when it isn't universal. */
  appliesWhen?: string;
  /** Public path to the FSSAI specimen, when we hold one. */
  sampleUrl?: string;
  /**
   * True when Food Raksha produces it from your questionnaire answers, so the
   * customer never has to draft it.
   */
  preparedByUs?: boolean;
}

export interface DocumentSection {
  title: string;
  /** Why this group of documents is being asked for. */
  note?: string;
  documents: DocumentRequirement[];
}

/* ─────────────────────────────────────────── core (every category) */

export const CORE_DOCUMENTS: DocumentRequirement[] = [
  {
    id: "directors-list",
    label:
      "List of directors / partners / proprietor, with addresses and the nominated signatory",
    sampleUrl: "/samples/LIST_OF_DIRECTORS_SAMPLE.pdf",
    preparedByUs: true,
  },
  {
    id: "photo-id",
    label:
      "Photo ID and address proof of the proprietor, partners or directors (Aadhaar / PAN / passport)",
  },
  {
    id: "premises-possession",
    label:
      "Proof of possession of the premises — sale deed, rent agreement or electricity bill",
  },
  /* The constitution document splits cleanly along the FINDINGS.md line: a deed
     or MOA already exists and must be uploaded, whereas a proprietor's
     declaration is drafted from the questionnaire. Keeping them as one row read
     as a contradiction — "upload it" and "we prepare it" for the same thing. */
  {
    id: "constitution-proof",
    label: "Partnership deed, or MOA & AOA for a company",
    appliesWhen: "Partnerships, LLPs and companies",
    sampleUrl: "/samples/PARTNERSHIP_SELF_DECLARATION_SAMPLE.pdf",
  },
  {
    id: "proprietorship-declaration",
    label: "Self-declaration of proprietorship",
    appliesWhen: "Proprietorships only",
    sampleUrl: "/samples/AFFIDAVIT_OF_PROPRIETORSHIP.pdf",
    preparedByUs: true,
  },
  {
    id: "form-ix",
    label:
      "Form IX — nomination of the person responsible, under Clause 2.5 of the FSS Rules, 2008",
    appliesWhen: "Not required for a proprietorship",
    sampleUrl: "/samples/FORM_IX.pdf",
    preparedByUs: true,
  },
  {
    id: "water-test",
    label: "Water analysis report — chemical and bacteriological",
    appliesWhen: "When water is used as an ingredient in the food",
  },
  {
    id: "fsms-plan",
    label: "Food Safety Management System plan or declaration",
    preparedByUs: true,
  },
];

/* ─────────────────────────────────────────── per group */

const MANUFACTURER_DOCUMENTS: DocumentRequirement[] = [
  {
    id: "layout-plan",
    label:
      "Blueprint / layout plan of the processing unit, with dimensions and area allocation",
  },
  {
    id: "equipment-list",
    label:
      "Name and list of equipment and machinery, with number, installed capacity and horsepower used",
    preparedByUs: true,
  },
  { id: "unit-photos", label: "Photographs of the production unit" },
  {
    id: "recall-plan",
    label: "Product recall plan",
    preparedByUs: true,
  },
  {
    id: "municipal-noc",
    label: "NOC from the municipal corporation or local body",
    appliesWhen: "Where the local authority requires one",
  },
];

const TRADE_DOCUMENTS: DocumentRequirement[] = [
  {
    id: "storage-details",
    label: "Details of the storage or transport facility, with capacity",
    appliesWhen: "Storage, transport and warehousing businesses",
  },
];

const FOOD_SERVICE_DOCUMENTS: DocumentRequirement[] = [
  {
    id: "kitchen-layout",
    label: "Layout of the kitchen and service area",
    appliesWhen: "State licence and above",
  },
  {
    id: "municipal-noc-fs",
    label: "NOC from the municipal corporation or local body",
    appliesWhen: "Where the local authority requires one",
  },
];

const GOVT_AGENCY_DOCUMENTS: DocumentRequirement[] = [
  {
    id: "agency-authorisation",
    label:
      "Authorisation or allotment letter from the central government agency or authority",
  },
];

const HEAD_OFFICE_DOCUMENTS: DocumentRequirement[] = [
  {
    id: "branch-list",
    label: "List of the units or branches the head office covers",
    preparedByUs: true,
  },
];

const BY_GROUP: Record<KobGroup, DocumentRequirement[]> = {
  Manufacturer: MANUFACTURER_DOCUMENTS,
  "Trade / Retail": TRADE_DOCUMENTS,
  "Food Services": FOOD_SERVICE_DOCUMENTS,
  "Central Government Agencies": GOVT_AGENCY_DOCUMENTS,
  "Head Office": HEAD_OFFICE_DOCUMENTS,
};

/**
 * Written out per group rather than templated from the group name — "Because you
 * are in manufacturer" is not a sentence.
 */
const GROUP_SECTION_TITLE: Record<KobGroup, string> = {
  Manufacturer: "Because you manufacture or process food",
  "Trade / Retail": "Because you trade, store or transport food",
  "Food Services": "Because you serve prepared food",
  "Central Government Agencies":
    "Because you operate under a central government agency",
  "Head Office": "Because this is a head office",
};

/* ─────────────────────────────────────────── per kind of business */

/**
 * Commodity-specific requirements, keyed by `Kob.id`. From the "commodity
 * specific" line in FINDINGS.md — these are the ones the FSSAI asks for on top
 * of the category list.
 */
const BY_KOB: Record<string, DocumentRequirement[]> = {
  "dairy-units": [
    {
      id: "milk-procurement",
      label: "Milk procurement plan, with the source of raw milk",
    },
  ],
  "meat-processing": [
    {
      id: "meat-source",
      label: "Source of the raw meat and slaughterhouse details",
    },
  ],
  "slaughtering-unit": [
    {
      id: "slaughter-approval",
      label: "Municipal or veterinary approval for the slaughtering facility",
    },
  ],
  "fish-and-fish-products": [
    {
      id: "fish-guidance",
      label: "Fish and fisheries processing details, per the FSSAI guidance note",
    },
  ],
  "supplements-nutraceuticals": [
    {
      id: "nutraceutical-composition",
      label:
        "Product composition and label, per the FSSAI nutraceuticals guidance",
    },
  ],
  "ayurveda-aahara": [
    {
      id: "ayurveda-compendium",
      label: "Ayurveda Aahara compendium reference for each product",
    },
  ],
  importer: [
    {
      id: "iec-importer",
      label: "Import Export Code (IEC) issued by the DGFT",
    },
  ],
  "exporter-manufacturer": [
    { id: "iec-exporter", label: "Import Export Code (IEC) issued by the DGFT" },
  ],
  "trader-merchant-exporter": [
    { id: "iec-trader", label: "Import Export Code (IEC) issued by the DGFT" },
  ],
  "export-oriented-unit": [
    {
      id: "eou-certificate",
      label: "Ministry of Commerce 100% Export Oriented Unit certificate",
    },
  ],
  "e-commerce": [
    {
      id: "ecommerce-undertaking",
      label: "Undertaking listing the food businesses selling on the platform",
    },
  ],
};

/* ─────────────────────────────────────────── lookup */

/**
 * The tailored checklist for one kind of business, in display sections. Returns
 * an empty array for an unknown id rather than guessing a list.
 */
export function documentsForKob(kobId: string): DocumentSection[] {
  const kob = findKob(kobId);
  if (!kob) return [];

  const sections: DocumentSection[] = [
    {
      title: "Every application needs these",
      documents: CORE_DOCUMENTS,
    },
  ];

  const group = BY_GROUP[kob.group];
  if (group.length > 0) {
    sections.push({
      title: GROUP_SECTION_TITLE[kob.group],
      documents: group,
    });
  }

  const specific = BY_KOB[kob.id];
  if (specific?.length) {
    sections.push({
      title: `Specific to ${kob.label.toLowerCase()}`,
      note: "The FSSAI asks for these on top of the category list.",
      documents: specific,
    });
  }

  return sections;
}

/** How many of the checklist's documents we draft for you. */
export function documentCounts(sections: DocumentSection[]): {
  total: number;
  preparedByUs: number;
  youUpload: number;
} {
  const all = sections.flatMap((section) => section.documents);
  const preparedByUs = all.filter((doc) => doc.preparedByUs).length;
  return {
    total: all.length,
    preparedByUs,
    youUpload: all.length - preparedByUs,
  };
}

/* ─────────────────────────────────────────── FAQ */

/**
 * Document questions, for the visible FAQ and the page's FAQPage structured
 * data. Targets "documents required for FSSAI licence" and its variants.
 */
export const DOCUMENTS_FAQ: { q: string; a: string }[] = [
  {
    q: "What documents are required for an FSSAI licence?",
    a: "Every application needs the list of directors, partners or proprietor with the nominated signatory; photo ID and address proof; proof of possession of the premises (sale deed, rent agreement or electricity bill); your constitution document (partnership deed, MOA & AOA, or a self-declaration of proprietorship); Form IX nominating the person responsible; a water analysis report where water is a food ingredient; and a Food Safety Management System plan. Manufacturers additionally need a layout plan, an equipment and machinery schedule with installed capacity, production-unit photographs and a recall plan. Use the checker on this page for the list tailored to your kind of business.",
  },
  {
    q: "Which documents does Food Raksha prepare for me?",
    a: "We draft everything that can be produced from your answers: Form IX, the list of directors, partners or proprietor, the self-declaration of proprietorship, the recall plan, the equipment and machinery schedule, and the Food Safety Management System declaration. You only obtain the documents nobody can generate for you — your ID, proof of premises, constitution document and water test report.",
  },
  {
    q: "Do I need a water test report for an FSSAI licence?",
    a: "Only when water is used as an ingredient in the food you make. It must be a chemical and bacteriological analysis from a recognised laboratory. A retailer or trader who does not use water as an ingredient does not need one.",
  },
  {
    q: "Is Form IX required for a proprietorship?",
    a: "No. Form IX nominates the person responsible under Clause 2.5 of the FSS Rules, 2008, and it is not applicable where the business is a proprietorship — the proprietor is already the responsible person. Companies, partnerships and LLPs do need it.",
  },
  {
    q: "Do I need a blueprint or layout plan?",
    a: "Manufacturing and processing units do: a blueprint or layout plan of the unit showing dimensions and area allocation. Food service businesses need a kitchen and service-area layout at State licence and above. Traders and retailers generally do not.",
  },
];
