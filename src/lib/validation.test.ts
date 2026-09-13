import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { FieldDef } from "./fields";
import { validateField } from "./questionnaire/validation";
import {
  gstinSchema,
  mobileSchema,
  panSchema,
  pincodeSchema,
  staffSchema,
} from "./validation";

describe("shared field validation", () => {
  it("normalises accepted mobile forms to E.164", () => {
    for (const input of [
      "9845021764",
      "+919845021764",
      "09845021764",
      "91 98450 21764",
    ]) {
      assert.equal(
        mobileSchema.parse(input),
        "+919845021764",
        `failed for ${input}`,
      );
    }
  });

  it("rejects a mobile that is not ten digits or starts wrong", () => {
    for (const bad of ["12345", "5845021764", "98450217640000", "abcdefghij"]) {
      assert.equal(
        mobileSchema.safeParse(bad).success,
        false,
        `accepted ${bad}`,
      );
    }
  });

  it("validates PIN, PAN and GSTIN", () => {
    assert.equal(pincodeSchema.parse("560011"), "560011");
    assert.equal(pincodeSchema.safeParse("012345").success, false);
    assert.equal(panSchema.parse("aagcs4821k"), "AAGCS4821K");
    assert.equal(panSchema.safeParse("AAGCS4821").success, false);
    assert.equal(gstinSchema.parse("29aagcs4821k1zp"), "29AAGCS4821K1ZP");
    assert.equal(gstinSchema.safeParse("29AAGCS4821K").success, false);
  });
});

describe("questionnaire validateField", () => {
  const required = (
    type: FieldDef["type"],
    extra: Partial<FieldDef> = {},
  ): FieldDef => ({
    key: "x.y",
    label: "Test field",
    type,
    required: true,
    ...extra,
  });

  it("flags a missing required field, passes an optional one", () => {
    assert.ok(validateField(required("text"), undefined));
    assert.equal(
      validateField({ ...required("text"), required: false }, undefined),
      null,
    );
  });

  it("enforces a pattern from the field definition", () => {
    const field = required("text", {
      validation: { pattern: "^[A-Z]{5}[0-9]{4}[A-Z]$" },
    });
    assert.equal(validateField(field, "AAGCS4821K"), null);
    assert.ok(validateField(field, "not-a-pan"));
  });

  it("enforces number bounds", () => {
    const field = required("number", { validation: { min: 1, max: 100 } });
    assert.equal(validateField(field, 50), null);
    assert.ok(validateField(field, 0));
    assert.ok(validateField(field, 500));
  });

  it("requires at least one choice for a required multiselect", () => {
    const field = required("multiselect", { options: ["A", "B"] });
    assert.ok(validateField(field, []));
    assert.equal(validateField(field, ["A"]), null);
  });

  it("treats a file field as answered only when uploaded", () => {
    const field = required("file");
    assert.ok(validateField(field, undefined, new Set()));
    assert.equal(validateField(field, undefined, new Set(["x.y"])), null);
  });

  it("validates every row of a repeatable group", () => {
    const field = required("group", {
      itemLabel: "person",
      itemFields: [
        { key: "name", label: "Name", type: "text", required: true },
        {
          key: "phone",
          label: "Phone",
          type: "tel",
          required: true,
        },
      ],
    });
    assert.equal(
      validateField(field, [{ name: "A", phone: "9845021764" }]),
      null,
    );
    // Second row missing the phone.
    assert.ok(
      validateField(field, [
        { name: "A", phone: "9845021764" },
        { name: "B", phone: "" },
      ]),
    );
  });

  it("never treats an invalid pattern as a crash", () => {
    const field = required("text", { validation: { pattern: "[" } });
    // A broken regex is ignored, so the value passes rather than throwing.
    assert.equal(validateField(field, "anything"), null);
  });
});

describe("staffSchema (Team page)", () => {
  const valid = {
    name: "Asha Verma",
    email: "Asha@FoodRaksha.in",
    mobile: "98450 21764",
    role: "STAFF",
  };

  it("normalises email to lower case and mobile to E.164", () => {
    const parsed = staffSchema.parse(valid);
    assert.equal(parsed.email, "asha@foodraksha.in");
    assert.equal(parsed.mobile, "+919845021764");
    assert.equal(parsed.role, "STAFF");
  });

  it("requires a work email — staff sign in with it", () => {
    const result = staffSchema.safeParse({ ...valid, email: "" });
    assert.equal(result.success, false);
    assert.ok(
      result.error?.issues.some((issue) => issue.path[0] === "email"),
    );
  });

  it("only allows the two staff roles", () => {
    assert.equal(staffSchema.safeParse({ ...valid, role: "ADMIN" }).success, true);
    // A customer can never be created from the Team page.
    assert.equal(
      staffSchema.safeParse({ ...valid, role: "CUSTOMER" }).success,
      false,
    );
  });
});
