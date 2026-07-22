import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runIsolated } from "./generate";

describe("batch isolation", () => {
  it("keeps one failing template from costing the others", async () => {
    const attempted: string[] = [];

    const outcomes = await runIsolated(
      ["form_ix", "people_list", "proprietor_declaration"],
      (key) => `Title of ${key}`,
      async (key) => {
        attempted.push(key);
        if (key === "people_list") throw new Error("template blew up");
        return { generatedPdfId: `pdf-${key}` };
      },
    );

    assert.deepEqual(attempted, [
      "form_ix",
      "people_list",
      "proprietor_declaration",
    ]);
    assert.deepEqual(
      outcomes.map((outcome) => outcome.status),
      ["generated", "failed", "generated"],
    );
    assert.equal(outcomes[1].error, "template blew up");
    assert.equal(outcomes[2].generatedPdfId, "pdf-proprietor_declaration");
  });

  it("reports something useful when a template throws a non-Error", async () => {
    const outcomes = await runIsolated(
      ["form_ix"],
      () => "Form IX",
      async () => {
        throw "not an error object";
      },
    );

    assert.equal(outcomes[0].status, "failed");
    assert.equal(outcomes[0].error, "That document could not be produced.");
  });
});
