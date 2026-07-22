import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToBuffer } from "@react-pdf/renderer";
import { FormIX } from "@/components/pdf/FormIX";
import { PeopleList } from "@/components/pdf/PeopleList";
import { ProprietorDeclaration } from "@/components/pdf/ProprietorDeclaration";
import { BLANK, type AnnexureContext } from "./data";
import { contentFingerprint } from "./fingerprint";
import { normaliseFontSubsetTags } from "./generate";

const complete: AnnexureContext = {
  applicationNo: "FR-2026-0301",
  constitution: "Proprietorship",
  categoryCode: "RESTAURANT",
  business: {
    legalName: "Sheikh Family Kitchen",
    tradeName: "Sheikh Family Kitchen",
    pan: "AVLPS6721H",
    gstin: BLANK,
  },
  applicant: {
    name: "Fatima Sheikh",
    designation: "Proprietor",
    mobile: "9820117744",
    email: "fatima@sheikhkitchen.in",
  },
  premisesAddress: "Shop 3, Noor Manzil, Mumbai, Maharashtra, 400003",
  letterhead: {
    name: "Sheikh Family Kitchen",
    address: "Shop 3, Noor Manzil, Mumbai 400003",
    contact: "9820117744",
    cin: BLANK,
    logo: null,
  },
  people: [
    {
      name: "Fatima Sheikh",
      designation: "Proprietor",
      address: "Shop 3, Noor Manzil, Mumbai 400003",
      contact: "9820117744",
      idDetails: "Aadhaar 531284907612",
      appointedOn: BLANK,
      fromApplicant: true,
    },
  ],
  nominees: [
    {
      name: "Fatima Sheikh",
      designation: "Proprietor",
      address: "Shop 3, Noor Manzil, Mumbai 400003",
    },
  ],
  foodCategories: ["Prepared foods"],
  equipment: [],
  installedCapacity: BLANK,
  waterSource: "Municipal supply",
  place: "Mumbai",
  date: "09/07/2026",
  documentDate: new Date("2026-07-09T06:20:00Z"),
  signature: null,
};

/** Nothing answered at all — the worst case for "never print undefined". */
const empty: AnnexureContext = {
  ...complete,
  business: {
    legalName: BLANK,
    tradeName: BLANK,
    pan: BLANK,
    gstin: BLANK,
  },
  applicant: {
    name: BLANK,
    designation: BLANK,
    mobile: BLANK,
    email: BLANK,
  },
  premisesAddress: BLANK,
  letterhead: {
    name: BLANK,
    address: BLANK,
    contact: BLANK,
    cin: BLANK,
    logo: null,
  },
  people: [],
  nominees: [],
  foodCategories: [],
  place: BLANK,
  date: BLANK,
};

async function render(
  template: (props: { data: AnnexureContext }) => ReturnType<typeof FormIX>,
  data: AnnexureContext,
) {
  return normaliseFontSubsetTags(await renderToBuffer(template({ data })));
}

describe("annexure rendering", () => {
  it("produces the same document every time from the same data", async () => {
    const first = await render(FormIX, complete);
    const second = await render(FormIX, complete);

    assert.equal(
      contentFingerprint(first),
      contentFingerprint(second),
      "same input must produce the same document",
    );
  });

  it("produces a different document when the data changes", async () => {
    const changed = await render(FormIX, {
      ...complete,
      business: { ...complete.business, legalName: "Somewhere Else Foods" },
    });

    assert.notEqual(
      contentFingerprint(await render(FormIX, complete)),
      contentFingerprint(changed),
    );
  });

  it("never prints undefined or null, however empty the answers", async () => {
    for (const template of [FormIX, PeopleList, ProprietorDeclaration]) {
      const pdf = await render(template, empty);
      const text = pdf.toString("latin1");
      assert.ok(!text.includes("undefined"), "found 'undefined' in the output");
      assert.ok(!text.includes("null"), "found 'null' in the output");
      assert.ok(pdf.length > 1000, "the document should still render");
    }
  });

  it("renders every template to a valid, non-trivial PDF", async () => {
    for (const template of [FormIX, PeopleList, ProprietorDeclaration]) {
      const pdf = await render(template, complete);
      assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
      assert.ok(pdf.includes(Buffer.from("%%EOF")));
    }
  });
});
