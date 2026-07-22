/**
 * Questionnaire definitions. These are *data* — staff edit them in the
 * database once the section editor exists, and adding a question here never
 * requires a code change on the customer side.
 */
import type { CanonicalFieldDef } from "../src/lib/fields";

export const CATEGORIES: {
  code: string;
  name: string;
  sortOrder: number;
  /** Non-core section keys this category also has to answer. */
  extraSections: string[];
}[] = [
  {
    code: "MANUFACTURER",
    name: "Manufacturer",
    sortOrder: 1,
    extraSections: ["equipment", "nominee", "documents_manufacturer"],
  },
  { code: "RESTAURANT", name: "Restaurant", sortOrder: 2, extraSections: [] },
  { code: "TRADER", name: "Trader", sortOrder: 3, extraSections: [] },
  {
    code: "DISTRIBUTOR",
    name: "Distributor",
    sortOrder: 4,
    extraSections: ["vehicles"],
  },
  { code: "RETAILER", name: "Retailer", sortOrder: 5, extraSections: [] },
  {
    code: "TRANSPORTER",
    name: "Transporter",
    sortOrder: 6,
    extraSections: ["vehicles"],
  },
  {
    code: "STORAGE",
    name: "Storage",
    sortOrder: 7,
    extraSections: ["equipment"],
  },
  {
    code: "CLOUD_KITCHEN",
    name: "Cloud Kitchen",
    sortOrder: 8,
    extraSections: [],
  },
  { code: "CATERER", name: "Caterer", sortOrder: 9, extraSections: [] },
  {
    code: "ECOMMERCE",
    name: "E-commerce",
    sortOrder: 10,
    extraSections: ["nominee"],
  },
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const FOOD_CATEGORIES = [
  "Dairy products and analogues",
  "Fats, oils and fat emulsions",
  "Edible ices",
  "Fruits and vegetables",
  "Confectionery",
  "Cereals and cereal products",
  "Bakery products",
  "Meat and meat products",
  "Fish and fish products",
  "Eggs and egg products",
  "Sweeteners including honey",
  "Salts, spices, soups and sauces",
  "Foods for special dietary uses",
  "Beverages (non-dairy, non-alcoholic)",
  "Ready-to-eat savouries",
  "Prepared foods",
];

export interface SeedSection {
  key: string;
  title: string;
  description: string;
  sortOrder: number;
  /** Core sections are asked of every applicant. */
  isCore: boolean;
  fields: CanonicalFieldDef[];
}

export const SECTIONS: SeedSection[] = [
  {
    key: "business_details",
    title: "Business Details",
    description: "The legal identity of the business, exactly as registered.",
    sortOrder: 1,
    isCore: true,
    fields: [
      {
        key: "business.legal_name",
        label: "Legal name of business",
        type: "text",
        required: true,
        validation: { minLength: 3, maxLength: 200 },
        helpText: "As printed on the GST or incorporation certificate.",
      },
      {
        key: "business.trade_name",
        label: "Trade name",
        type: "text",
        required: false,
        validation: { maxLength: 200 },
        helpText: "The name customers see, if different.",
      },
      {
        key: "business.constitution",
        label: "Constitution",
        type: "select",
        required: true,
        options: [
          "Proprietorship",
          "Partnership",
          "LLP",
          "Private Limited Company",
          "Public Limited Company",
          "Society",
          "Trust",
          "Co-operative",
        ],
      },
      {
        key: "business.pan",
        label: "PAN",
        type: "text",
        required: true,
        width: "half",
        validation: { pattern: "^[A-Z]{5}[0-9]{4}[A-Z]$" },
        helpText: "Ten characters, e.g. ABCDE1234F.",
      },
      {
        key: "business.gstin",
        label: "GSTIN",
        type: "text",
        required: false,
        width: "half",
        validation: {
          pattern: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$",
        },
        helpText: "Leave blank if not registered for GST.",
      },
      {
        key: "business.incorporation_date",
        label: "Date of incorporation",
        type: "date",
        required: false,
      },
      {
        // Feeds the List of Directors / Partners / Executive members annexure.
        // A proprietorship leaves this empty: the applicant is the only person.
        key: "business.directors",
        label: "Directors, partners or executive members",
        type: "group",
        required: false,
        itemLabel: "person",
        helpText:
          "Leave empty for a proprietorship — you are the only person listed.",
        itemFields: [
          {
            key: "name",
            label: "Full name",
            type: "text",
            required: true,
            width: "half",
          },
          {
            key: "designation",
            label: "Designation",
            type: "text",
            required: true,
            width: "half",
          },
          { key: "address", label: "Address", type: "text", required: true },
          {
            key: "contact",
            label: "Contact number",
            type: "tel",
            required: true,
            width: "half",
          },
          {
            key: "id_details",
            label: "Government photo ID",
            type: "text",
            required: false,
            width: "half",
          },
          {
            key: "appointed_on",
            label: "Date of appointment",
            type: "date",
            required: false,
            width: "half",
          },
        ],
      },
    ],
  },
  {
    key: "applicant_details",
    title: "Applicant Details",
    description: "The person who signs the application.",
    sortOrder: 2,
    isCore: true,
    fields: [
      {
        key: "applicant.full_name",
        label: "Full name",
        type: "text",
        required: true,
        validation: { minLength: 3, maxLength: 120 },
      },
      {
        key: "applicant.designation",
        label: "Designation",
        type: "select",
        required: true,
        options: [
          "Proprietor",
          "Partner",
          "Director",
          "Manager",
          "Authorised Signatory",
        ],
      },
      {
        key: "applicant.aadhaar_no",
        label: "Aadhaar number",
        type: "text",
        required: true,
        width: "half",
        validation: { pattern: "^[2-9][0-9]{11}$" },
        helpText: "Twelve digits. Stored under DPDP Act consent.",
      },
      {
        key: "applicant.mobile",
        label: "Mobile number",
        type: "tel",
        required: true,
        width: "half",
      },
      {
        key: "applicant.email",
        label: "Email",
        type: "email",
        required: false,
        validation: { maxLength: 160 },
      },
    ],
  },
  {
    key: "premises",
    title: "Premises & Address",
    description: "Where food is handled. One licence covers one address.",
    sortOrder: 3,
    isCore: true,
    fields: [
      {
        key: "premises.address_1",
        label: "Address line 1",
        type: "text",
        required: true,
        validation: { minLength: 3, maxLength: 200 },
        helpText: "Shop or building number.",
      },
      {
        key: "premises.address_2",
        label: "Address line 2",
        type: "text",
        required: false,
        validation: { maxLength: 200 },
        helpText: "Street and area.",
      },
      {
        key: "premises.city",
        label: "City or town",
        type: "text",
        required: true,
        width: "half",
      },
      {
        key: "premises.pincode",
        label: "PIN code",
        type: "text",
        required: true,
        width: "half",
        validation: { pattern: "^[1-9][0-9]{5}$" },
      },
      {
        key: "premises.district",
        label: "District",
        type: "text",
        required: true,
        width: "half",
      },
      {
        key: "premises.state",
        label: "State",
        type: "select",
        required: true,
        width: "half",
        options: INDIAN_STATES,
      },
      {
        key: "premises.ownership",
        label: "Ownership of premises",
        type: "radio",
        required: true,
        options: ["Owned", "Rented", "Leased", "Shared"],
        helpText: "Rented or leased premises need a rent agreement and NOC.",
      },
      {
        key: "premises.area_sqft",
        label: "Area (sq ft)",
        type: "number",
        required: true,
        validation: { min: 1, max: 1000000 },
      },
    ],
  },
  {
    key: "licence_details",
    title: "Licence & Food Categories",
    description: "What you are applying for and what you handle.",
    sortOrder: 4,
    isCore: true,
    fields: [
      {
        key: "licence.type",
        label: "Licence type",
        type: "select",
        required: true,
        options: ["Basic Registration", "State Licence", "Central Licence"],
        helpText: "Decided by turnover and scale — your agent confirms this.",
      },
      {
        key: "licence.kob",
        label: "Kind of business",
        type: "select",
        required: true,
        options: CATEGORIES.map((category) => category.name),
      },
      {
        key: "licence.food_categories",
        label: "Food categories handled",
        type: "multiselect",
        required: true,
        options: FOOD_CATEGORIES,
        helpText: "Choose everything you prepare, store, sell or move.",
      },
      {
        key: "licence.duration_years",
        label: "Licence duration",
        type: "radio",
        required: true,
        options: ["1 year", "2 years", "3 years", "4 years", "5 years"],
        helpText: "Longer terms cost less per year and mean fewer renewals.",
      },
    ],
  },
  {
    key: "equipment",
    title: "Equipment & Capacity",
    description: "Machinery installed and how much you can produce or store.",
    sortOrder: 5,
    isCore: false,
    fields: [
      {
        key: "equipment.list",
        label: "Equipment and machinery",
        type: "group",
        required: true,
        itemLabel: "machine",
        helpText: "Add each machine with how many you have.",
        itemFields: [
          {
            key: "name",
            label: "Equipment",
            type: "text",
            required: true,
            width: "half",
          },
          {
            key: "quantity",
            label: "Quantity",
            type: "number",
            required: true,
            width: "half",
            validation: { min: 1, max: 10000 },
          },
          {
            key: "capacity",
            label: "Capacity or rating",
            type: "text",
            required: false,
          },
        ],
      },
      {
        key: "equipment.installed_capacity",
        label: "Installed capacity",
        type: "text",
        required: true,
        helpText: "e.g. 500 kg per day, or 200 meals per day.",
      },
    ],
  },
  {
    key: "water",
    title: "Water Source",
    description: "Water used in preparation must be tested every year.",
    sortOrder: 6,
    isCore: true,
    fields: [
      {
        key: "water.source",
        label: "Source of water",
        type: "select",
        required: true,
        width: "half",
        options: [
          "Municipal supply",
          "Borewell",
          "Packaged water",
          "Tanker supply",
          "Well",
        ],
      },
      {
        key: "water.test_report_date",
        label: "Date of water test report",
        type: "date",
        required: true,
        width: "half",
        helpText: "From a NABL-accredited laboratory, within 12 months.",
      },
    ],
  },
  {
    key: "nominee",
    title: "Nominee",
    description: "The person responsible for food safety compliance.",
    sortOrder: 7,
    isCore: false,
    fields: [
      {
        key: "nominee.name",
        label: "Nominee name",
        type: "text",
        required: true,
        width: "half",
      },
      {
        key: "nominee.designation",
        label: "Nominee designation",
        type: "text",
        required: true,
        width: "half",
      },
      {
        key: "nominee.address",
        label: "Nominee address",
        type: "multiline",
        required: true,
        validation: { maxLength: 400 },
      },
    ],
  },
  {
    key: "vehicles",
    title: "Vehicles",
    description: "Vehicles used to move food.",
    sortOrder: 8,
    isCore: false,
    fields: [
      {
        key: "vehicle.count",
        label: "Number of vehicles",
        type: "number",
        required: true,
        validation: { min: 1, max: 5000 },
      },
      {
        key: "vehicle.registration_numbers",
        label: "Vehicle registrations",
        type: "group",
        required: true,
        itemLabel: "vehicle",
        helpText: "One row per vehicle, as printed on the RC.",
        itemFields: [
          {
            key: "registration",
            label: "Registration number",
            type: "text",
            required: true,
            width: "half",
            validation: { pattern: "^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$" },
          },
          {
            key: "vehicle_type",
            label: "Vehicle type",
            type: "select",
            required: true,
            width: "half",
            options: [
              "Refrigerated van",
              "Insulated truck",
              "Tempo",
              "Two-wheeler",
            ],
          },
        ],
      },
    ],
  },
  {
    key: "documents",
    title: "Documents",
    description:
      "Scans or clear photographs. PDF, JPG or PNG, up to 10 MB each.",
    sortOrder: 9,
    isCore: true,
    fields: [
      {
        key: "doc.aadhaar",
        label: "Aadhaar card of the applicant",
        type: "file",
        required: true,
        helpText: "Both sides, in one file if you can.",
      },
      {
        key: "doc.pan_card",
        label: "PAN card of the business",
        type: "file",
        required: true,
      },
      {
        key: "doc.premises_proof",
        label: "Proof of premises",
        type: "file",
        required: true,
        helpText: "Rent agreement, electricity bill or ownership deed.",
      },
      {
        key: "doc.noc_owner",
        label: "NOC from the premises owner",
        type: "file",
        required: false,
        helpText: "Only if the premises are rented or shared.",
      },
      {
        key: "doc.letterhead_logo",
        label: "Business logo for the letterhead",
        type: "file",
        required: false,
        helpText:
          "Used on generated annexures. PNG with a transparent background works best.",
      },
      {
        key: "doc.water_test_report",
        label: "Water test report",
        type: "file",
        required: true,
        helpText: "From a NABL-accredited laboratory, within 12 months.",
      },
    ],
  },
  {
    key: "documents_manufacturer",
    title: "Manufacturing Documents",
    description:
      "Extra paperwork FSSAI asks manufacturers and storage units for.",
    sortOrder: 10,
    isCore: false,
    fields: [
      {
        key: "doc.layout_plan",
        label: "Layout plan of the unit",
        type: "file",
        required: true,
        helpText: "Dimensioned plan showing the processing areas.",
      },
      {
        key: "doc.machinery_list",
        label: "List of machinery with capacity",
        type: "file",
        required: true,
      },
    ],
  },
  {
    key: "photo_signature",
    title: "Photo & Signature",
    description: "Captured once and placed on every form that needs them.",
    sortOrder: 11,
    isCore: true,
    fields: [
      {
        key: "applicant.photo",
        label: "Passport photograph",
        type: "file",
        required: true,
        helpText: "Plain background, head and shoulders, 3:4.",
      },
      {
        key: "applicant.signature",
        label: "Signature",
        type: "signature",
        required: true,
        helpText: "Draw it, or upload a scan on white paper.",
      },
    ],
  },
  {
    key: "declaration",
    title: "Declaration",
    description: "Confirm the information is true and consent to its use.",
    sortOrder: 12,
    isCore: true,
    fields: [
      // Both of these were asked in earlier sections. They appear here
      // because the declaration prints them — never to be typed again.
      {
        key: "business.legal_name",
        label: "On behalf of",
        type: "text",
        required: true,
      },
      {
        key: "applicant.full_name",
        label: "Declared by",
        type: "text",
        required: true,
      },
      {
        key: "declaration.place",
        label: "Place of declaration",
        type: "text",
        required: true,
        validation: { minLength: 2, maxLength: 80 },
        helpText: "The town or city you are signing in.",
      },
      {
        key: "declaration.accepted",
        label: "I declare the information given is true and complete",
        type: "checkbox",
        required: true,
        helpText:
          "Knowingly giving false information on an FSSAI application is an offence.",
      },
    ],
  },
];
