/**
 * Seed — every stage must be testable straight after `npm run db:seed`.
 * Idempotent: safe to re-run. Passwords are regenerated and printed each time.
 */
import { randomBytes } from "node:crypto";
import { PrismaClient, type Prisma } from "@prisma/client";
// Same Argon2id parameters the application uses — one definition, not two.
import { hashPassword } from "../src/lib/auth/password";
import type { FieldDef } from "../src/lib/fields";

const prisma = new PrismaClient();

/** Readable but not guessable — printed once, never stored in plain text. */
function generatePassword(): string {
  return `fr-${randomBytes(6).toString("base64url")}`;
}

function password(envKey: string): string {
  return process.env[envKey] ?? generatePassword();
}

/* ────────────────────────────────────────────── business categories */

const CATEGORIES: {
  code: string;
  name: string;
  sortOrder: number;
  extraSections: string[];
}[] = [
  {
    code: "MANUFACTURER",
    name: "Manufacturer",
    sortOrder: 1,
    extraSections: ["nominee"],
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
  { code: "STORAGE", name: "Storage", sortOrder: 7, extraSections: [] },
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

/* ─────────────────────────────────────────────────── form sections */

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

const SECTIONS: {
  key: string;
  title: string;
  description: string;
  sortOrder: number;
  isCore: boolean;
  fields: FieldDef[];
}[] = [
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
        validation: { pattern: "^[A-Z]{5}[0-9]{4}[A-Z]$" },
        helpText: "Ten characters, e.g. ABCDE1234F.",
      },
      {
        key: "business.gstin",
        label: "GSTIN",
        type: "text",
        required: false,
        validation: {
          pattern: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$",
        },
        helpText: "Leave blank if the business is not registered for GST.",
      },
      {
        key: "business.incorporation_date",
        label: "Date of incorporation",
        type: "date",
        required: false,
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
        validation: { pattern: "^[2-9][0-9]{11}$" },
        helpText: "Twelve digits. Stored under DPDP Act consent.",
      },
      {
        key: "applicant.mobile",
        label: "Mobile number",
        type: "tel",
        required: true,
        validation: { pattern: "^[6-9][0-9]{9}$" },
      },
      {
        key: "applicant.email",
        label: "Email",
        type: "email",
        required: false,
        validation: { maxLength: 160 },
      },
      {
        key: "applicant.photo",
        label: "Passport photograph",
        type: "file",
        required: true,
        helpText: "JPEG or PNG, under 2 MB, plain background.",
      },
      {
        key: "applicant.signature",
        label: "Signature",
        type: "signature",
        required: true,
        helpText: "Signed on white paper, photographed straight on.",
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
      },
      {
        key: "premises.address_2",
        label: "Address line 2",
        type: "text",
        required: false,
        validation: { maxLength: 200 },
      },
      {
        key: "premises.city",
        label: "City or town",
        type: "text",
        required: true,
      },
      {
        key: "premises.district",
        label: "District",
        type: "text",
        required: true,
      },
      {
        key: "premises.state",
        label: "State",
        type: "select",
        required: true,
        options: INDIAN_STATES,
      },
      {
        key: "premises.pincode",
        label: "PIN code",
        type: "text",
        required: true,
        validation: { pattern: "^[1-9][0-9]{5}$" },
      },
      {
        key: "premises.ownership",
        label: "Ownership",
        type: "select",
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
        options: [
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
        ],
      },
      {
        key: "licence.duration_years",
        label: "Licence duration",
        type: "select",
        required: true,
        options: ["1", "2", "3", "4", "5"],
        helpText: "Longer terms cost less per year and mean fewer renewals.",
      },
    ],
  },
  {
    key: "equipment",
    title: "Equipment & Capacity",
    description: "Machinery installed and how much you can produce or store.",
    sortOrder: 5,
    isCore: true,
    fields: [
      {
        key: "equipment.list",
        label: "Equipment and machinery",
        type: "textarea",
        required: true,
        validation: { maxLength: 2000 },
        helpText: "One item per line, with quantity. e.g. Deep freezer × 2",
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
    description: "Water used in preparation must be tested annually.",
    sortOrder: 6,
    isCore: true,
    fields: [
      {
        key: "water.source",
        label: "Source of water",
        type: "select",
        required: true,
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
        helpText:
          "Must be from a NABL-accredited laboratory, within 12 months.",
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
      },
      {
        key: "nominee.designation",
        label: "Nominee designation",
        type: "text",
        required: true,
      },
      {
        key: "nominee.address",
        label: "Nominee address",
        type: "textarea",
        required: true,
        validation: { maxLength: 400 },
      },
    ],
  },
  {
    key: "vehicles",
    title: "Vehicles",
    description:
      "Vehicles used to move food. Transporters and distributors only.",
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
        label: "Registration numbers",
        type: "textarea",
        required: true,
        validation: { maxLength: 4000 },
        helpText: "One per line, e.g. MH12AB1234",
      },
    ],
  },
  {
    key: "documents",
    title: "Documents",
    description: "Scans and photographs FSSAI requires alongside the forms.",
    sortOrder: 9,
    isCore: true,
    fields: [
      {
        key: "applicant.photo",
        label: "Applicant photograph",
        type: "file",
        required: true,
      },
      {
        key: "applicant.signature",
        label: "Signature specimen",
        type: "signature",
        required: true,
      },
    ],
  },
  {
    key: "declaration",
    title: "Declaration & Consent",
    description:
      "Confirm the information is true and consent to its processing.",
    sortOrder: 10,
    isCore: true,
    fields: [
      {
        key: "applicant.full_name",
        label: "Name of person declaring",
        type: "text",
        required: true,
      },
      {
        key: "applicant.signature",
        label: "Signature of declarant",
        type: "signature",
        required: true,
        helpText:
          "By signing you confirm the information is true and consent to FoodRaksha processing it under the DPDP Act 2023.",
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────── demo data */

const SPICE_ROUTE_DATA: Prisma.InputJsonValue = {
  "business.legal_name": "Spice Route Kitchen Private Limited",
  "business.trade_name": "Spice Route Kitchen",
  "business.constitution": "Private Limited Company",
  "business.pan": "AAGCS4821K",
  "business.gstin": "29AAGCS4821K1ZP",
  "business.incorporation_date": "2021-06-14",
  "applicant.full_name": "Meera Raghavan",
  "applicant.designation": "Director",
  "applicant.aadhaar_no": "742913856402",
  "applicant.mobile": "9845021764",
  "applicant.email": "meera@spiceroute.in",
  "premises.address_1": "42, 8th Main Road",
  "premises.address_2": "Jayanagar 3rd Block",
  "premises.city": "Bengaluru",
  "premises.district": "Bengaluru Urban",
  "premises.state": "Karnataka",
  "premises.pincode": "560011",
  "premises.ownership": "Rented",
  "premises.area_sqft": 1850,
  "licence.type": "State Licence",
  "licence.kob": "Restaurant",
  "licence.food_categories": [
    "Prepared foods",
    "Bakery products",
    "Beverages (non-dairy, non-alcoholic)",
  ],
  "licence.duration_years": "3",
  "equipment.list":
    "Commercial gas range × 2\nDeep freezer × 2\nDough kneader × 1\nExhaust hood × 3",
  "equipment.installed_capacity": "400 meals per day",
};

const KONKAN_DATA: Prisma.InputJsonValue = {
  "business.legal_name": "Konkan Foods LLP",
  "business.trade_name": "Konkan Foods",
  "business.constitution": "LLP",
  "business.pan": "ABDFK9012M",
  "applicant.full_name": "Arjun Desai",
  "applicant.designation": "Partner",
  "applicant.mobile": "9822314507",
  "applicant.email": "arjun@konkanfoods.in",
};

/* ──────────────────────────────────────────────────────────── seed */

async function main() {
  const credentials: { who: string; mobile: string; password: string }[] = [];

  // ── Admin staff user
  const adminPassword = password("SEED_ADMIN_PASSWORD");
  const admin = await prisma.user.upsert({
    where: { mobile: "+919000000001" },
    update: {
      role: "ADMIN",
      name: "Priya Nair",
      email: "priya@foodraksha.in",
      passwordHash: await hashPassword(adminPassword),
      isActive: true,
    },
    create: {
      role: "ADMIN",
      name: "Priya Nair",
      mobile: "+919000000001",
      email: "priya@foodraksha.in",
      passwordHash: await hashPassword(adminPassword),
    },
  });
  credentials.push({
    who: "ADMIN staff",
    mobile: admin.mobile,
    password: adminPassword,
  });

  // ── Business categories
  for (const category of CATEGORIES) {
    await prisma.businessCategory.upsert({
      where: { code: category.code },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        extraSections: category.extraSections,
        isActive: true,
      },
      create: category,
    });
  }

  // ── Form sections
  for (const section of SECTIONS) {
    await prisma.formSection.upsert({
      where: { key: section.key },
      update: {
        title: section.title,
        description: section.description,
        sortOrder: section.sortOrder,
        isCore: section.isCore,
        fields: section.fields as unknown as Prisma.InputJsonValue,
      },
      create: {
        ...section,
        fields: section.fields as unknown as Prisma.InputJsonValue,
      },
    });
  }

  const restaurant = await prisma.businessCategory.findUniqueOrThrow({
    where: { code: "RESTAURANT" },
  });
  const manufacturer = await prisma.businessCategory.findUniqueOrThrow({
    where: { code: "MANUFACTURER" },
  });

  // ── Demo customer 1 — well advanced, staff reviewing
  const meeraPassword = password("SEED_CUSTOMER_1_PASSWORD");
  const meera = await prisma.user.upsert({
    where: { mobile: "+919845021764" },
    update: {
      name: "Meera Raghavan",
      email: "meera@spiceroute.in",
      passwordHash: await hashPassword(meeraPassword),
      isActive: true,
    },
    create: {
      role: "CUSTOMER",
      name: "Meera Raghavan",
      mobile: "+919845021764",
      email: "meera@spiceroute.in",
      passwordHash: await hashPassword(meeraPassword),
      customer: {
        create: {
          businessName: "Spice Route Kitchen",
          city: "Bengaluru",
          state: "Karnataka",
        },
      },
    },
    include: { customer: true },
  });
  const meeraCustomer =
    meera.customer ??
    (await prisma.customer.findUniqueOrThrow({ where: { userId: meera.id } }));
  credentials.push({
    who: "CUSTOMER — Spice Route Kitchen",
    mobile: meera.mobile,
    password: meeraPassword,
  });

  await prisma.application.upsert({
    where: { applicationNo: "FR-2026-0248" },
    update: {
      status: "UNDER_REVIEW",
      data: SPICE_ROUTE_DATA,
      completedSections: [
        "business_details",
        "applicant_details",
        "premises",
        "licence_details",
        "equipment",
      ],
    },
    create: {
      applicationNo: "FR-2026-0248",
      customerId: meeraCustomer.id,
      categoryId: restaurant.id,
      licenceType: "STATE",
      status: "UNDER_REVIEW",
      data: SPICE_ROUTE_DATA,
      completedSections: [
        "business_details",
        "applicant_details",
        "premises",
        "licence_details",
        "equipment",
      ],
      submittedAt: new Date("2026-07-09T06:20:00Z"),
    },
  });

  // ── Demo customer 2 — barely started
  const arjunPassword = password("SEED_CUSTOMER_2_PASSWORD");
  const arjun = await prisma.user.upsert({
    where: { mobile: "+919822314507" },
    update: {
      name: "Arjun Desai",
      email: "arjun@konkanfoods.in",
      passwordHash: await hashPassword(arjunPassword),
      isActive: true,
    },
    create: {
      role: "CUSTOMER",
      name: "Arjun Desai",
      mobile: "+919822314507",
      email: "arjun@konkanfoods.in",
      passwordHash: await hashPassword(arjunPassword),
      customer: {
        create: {
          businessName: "Konkan Foods",
          city: "Ratnagiri",
          state: "Maharashtra",
        },
      },
    },
    include: { customer: true },
  });
  const arjunCustomer =
    arjun.customer ??
    (await prisma.customer.findUniqueOrThrow({ where: { userId: arjun.id } }));
  credentials.push({
    who: "CUSTOMER — Konkan Foods",
    mobile: arjun.mobile,
    password: arjunPassword,
  });

  await prisma.application.upsert({
    where: { applicationNo: "FR-2026-0251" },
    update: {
      status: "DRAFT",
      data: KONKAN_DATA,
      completedSections: ["business_details"],
    },
    create: {
      applicationNo: "FR-2026-0251",
      customerId: arjunCustomer.id,
      categoryId: manufacturer.id,
      licenceType: "CENTRAL",
      status: "DRAFT",
      data: KONKAN_DATA,
      completedSections: ["business_details"],
    },
  });

  console.log("\nSeeded:");
  console.log(`  ${CATEGORIES.length} business categories`);
  console.log(
    `  ${SECTIONS.length} form sections (${SECTIONS.filter((s) => s.isCore).length} core)`,
  );
  console.log("  2 demo customers with applications\n");
  console.log("Sign in with:");
  for (const entry of credentials) {
    console.log(`  ${entry.who}`);
    console.log(`    mobile:   ${entry.mobile}`);
    console.log(`    password: ${entry.password}`);
  }
  console.log(
    "\nStaff sign in at /staff/login · customers at /login." +
      "\nPasswords are printed once and stored only as Argon2id hashes.\n",
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
