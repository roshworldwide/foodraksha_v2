/**
 * Seed.
 *
 * Always creates: reference data (business categories, form sections) and
 * exactly one ADMIN user. Every write is an upsert on a unique key, so this is
 * idempotent — safe to run against a live database, and safe to run twice.
 *
 * Demo customers, applications and leads are created ONLY when SEED_DEMO is
 * "true". Production runs the seed without that flag, so no fake data ever
 * reaches the client's database.
 *
 * Passwords are regenerated on each run and printed once; only the Argon2id
 * hash is stored.
 */
import { randomBytes } from "node:crypto";
import { PrismaClient, type AppStatus, type Prisma } from "@prisma/client";
// Same Argon2id parameters the application uses — one definition, not two.
import { hashPassword } from "../src/lib/auth/password";
import { CATEGORIES, SECTIONS } from "./seed-data";

const prisma = new PrismaClient();

/** Readable but not guessable — printed once, never stored in plain text. */
function generatePassword(): string {
  return `fr-${randomBytes(6).toString("base64url")}`;
}

function password(envKey: string): string {
  // `||`, not `??`: an empty environment variable means "not set", and must
  // never become an account with an empty password.
  return process.env[envKey] || generatePassword();
}

/* ─────────────────────────────────────────────────────── demo data */

/**
 * Answers keyed by canonical field key, exactly as the questionnaire writes
 * them. Meera is a restaurant, so she never sees the equipment section.
 */
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
  "licence.duration_years": "3 years",
};

/**
 * Fatima is the annexure case: a proprietorship restaurant with every question
 * answered, so Form IX, the List of Proprietor and the Self-Declaration can be
 * generated straight after seeding.
 */
const SHEIKH_DATA: Prisma.InputJsonValue = {
  "business.legal_name": "Sheikh Family Kitchen",
  "business.trade_name": "Sheikh Family Kitchen",
  "business.constitution": "Proprietorship",
  "business.pan": "AVLPS6721H",
  "business.incorporation_date": "2019-11-02",
  "applicant.full_name": "Fatima Sheikh",
  "applicant.designation": "Proprietor",
  "applicant.aadhaar_no": "531284907612",
  "applicant.mobile": "9820117744",
  "applicant.email": "fatima@sheikhkitchen.in",
  "premises.address_1": "Shop 3, Noor Manzil",
  "premises.address_2": "Mohammed Ali Road",
  "premises.city": "Mumbai",
  "premises.district": "Mumbai City",
  "premises.state": "Maharashtra",
  "premises.pincode": "400003",
  "premises.ownership": "Rented",
  "premises.area_sqft": 640,
  "licence.type": "State Licence",
  "licence.kob": "Restaurant",
  "licence.food_categories": ["Prepared foods", "Ready-to-eat savouries"],
  "licence.duration_years": "5 years",
  "water.source": "Municipal supply",
  "water.test_report_date": "2026-04-18",
  "declaration.place": "Mumbai",
  "declaration.accepted": true,
  "letterhead.name": "Sheikh Family Kitchen",
  "letterhead.address": "Shop 3, Noor Manzil, Mohammed Ali Road, Mumbai 400003",
  "letterhead.contact": "9820117744 · fatima@sheikhkitchen.in",
  "letterhead.cin": "",
};

