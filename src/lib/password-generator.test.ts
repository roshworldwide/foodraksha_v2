import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generatePassword } from "./password-generator";

describe("generatePassword", () => {
  const samples = Array.from({ length: 500 }, () => generatePassword());

  it("follows the Xx0x-X0xX shape", () => {
    const shape = /^[A-Z][a-z][0-9][a-z]-[A-Z][0-9][a-z][A-Z]$/;
    for (const password of samples) {
      assert.match(password, shape, `"${password}" is the wrong shape`);
    }
  });

  it("never uses an ambiguous character", () => {
    // 0/O, 1/l/I, 5/S, 8/B, 2/Z — the ones misread off a screen or SMS.
    const ambiguous = /[0O1lI5S8B2Zbo]/;
    for (const password of samples) {
      assert.ok(
        !ambiguous.test(password),
        `"${password}" contains an ambiguous character`,
      );
    }
  });

  it("does not repeat over 500 draws", () => {
    // Not a strength proof, just a smoke test that it is actually random.
    assert.ok(new Set(samples).size > 490, "too many collisions");
  });
});
