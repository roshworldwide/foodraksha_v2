import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculatorSummary,
  computeFssai,
  CRORE,
  formatGovtFee,
  formatTurnover,
  KINDS_OF_BUSINESS,
  KOB_GROUPS,
  findKob,
  requiredInputs,
  type FssaiInput,
} from "./fssai-fees";

/** Assert a resolved licence + fee for one set of answers. */
function expectResult(
  input: FssaiInput,
  licence: string,
  govtFee: number,
): void {
  const result = computeFssai(input);
  assert.equal(
    result.resolved,
    true,
    `expected ${input.kob} to resolve, got: ${result.note}`,
  );
  assert.equal(result.licence, licence);
  assert.equal(result.govtFee, govtFee);
}

const LAKH = 100_000;

/* ───────────────────────────── the specified cases (docs/fssai-fees.md) */

test("Restaurant, ₹80L → Registration, ₹100", () => {
  expectResult({ kob: "restaurants", turnover: 80 * LAKH }, "Registration", 100);
});

test("Restaurant, ₹10cr → State, ₹5,000", () => {
  expectResult(
    { kob: "restaurants", turnover: 10 * CRORE },
    "State License",
    5000,
  );
});

test("Restaurant, ₹60cr → Central, ₹7,500", () => {
  expectResult(
    { kob: "restaurants", turnover: 60 * CRORE },
    "Central License",
    7500,
  );
});

test("Importer → Central, ₹7,500 and no turnover is asked", () => {
  expectResult({ kob: "importer" }, "Central License", 7500);
  const result = computeFssai({ kob: "importer" });
  assert.equal(result.needsTurnover, false);
  // A turnover, if one is supplied anyway, changes nothing.
  expectResult(
    { kob: "importer", turnover: 10 * LAKH },
    "Central License",
    7500,
  );
});

test("Hotel, 5★ → Central, ₹7,500", () => {
  expectResult({ kob: "hotel", stars: "5_plus" }, "Central License", 7500);
});

test("Hotel, up to 4★, ₹90L → Registration, ₹100", () => {
  expectResult(
    { kob: "hotel", stars: "up_to_4", turnover: 90 * LAKH },
    "Registration",
    100,
  );
});

test("Hawker → Registration, ₹0 (waived)", () => {
  expectResult({ kob: "hawker" }, "Registration", 0);
  assert.match(computeFssai({ kob: "hawker" }).note, /28 September 2024/);
});

test("General Manufacturing, milling, ₹2cr → State, ₹5,000", () => {
  expectResult(
    { kob: "general-manufacturing", milling: true, turnover: 2 * CRORE },
    "State License",
    5000,
  );
});

test("Caterer, ₹30cr → State, ₹5,000 (no registration tier)", () => {
  expectResult({ kob: "caterer", turnover: 30 * CRORE }, "State License", 5000);
  // The point of CENTRAL_OR_STATE: even a tiny caterer is State, never Registration.
  expectResult({ kob: "caterer", turnover: 10 * LAKH }, "State License", 5000);
  expectResult(
    { kob: "caterer", turnover: 60 * CRORE },
    "Central License",
    7500,
  );
});

/* ───────────────────────────── threshold edges */

test("thresholds are inclusive of the lower band", () => {
  // Exactly ₹1.5cr is still Registration.
  expectResult(
    { kob: "restaurants", turnover: 1.5 * CRORE },
    "Registration",
    100,
  );
  expectResult(
    { kob: "restaurants", turnover: 1.5 * CRORE + 1 },
    "State License",
    5000,
  );
  // Exactly ₹50cr is still State.
  expectResult(
    { kob: "restaurants", turnover: 50 * CRORE },
    "State License",
    5000,
  );
  expectResult(
    { kob: "restaurants", turnover: 50 * CRORE + 1 },
    "Central License",
    7500,
  );
});

test("a zero turnover is a real answer, not a missing one", () => {
  expectResult({ kob: "restaurants", turnover: 0 }, "Registration", 100);
});

/* ───────────────────────────── each rule */

test("STATE_OR_REG has no central tier at any turnover", () => {
  expectResult({ kob: "dhaba", turnover: 80 * LAKH }, "Registration", 100);
  expectResult({ kob: "dhaba", turnover: 10 * CRORE }, "State License", 5000);
  expectResult({ kob: "dhaba", turnover: 500 * CRORE }, "State License", 5000);
});