/** Arjun is a manufacturer: equipment and nominee are added to his set. */
const KONKAN_DATA: Prisma.InputJsonValue = {
  "business.legal_name": "Konkan Foods LLP",
  "business.trade_name": "Konkan Foods",
  "business.constitution": "LLP",
  "business.pan": "ABDFK9012M",
  "applicant.full_name": "Arjun Desai",
  "applicant.designation": "Partner",
  "applicant.mobile": "9822314507",
  "applicant.email": "arjun@konkanfoods.in",
  "equipment.list": [
    { name: "Retort steriliser", quantity: 2, capacity: "300 kg per batch" },
    { name: "Vacuum sealer", quantity: 4, capacity: "" },
  ],
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
    // Email is the sign-in identifier for both portals; the mobile still works.
    who: `ADMIN staff — ${admin.email ?? "no email"}`,
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

  // ── Everything above is safe for a live database: reference rows upserted
  // on their unique keys, plus exactly one admin. Everything below is demo
  // content and only runs when explicitly asked for, so production never gets
  // fake customers.
  if (process.env.SEED_DEMO !== "true") {
    console.log("\nSeeded (reference data + admin only):");
    console.log(`  ${CATEGORIES.length} business categories`);
    console.log(
      `  ${SECTIONS.length} form sections (${SECTIONS.filter((s) => s.isCore).length} core)`,
    );
    printCredentials(credentials);
    console.log(
      "  No demo customers were created. Set SEED_DEMO=true to include them.\n",
    );
    return;
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
      // Left in DRAFT so the questionnaire is walkable straight after seeding.
      status: "DRAFT",
      submittedAt: null,
      data: SPICE_ROUTE_DATA,
      completedSections: [
        "business_details",
        "applicant_details",
        "premises",
        "licence_details",
      ],
    },
    create: {
      applicationNo: "FR-2026-0248",
      customerId: meeraCustomer.id,
      categoryId: restaurant.id,
      licenceType: "STATE",
      status: "DRAFT",
      data: SPICE_ROUTE_DATA,
      completedSections: [
        "business_details",
        "applicant_details",
        "premises",
        "licence_details",
      ],
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
      submittedAt: null,
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

  // ── Demo customer 3 — proprietorship restaurant, ready for annexures
  const fatimaPassword = password("SEED_CUSTOMER_3_PASSWORD");
  const fatima = await prisma.user.upsert({
    where: { mobile: "+919820117744" },
    update: {
      name: "Fatima Sheikh",
      email: "fatima@sheikhkitchen.in",
      passwordHash: await hashPassword(fatimaPassword),
      isActive: true,
    },
    create: {
      role: "CUSTOMER",
      name: "Fatima Sheikh",
      mobile: "+919820117744",
      email: "fatima@sheikhkitchen.in",
      passwordHash: await hashPassword(fatimaPassword),
      customer: {
        create: {
          businessName: "Sheikh Family Kitchen",
          city: "Mumbai",
          state: "Maharashtra",
        },
      },
    },
    include: { customer: true },
  });
  const fatimaCustomer =
    fatima.customer ??
    (await prisma.customer.findUniqueOrThrow({ where: { userId: fatima.id } }));
  credentials.push({
    who: "CUSTOMER — Sheikh Family Kitchen (proprietorship)",
    mobile: fatima.mobile,
    password: fatimaPassword,
  });

  const sheikhSections = [
    "business_details",
    "applicant_details",
    "premises",
    "licence_details",
    "water",
    "declaration",
  ];
  await prisma.application.upsert({
    where: { applicationNo: "FR-2026-0301" },
    update: {
      status: "UNDER_REVIEW",
      data: SHEIKH_DATA,
      completedSections: sheikhSections,
      submittedAt: new Date("2026-07-09T06:20:00Z"),
    },
    create: {
      applicationNo: "FR-2026-0301",
      customerId: fatimaCustomer.id,
      categoryId: restaurant.id,
      licenceType: "STATE",
      status: "UNDER_REVIEW",
      data: SHEIKH_DATA,
      completedSections: sheikhSections,
      submittedAt: new Date("2026-07-09T06:20:00Z"),
    },
  });

  // ── Desk volume: enough customers to exercise filters, sorting and paging
  const bulk = await seedDeskFixtures();

  // ── Leads: website enquiries (some converted), plus staff/partner sources
  const leadCount = await seedLeads();

  console.log("\nSeeded (with SEED_DEMO demo content):");
  console.log(`  ${CATEGORIES.length} business categories`);
  console.log(
    `  ${SECTIONS.length} form sections (${SECTIONS.filter((s) => s.isCore).length} core)`,
  );
  console.log(`  3 demo customers with applications`);
  console.log(`  ${bulk} more customers for the staff desk`);
  console.log(`  ${leadCount} leads (website enquiries + converted)`);
  printCredentials(credentials);
}

/**
 * The one moment these passwords exist in readable form. Printed once; only
 * the Argon2id hash is stored.
 */
function printCredentials(
  credentials: { who: string; mobile: string; password: string }[],
): void {
  console.log("\nSign in with:");
  for (const entry of credentials) {
    console.log(`  ${entry.who}`);
    console.log(`    mobile:   ${entry.mobile}`);
    console.log(`    password: ${entry.password}`);
  }
  console.log(
    "\nSign in at /login — use the staff toggle for the admin account." +
      "\nPasswords are printed once and stored only as Argon2id hashes.\n",
  );
}

/* ──────────────────────────────────────────── staff desk fixtures */

const FIRST_NAMES = [
  "Rajesh",
  "Priya",
  "Mohammed",
  "Anita",
  "Vikram",
  "Lakshmi",
  "Sunil",
  "Fatima",
  "Ravi",
  "Neha",
  "Imran",
  "Kavita",
  "Suresh",
  "Divya",
  "Anil",
];
const LAST_NAMES = [
  "Kumar",
  "Sharma",
  "Ali",
  "Desai",
  "Singh",
  "Iyer",
  "Patel",
  "Sheikh",
  "Reddy",
  "Nair",
  "Khan",
  "Joshi",
  "Menon",
  "Gupta",
  "Bose",
];
const BUSINESS_WORDS = [
  "Sweets & Namkeen",
  "Spice Route Cafe",
  "Cold Storage",
  "Cloud Kitchen",
  "Transport Co.",
  "Organic Foods",
  "Dairy Farm",
  "Bakehouse",
  "Masala Works",
  "Fresh Mart",
  "Tiffin Service",
  "Beverages",
];
const CITIES: [string, string][] = [
  ["Mumbai", "Maharashtra"],
  ["Pune", "Maharashtra"],
  ["Bengaluru", "Karnataka"],
  ["Hyderabad", "Telangana"],
  ["Chennai", "Tamil Nadu"],
  ["Delhi", "Delhi"],
  ["Ahmedabad", "Gujarat"],
  ["Kolkata", "West Bengal"],
  ["Jaipur", "Rajasthan"],
];
const DESK_STATUSES: AppStatus[] = [
  "DRAFT",
  "DRAFT",
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "UNDER_REVIEW",
  "QUERY_RAISED",
  "READY_TO_FILE",
  "FILED",
  "FILED",
  "ISSUED",
  "ISSUED",
  "FSSAI_QUERY",
  "REJECTED",
  "CLOSED",
];

/**
 * Sixty-odd applications so the desk can be judged the way staff will use it:
 * two pages, every chip populated, and a realistic spread of "never logged in".
 * Deterministic — re-running the seed updates these rows rather than piling up.
 */
async function seedDeskFixtures(): Promise<number> {
  const categories = await prisma.businessCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, code: true, extraSections: true },
  });
  const sections = await prisma.formSection.findMany({
    select: { key: true, isCore: true },
  });
  const coreKeys = sections.filter((s) => s.isCore).map((s) => s.key);
  const sharedHash = await hashPassword(generatePassword());

  const COUNT = 62;
  for (let index = 0; index < COUNT; index += 1) {
    const first = FIRST_NAMES[index % FIRST_NAMES.length];
    const last = LAST_NAMES[(index * 7) % LAST_NAMES.length];
    const name = `${first} ${last}`;
    const business = `${last} ${BUSINESS_WORDS[(index * 5) % BUSINESS_WORDS.length]}`;
    const [city, state] = CITIES[(index * 3) % CITIES.length];
    const category = categories[index % categories.length];
    const status = DESK_STATUSES[index % DESK_STATUSES.length];
    // Every fourth account was created and never used — the follow-up list.
    const neverLoggedIn = index % 4 === 0;
    const mobile = `+9176${String(10000000 + index * 37).slice(0, 8)}`;

    const applicable =
      coreKeys.length +
      category.extraSections.filter((key) =>
        sections.some((s) => s.key === key && !s.isCore),
      ).length;
    const done =
      status === "DRAFT"
        ? index % (applicable + 1)
        : status === "SUBMITTED" || status === "UNDER_REVIEW"
          ? applicable
          : Math.max(1, applicable - (index % 3));

    const user = await prisma.user.upsert({
      where: { mobile },
      update: {
        name,
        lastLoginAt: neverLoggedIn
          ? null
          : new Date(Date.now() - index * 3_600_000),
      },
      create: {
        role: "CUSTOMER",
        name,
        mobile,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${index}@example.in`,
        passwordHash: sharedHash,
        lastLoginAt: neverLoggedIn
          ? null
          : new Date(Date.now() - index * 3_600_000),
        customer: { create: { businessName: business, city, state } },
      },
      select: { id: true, customer: { select: { id: true } } },
    });

    const customerId =
      user.customer?.id ??
      (await prisma.customer.findUniqueOrThrow({ where: { userId: user.id } }))
        .id;

    const applicationNo = `FR-2026-${String(1000 + index)}`;
    await prisma.application.upsert({
      where: { applicationNo },
      update: {
        status,
        categoryId: category.id,
        completedSections: coreKeys.slice(0, done),
      },
      create: {
        applicationNo,
        customerId,
        categoryId: category.id,
        licenceType: (["BASIC", "STATE", "CENTRAL"] as const)[index % 3],
        status,
        completedSections: coreKeys.slice(0, done),
      },
    });
  }

  // Spread "last updated" across the past month so the column, and sorting on
  // it, mean something. @updatedAt cannot be set through the client.
  await prisma.$executeRaw`
    UPDATE "Application"
    SET "updatedAt" = now() - (random() * interval '30 days')
    WHERE "applicationNo" LIKE 'FR-2026-1%'
  `;

  return COUNT;
}

/**
 * Leads for the Sales screens. Website enquiries not yet converted are the
 * "Website Enquiries" queue; converted ones (linked to a desk-fixture user)
 * populate the Leads list. Deterministic and idempotent — keyed on a marker in
 * the referrer field so re-running the seed updates rather than duplicates.
 */
async function seedLeads(): Promise<number> {
  const SOURCES: { source: string; count: number; convert: boolean }[] = [
    { source: "website", count: 9, convert: false },
    { source: "website", count: 6, convert: true },
    { source: "staff", count: 3, convert: false },
    { source: "partner", count: 2, convert: false },
  ];
  const UTM = [
    { s: "google", m: "cpc", c: "fssai-mumbai" },
    { s: "instagram", m: "social", c: "reels-jan" },
    { s: "referral", m: "word-of-mouth", c: null },
    { s: "google", m: "organic", c: null },
  ];

  // A pool of existing customers to attach converted leads to.
  const converts = await prisma.user.findMany({
    where: { role: "CUSTOMER", mobile: { startsWith: "+9176" } },
    select: { id: true },
    take: 6,
  });

  let index = 0;
  let total = 0;
  for (const spec of SOURCES) {
    for (let i = 0; i < spec.count; i += 1, index += 1) {
      const first = FIRST_NAMES[index % FIRST_NAMES.length];
      const last = LAST_NAMES[(index * 3) % LAST_NAMES.length];
      const [city, state] = CITIES[(index * 2) % CITIES.length];
      const utm = UTM[index % UTM.length];
      const marker = `seed-lead-${index}`;
      const converted =
        spec.convert && converts[total % Math.max(1, converts.length)];

      await prisma.lead.upsert({
        // referrer carries a stable marker so the upsert is idempotent.
        where: { id: marker },
        update: {},
        create: {
          id: marker,
          name: `${first} ${last}`,
          mobile: `+9170${String(20000000 + index * 53).slice(0, 8)}`,
          email: `${first.toLowerCase()}.${last.toLowerCase()}@example.in`,
          businessType: [
            "Restaurant",
            "Manufacturer",
            "Cloud Kitchen",
            "Trader",
            "Retailer",
          ][index % 5],
          city,
          source: spec.source,
          utmSource: spec.source === "website" ? utm.s : null,
          utmMedium: spec.source === "website" ? utm.m : null,
          utmCampaign: spec.source === "website" ? utm.c : null,
          referrer: marker,
          consentAt: spec.source === "website" ? new Date() : null,
          convertedUserId: converted ? converted.id : null,
          createdAt: new Date(Date.now() - index * 8 * 3_600_000),
          ...(state ? {} : {}),
        },
      });
      total += 1;
    }
  }

  return total;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
