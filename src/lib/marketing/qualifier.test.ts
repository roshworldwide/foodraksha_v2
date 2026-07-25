import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatInr,
  licenceForBand,
  licenceForTurnoverCrore,
  PLANS,
  recommend,
  TURNOVER_BANDS,
} from "./qualifier";

test("turnover thresholds map to the right licence", () => {
  assert.equal(licenceForTurnoverCrore(0), "BASIC");
  assert.equal(licenceForTurnoverCrore(1), "BASIC");
  // Exactly ₹1.5cr is still Basic (inclusive upper bound).
  assert.equal(licenceForTurnoverCrore(1.5), "BASIC");
  assert.equal(licenceForTurnoverCrore(1.51), "STATE");
  assert.equal(licenceForTurnoverCrore(25), "STATE");
  // Exactly ₹50cr is still State.
  assert.equal(licenceForTurnoverCrore(50), "STATE");
  assert.equal(licenceForTurnoverCrore(50.01), "CENTRAL");
  assert.equal(licenceForTurnoverCrore(1000), "CENTRAL");
});

test("every turnover band resolves to a licence", () => {
  assert.equal(licenceForBand("up_to_1_5cr"), "BASIC");
  assert.equal(licenceForBand("1_5cr_to_50cr"), "STATE");
  assert.equal(licenceForBand("over_50cr"), "CENTRAL");
});

test("each band's representative value agrees with its declared licence", () => {
  const expected: Record<string, string> = {
    up_to_1_5cr: "BASIC",
    "1_5cr_to_50cr": "STATE",
    over_50cr: "CENTRAL",
  };
  for (const band of TURNOVER_BANDS) {
    assert.equal(licenceForTurnoverCrore(band.crore), expected[band.value]);
  }
});

test("recommend() maps each licence to its entry plan, price and timeline", () => {
  const basic = recommend("BASIC");
  assert.equal(basic.licence.name, "Basic Registration");
  assert.equal(basic.plan.id, "starter");
  assert.equal(basic.plan.price, 699);

  const state = recommend("STATE");
  assert.equal(state.plan.id, "standard");
  assert.equal(state.plan.price, 2999);
  assert.match(state.timeline, /days/);

  const central = recommend("CENTRAL");
  assert.equal(central.plan.id, "elite");
  assert.equal(central.plan.price, 3999);
});

test("service plans carry the real, confirmed prices", () => {
  const byId = Object.fromEntries(PLANS.map((p) => [p.id, p]));
  assert.equal(byId.starter.price, 699);
  assert.equal(byId.standard.price, 2999);
  assert.equal(byId.standard.wasPrice, 4999);
  assert.equal(byId.elite.price, 3999);
  assert.equal(byId.elite.wasPrice, 6999);
  assert.equal(byId.elite.featured, true);
});

test("formatInr renders Indian rupees without decimals", () => {
  assert.equal(formatInr(2999), "₹2,999");
  assert.equal(formatInr(699), "₹699");
});