test("REG_ONLY is Registration at ₹100 with no turnover asked", () => {
  expectResult({ kob: "petty-retailer" }, "Registration", 100);
  assert.equal(computeFssai({ kob: "petty-retailer" }).needsTurnover, false);
});

test("Anganwadi centres are Registration at ₹0 (waived)", () => {
  expectResult({ kob: "anganwadi" }, "Registration", 0);
  assert.match(computeFssai({ kob: "anganwadi" }).note, /12 March 2025/);
});

test("General Manufacturing without milling follows STANDARD", () => {
  expectResult(
    { kob: "general-manufacturing", milling: false, turnover: 2 * CRORE },
    "State License",
    5000,
  );
  expectResult(
    { kob: "general-manufacturing", milling: false, turnover: 80 * LAKH },
    "Registration",
    100,
  );
  expectResult(
    { kob: "general-manufacturing", milling: false, turnover: 60 * CRORE },
    "Central License",
    7500,
  );
});

test("milling wins at any turnover, even above ₹50cr, and needs no turnover", () => {
  expectResult(
    { kob: "general-manufacturing", milling: true, turnover: 500 * CRORE },
    "State License",
    5000,
  );
  // Milling settles it on its own.
  expectResult(
    { kob: "general-manufacturing", milling: true },
    "State License",
    5000,
  );
});

test("a hotel up to 4★ above ₹1.5cr is State, and stays State above ₹50cr", () => {
  expectResult(
    { kob: "hotel", stars: "up_to_4", turnover: 10 * CRORE },
    "State License",
    5000,
  );
  expectResult(
    { kob: "hotel", stars: "up_to_4", turnover: 60 * CRORE },
    "State License",
    5000,
  );
});

test("5★ hotels need no turnover", () => {
  expectResult(
    { kob: "hotel", stars: "5_plus", turnover: 10 * LAKH },
    "Central License",
    7500,
  );
});

test("govt-agency catering uses its own ₹2000 / ₹100 fees, never STANDARD", () => {
  expectResult(
    { kob: "central-govt-catering", turnover: 80 * LAKH },
    "Central Registration",
    100,
  );
  expectResult(
    { kob: "central-govt-catering", turnover: 2 * CRORE },
    "Central License",
    2000,
  );
  // Well above ₹50cr it is still the concessional ₹2000, not ₹7500.
  expectResult(
    { kob: "central-govt-catering", turnover: 500 * CRORE },
    "Central License",
    2000,
  );
});

test("railway-station food business uses the [Railways] fees", () => {
  expectResult(
    { kob: "railway-station", turnover: 80 * LAKH },
    "Central Registration [Railways]",
    100,
  );
  expectResult(
    { kob: "railway-station", turnover: 2 * CRORE },
    "Central License [Railways]",
    2000,
  );
});

test("every CENTRAL_ALWAYS kind of business is Central at ₹7,500", () => {
  const centralAlways = KINDS_OF_BUSINESS.filter(
    (k) => k.rule === "CENTRAL_ALWAYS",
  );
  assert.ok(centralAlways.length > 0);
  for (const kob of centralAlways) {
    expectResult({ kob: kob.id }, "Central License", 7500);
  }
});

/* ───────────────────────────── unresolved states */

test("a rule that needs turnover does not resolve without one", () => {
  const result = computeFssai({ kob: "restaurants" });
  assert.equal(result.resolved, false);
  assert.equal(result.licence, null);
  assert.equal(result.govtFee, null);
  assert.equal(result.needsTurnover, true);
});

test("a hotel does not resolve until the star rating is known", () => {
  const noStars = computeFssai({ kob: "hotel", turnover: 90 * LAKH });
  assert.equal(noStars.resolved, false);
  assert.match(noStars.note, /star rating/i);
});

test("an unknown kind of business never guesses", () => {
  const result = computeFssai({ kob: "not-a-real-kob", turnover: 10 * CRORE });
  assert.equal(result.resolved, false);
  assert.equal(result.licence, null);
});

test("a non-finite turnover counts as missing, not as zero", () => {
  assert.equal(
    computeFssai({ kob: "restaurants", turnover: Number.NaN }).resolved,
    false,
  );
});

/* ───────────────────────────── the data itself */

