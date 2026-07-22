/**
 * Seed — every stage must be testable straight after `npm run db:seed`.
 * Idempotent: safe to re-run. Passwords are regenerated and printed each time.
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

  // ── Desk volume: enough customers to exercise filters, sorting and paging
  const bulk = await seedDeskFixtures();

  console.log("\nSeeded:");
  console.log(`  ${CATEGORIES.length} business categories`);
  console.log(
    `  ${SECTIONS.length} form sections (${SECTIONS.filter((s) => s.isCore).length} core)`,
  );
  console.log(`  2 demo customers with applications`);
  console.log(`  ${bulk} more customers for the staff desk\n`);
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

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
