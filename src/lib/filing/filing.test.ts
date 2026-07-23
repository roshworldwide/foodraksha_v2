import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AnswerMap } from "@/lib/questionnaire/schema";
import { checkCompleteness } from "./completeness";
import { buildFilingLayout, filingFieldIds } from "./foscos-layout";

const complete: AnswerMap = {
  "business.legal_name": "Sheikh Family Kitchen",
  "business.trade_name": "Sheikh Family Kitchen",
  "business.constitution": "Proprietorship",
  "business.pan": "AVLPS6721H",
  "applicant.full_name": "Fatima Sheikh",
  "applicant.designation": "Proprietor",
  "applicant.mobile": "9820117744",
  "applicant.email": "fatima@sheikhkitchen.in",
  "applicant.aadhaar_no": "531284907612",
  "premises.address_1": "Shop 3, Noor Manzil",
  "premises.city": "Mumbai",
  "premises.district": "Mumbai City",
  "premises.state": "Maharashtra",
  "premises.pincode": "400003",
  "licence.type": "State Licence",
  "licence.kob": "Restaurant",
  "licence.duration_years": "5 years",
  "licence.food_categories": ["Prepared foods", "Ready-to-eat savouries"],
};

describe("buildFilingLayout", () => {
  it("orders sections in FoSCoS screen order, licence first", () => {
    const layout = buildFilingLayout(complete);
    assert.equal(layout[0].title, "Licence & Business Details");
    assert.deepEqual(
      layout.map((s) => s.step),
      [...layout.map((s) => s.step)].sort((a, b) => a - b),
      "steps must be non-decreasing",
    );
  });

  it("strips the unit off the tenure so it matches the portal dropdown", () => {
    const layout = buildFilingLayout(complete);
    const tenure = layout[0].fields.find(
      (f) => f.answerKey === "licence.duration_years",
    );
    assert.equal(tenure?.value, "5");
  });

  it("offers the premises address as one pasteable block", () => {
    const premises = buildFilingLayout(complete).find(
      (s) => s.title === "Premises Address",
    );
    assert.ok(premises?.block?.includes("Shop 3, Noor Manzil"));
    assert.ok(premises?.block?.includes("400003"));
  });

  it("expands food categories to one field each and a joined block", () => {
    const products = buildFilingLayout(complete).find(
      (s) => s.title === "Food Categories & Products",
    );
    assert.equal(products?.fields.length, 2);
    assert.equal(products?.block, "Prepared foods\nReady-to-eat savouries");
  });

  it("omits the directors section for a proprietorship", () => {
    const layout = buildFilingLayout(complete);
    assert.ok(!layout.some((s) => s.title.startsWith("Directors")));
  });

  it("includes directors when the group is filled", () => {
    const layout = buildFilingLayout({
      ...complete,
      "business.directors": [
        { name: "A Rao", designation: "Director", contact: "9820000000" },
      ],
    });
    const directors = layout.find((s) => s.title.startsWith("Directors"));
    assert.ok(directors);
    assert.ok(directors.fields.some((f) => f.value === "A Rao"));
  });

  it("counts only answered fields for copy-tracking", () => {
    const ids = filingFieldIds(buildFilingLayout(complete));
    // GSTIN and incorporation date are unanswered here.
    assert.ok(!ids.includes("business.gstin"));
    assert.ok(ids.includes("business.pan"));
  });
});

describe("checkCompleteness", () => {
  it("passes a complete, valid application", () => {
    const result = checkCompleteness(complete, [
      { label: "Aadhaar", status: "APPROVED", required: true },
    ]);
    assert.equal(result.ready, true);
    assert.equal(result.errorCount, 0);
  });

  it("flags a malformed PIN, GSTIN and mobile", () => {
    const result = checkCompleteness(
      {
        ...complete,
        "premises.pincode": "40003",
        "business.gstin": "TOOSHORT",
        "applicant.mobile": "12345",
      },
      [],
    );
    assert.equal(result.ready, false);
    const labels = result.issues.map((i) => i.label);
    assert.ok(labels.includes("PIN code"));
    assert.ok(labels.includes("GSTIN"));
    assert.ok(labels.includes("Contact number"));
  });

  it("blocks filing when a required document is rejected", () => {
    const result = checkCompleteness(complete, [
      { label: "Water test report", status: "REJECTED", required: true },
    ]);
    assert.equal(result.ready, false);
    assert.ok(
      result.issues.some(
        (i) => i.label === "Water test report" && i.severity === "error",
      ),
    );
  });

  it("warns, but does not block, on a document awaiting review", () => {
    const result = checkCompleteness(complete, [
      { label: "PAN card", status: "PENDING", required: true },
    ]);
    assert.equal(result.ready, true);
    assert.equal(result.warningCount, 1);
  });

  it("accepts a +91-prefixed mobile", () => {
    const result = checkCompleteness(
      { ...complete, "applicant.mobile": "+919820117744" },
      [],
    );
    assert.equal(result.ready, true);
  });
});
