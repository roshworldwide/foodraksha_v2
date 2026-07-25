import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LICENCE_INFO,
  formatPriceFrom,
  licenceForBand,
  licenceForTurnoverCrore,
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
    assert.equal(
      licenceForTurnoverCrore(band.crore),
      expected[band.value],
      `band ${band.value} (₹${band.crore}cr)`,
    );
  }
});

test("licence info exists for every kind and formats a price", () => {
  for (const kind of ["BASIC", "STATE", "CENTRAL"] as const) {
    assert.ok(LICENCE_INFO[kind].name.length > 0);
    assert.ok(LICENCE_INFO[kind].timeline.length > 0);
    assert.match(formatPriceFrom(kind), /^from ₹[\d,]+$/);
  }
});
