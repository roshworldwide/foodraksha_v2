import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { generateAnnexures } from "@/lib/annexures/generate";
import { createAccount } from "@/lib/signup";
import { isStorageConfigured } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { transition } from "@/lib/status-machine";
import { signupSchema } from "@/lib/validation";
import { hasDatabase, purgeByMobile, uniqueMobile } from "./helpers";

/**
 * One end-to-end pass through the domain: a customer signs up, fills their
 * answers, submits; a staff member reviews and generates the annexures. Runs
 * the real server-side functions against the real database — the PDF step is
 * skipped only when object storage is not configured.
 */
describe("end to end (integration)", { skip: !hasDatabase }, () => {
  const mobile = uniqueMobile();
  const e164 = `+91${mobile}`;

  after(async () => {
    await purgeByMobile(e164);
    await prisma.$disconnect();
  });

  it("goes signup → fill → submit → review → generate", async () => {
    // ── 1. Signup
    const account = await createAccount(
      signupSchema.parse({
        name: "Priya Menon",
        mobile,
        email: "priya.e2e@example.in",
        businessType: "RESTAURANT",
        city: "Kochi",
        consent: true,
      }),
      { ipAddress: "10.0.0.5" },
    );
    const app = await prisma.application.findFirstOrThrow({
      where: { applicationNo: account.applicationNo },
      select: { id: true, status: true },
    });
    assert.equal(app.status, "DRAFT");

    const staff = await prisma.user.findFirstOrThrow({
      where: { role: { in: ["STAFF", "ADMIN"] } },
      select: { id: true },
    });

    // ── 2. Fill the answers a proprietorship restaurant needs
    const answers = {
      "business.legal_name": "Priya's Kitchen",
      "business.trade_name": "Priya's Kitchen",
      "business.constitution": "Proprietorship",
      "business.pan": "AXKPM1234N",
      "applicant.full_name": "Priya Menon",
      "applicant.designation": "Proprietor",
      "applicant.aadhaar_no": "421398765012",
      "applicant.mobile": mobile,
      "premises.address_1": "12 MG Road",
      "premises.city": "Kochi",
      "premises.district": "Ernakulam",
      "premises.state": "Kerala",
      "premises.pincode": "682001",
      "premises.ownership": "Rented",
      "premises.area_sqft": 500,
      "licence.type": "State Licence",
      "licence.kob": "Restaurant",
      "licence.food_categories": ["Prepared foods"],
      "licence.duration_years": "3 years",
      "water.source": "Municipal supply",
      "water.test_report_date": "2026-04-01",
      "declaration.place": "Kochi",
      "declaration.accepted": true,
    };
    await prisma.$executeRaw`
      UPDATE "Application"
      SET data = data || ${JSON.stringify(answers)}::jsonb
      WHERE id = ${app.id}
    `;

    // ── 3. Submit (customer transition DRAFT → SUBMITTED)
    await prisma.$transaction((tx) =>
      transition(tx, {
        applicationId: app.id,
        from: "DRAFT",
        to: "SUBMITTED",
        byUserId: account.userId,
        note: "Submitted in e2e test.",
        data: { submittedAt: new Date() },
      }),
    );

    // ── 4. Staff review (SUBMITTED → UNDER_REVIEW)
    await prisma.$transaction((tx) =>
      transition(tx, {
        applicationId: app.id,
        from: "SUBMITTED",
        to: "UNDER_REVIEW",
        byUserId: staff.id,
      }),
    );

    const reviewed = await prisma.application.findUniqueOrThrow({
      where: { id: app.id },
      select: {
        status: true,
        statusEvents: { select: { fromStatus: true, toStatus: true } },
      },
    });
    assert.equal(reviewed.status, "UNDER_REVIEW");
    // Every transition left an audit trail on the timeline.
    assert.ok(reviewed.statusEvents.length >= 2);

    // ── 5. Generate the annexures
    if (!isStorageConfigured()) {
      // No object storage in this environment — the flow above is still proven.
      return;
    }
    const { outcomes } = await generateAnnexures({
      applicationId: app.id,
      staffUserId: staff.id,
      ipAddress: null,
    });

    const generated = outcomes.filter((o) => o.status === "generated");
    assert.ok(
      generated.some((o) => o.key === "form_ix"),
      "Form IX should be generated",
    );
    assert.ok(
      generated.some((o) => o.key === "proprietor_declaration"),
      "a proprietorship should get the self-declaration",
    );
    // Every generated annexure has a stored, downloadable row.
    const rows = await prisma.generatedPdf.count({
      where: { applicationId: app.id },
    });
    assert.equal(rows, generated.length);
  });
});