test("the fixed-outcome rules ask for nothing", () => {
  for (const rule of [
    "CENTRAL_ALWAYS",
    "REG_ONLY",
    "HAWKER",
    "ANGANWADI",
  ] as const) {
    assert.deepEqual(requiredInputs(rule), {
      turnover: false,
      stars: false,
      milling: false,
    });
  }
});

test("only Hotel asks for stars and only General Manufacturing asks about milling", () => {
  const starKobs = KINDS_OF_BUSINESS.filter(
    (k) => requiredInputs(k.rule).stars,
  );
  assert.deepEqual(
    starKobs.map((k) => k.id),
    ["hotel"],
  );
  const millingKobs = KINDS_OF_BUSINESS.filter(
    (k) => requiredInputs(k.rule).milling,
  );
  assert.deepEqual(
    millingKobs.map((k) => k.id),
    ["general-manufacturing"],
  );
});

test("kind-of-business ids are unique and every group has entries", () => {
  const ids = KINDS_OF_BUSINESS.map((k) => k.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const group of KOB_GROUPS) {
    assert.ok(
      KINDS_OF_BUSINESS.some((k) => k.group === group),
      `group ${group} has no kinds of business`,
    );
  }
  // Every KOB belongs to a declared group.
  for (const kob of KINDS_OF_BUSINESS) {
    assert.ok(KOB_GROUPS.includes(kob.group), `${kob.id} has an unknown group`);
  }
});

test("the full official matrix is present — 48 kinds of business", () => {
  assert.equal(KINDS_OF_BUSINESS.length, 48);
});

test("every kind of business resolves once its inputs are supplied", () => {
  for (const kob of KINDS_OF_BUSINESS) {
    const needs = requiredInputs(kob.rule);
    const result = computeFssai({
      kob: kob.id,
      turnover: needs.turnover ? 2 * CRORE : undefined,
      stars: needs.stars ? "up_to_4" : undefined,
      milling: needs.milling ? false : undefined,
    });
    assert.equal(result.resolved, true, `${kob.id} did not resolve`);
    assert.ok(result.licence, `${kob.id} has no licence name`);
    assert.ok(result.note.length > 0, `${kob.id} has no note`);
  }
});

test("findKob looks up by id", () => {
  assert.equal(findKob("restaurants")?.label, "Restaurants");
  assert.equal(findKob("nope"), undefined);
});

/* ───────────────────────────── formatting + lead summary */

test("formatGovtFee renders rupees per year, and marks a waived fee", () => {
  assert.equal(formatGovtFee(7500), "₹7,500 / year");
  assert.equal(formatGovtFee(100), "₹100 / year");
  assert.equal(formatGovtFee(0), "₹0 — fee waived");
});

test("formatTurnover reads in lakh and crore", () => {
  assert.equal(formatTurnover(80 * LAKH), "₹80 lakh");
  assert.equal(formatTurnover(10 * CRORE), "₹10 crore");
  assert.equal(formatTurnover(1.5 * CRORE), "₹1.5 crore");
  assert.equal(formatTurnover(50_000), "₹50,000");
});

test("calculatorSummary captures KOB, turnover, licence and fee for the lead", () => {
  const summary = calculatorSummary({
    kob: "restaurants",
    turnover: 10 * CRORE,
  });
  assert.equal(
    summary,
    "Restaurants · ₹10 crore · State License · govt fee ₹5,000 / year",
  );
});

test("calculatorSummary records the answers that drove the result", () => {
  assert.equal(
    calculatorSummary({ kob: "hotel", stars: "5_plus" }),
    "Hotel · 5-star & above · Central License · govt fee ₹7,500 / year",
  );
  assert.equal(
    calculatorSummary({
      kob: "general-manufacturing",
      milling: true,
      turnover: 2 * CRORE,
    }),
    "General Manufacturing · mills grains/cereals/pulses · ₹2 crore · State License · govt fee ₹5,000 / year",
  );
  // No turnover is quoted for a kind of business that never needed one.
  assert.equal(
    calculatorSummary({ kob: "hawker" }),
    "Hawker (itinerant / mobile vendor) · Registration · govt fee ₹0 — fee waived",
  );
});

test("calculatorSummary stays null until the result is real", () => {
  assert.equal(calculatorSummary({ kob: "restaurants" }), null);
  assert.equal(calculatorSummary({ kob: "not-a-real-kob" }), null);
});
