import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applicableAnnexures,
  isManufacturing,
  type ApplicabilityInput,
} from "./applicability";

const base: ApplicabilityInput = {
  constitution: "Private Limited Company",
  categoryCode: "RESTAURANT",
  hasEquipmentData: false,
  hasRecallData: false,
};

describe("applicableAnnexures", () => {
  it("gives every application Form IX and a list of its people", () => {
    assert.deepEqual(applicableAnnexures(base), ["form_ix", "people_list"]);
  });

  it("adds the self-declaration only for a proprietorship", () => {
    const proprietor = applicableAnnexures({
      ...base,
      constitution: "Proprietorship",
    });
    assert.ok(proprietor.includes("proprietor_declaration"));

    for (const constitution of [
      "Partnership",
      "LLP",
      "Private Limited Company",
      "Society",
      "Trust",
      null,
    ]) {
      assert.ok(
        !applicableAnnexures({ ...base, constitution }).includes(
          "proprietor_declaration",
        ),
        `${constitution ?? "unanswered"} must not get the proprietorship declaration`,
      );
    }
  });

  it("keeps the manufacturing annexures away from a restaurant", () => {
    const restaurant = applicableAnnexures({
      ...base,
      hasEquipmentData: true,
      hasRecallData: true,
    });
    assert.ok(!restaurant.includes("equipment_list"));
    assert.ok(!restaurant.includes("recall_plan"));
  });

  it("gives a manufacturer both, once the data is there", () => {
    const manufacturer = applicableAnnexures({
      ...base,
      categoryCode: "MANUFACTURER",
      hasEquipmentData: true,
      hasRecallData: true,
    });
    assert.deepEqual(manufacturer, [
      "form_ix",
      "people_list",
      "equipment_list",
      "recall_plan",
    ]);
  });

  it("omits a manufacturing annexure rather than half-filling it", () => {
    const incomplete = applicableAnnexures({
      ...base,
      categoryCode: "MANUFACTURER",
      hasEquipmentData: false,
      hasRecallData: true,
    });
    assert.ok(!incomplete.includes("equipment_list"));
    assert.ok(incomplete.includes("recall_plan"));
  });

  it("treats storage as manufacturing, and a trader as not", () => {
    assert.equal(isManufacturing("MANUFACTURER"), true);
    assert.equal(isManufacturing("STORAGE"), true);
    assert.equal(isManufacturing("TRADER"), false);
    assert.equal(isManufacturing("RESTAURANT"), false);
  });

  it("is a pure function of its input", () => {
    const input: ApplicabilityInput = {
      ...base,
      constitution: "Proprietorship",
      categoryCode: "MANUFACTURER",
      hasEquipmentData: true,
      hasRecallData: true,
    };
    assert.deepEqual(applicableAnnexures(input), applicableAnnexures(input));
  });
});
