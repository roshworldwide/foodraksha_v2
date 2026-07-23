import type {
  AnswerMap,
  AnswerValue,
  GroupRow,
} from "@/lib/questionnaire/schema";

/**
 * The FoSCoS filing layout.
 *
 * Fields are arranged in the order the FoSCoS portal's own screens present
 * them — NOT in our questionnaire order — so a staff member can tab down this
 * page in lockstep with the portal on the other half of the screen and never
 * hunt for the next value. Groups use the portal's own section headings.
 *
 * This is a mapping, kept as data in one place. When FoSCoS reorders a screen,
 * this file changes and nothing else does.
 */

export interface FilingField {
  /** Stable id for copy-tracking. Derived from the answer key. */
  id: string;
  /** The label the portal uses. */
  label: string;
  /** The answer key(s) this value is built from. */
  answerKey: string;
  /** Formatted value ready to paste, or null when unanswered. */
  value: string | null;
  /** Guidance shown under the field, e.g. the portal's dropdown wording. */
  hint?: string;
}

export interface FilingSection {
  /** The FoSCoS screen / heading. */
  title: string;
  /** Portal step number, for orientation. */
  step: number;
  fields: FilingField[];
  /**
   * Multi-line block for the portal's free-text areas (e.g. an address box),
   * copyable in one click. Null when the section has nothing pasteable as one.
   */
  block: string | null;
}

/* ─────────────────────────────────────────────────── value formatting */

function str(answers: AnswerMap, key: string): string | null {
  const value = answers[key];
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

function list(answers: AnswerMap, key: string): string[] {
  const value = answers[key];
  return Array.isArray(value)
    ? (value as AnswerValue[]).filter((v): v is string => typeof v === "string")
    : [];
}

function rows(answers: AnswerMap, key: string): GroupRow[] {
  const value = answers[key];
  return Array.isArray(value) && value.every((r) => typeof r === "object")
    ? (value as GroupRow[])
    : [];
}

/** "1 year" → "1"; the portal's duration dropdown is a bare number. */
function durationYears(answers: AnswerMap): string | null {
  const raw = str(answers, "licence.duration_years");
  if (!raw) return null;
  const match = raw.match(/\d+/);
  return match ? match[0] : raw;
}

function fullAddress(answers: AnswerMap): string | null {
  const parts = [
    str(answers, "premises.address_1"),
    str(answers, "premises.address_2"),
    str(answers, "premises.city"),
    str(answers, "premises.district"),
    str(answers, "premises.state"),
    str(answers, "premises.pincode"),
  ].filter((p): p is string => Boolean(p));
  return parts.length > 0 ? parts.join(", ") : null;
}

/* ─────────────────────────────────────────────────────── the layout */

/**
 * Built in FoSCoS screen order:
 *  1. Licence type & business details
 *  2. Company / applicant details
 *  3. Premises
 *  4. Products / food categories
 *  5. Directors / partners (KYC of persons)
 *  6. Nominee (person in charge, Form IX)
 *  7. Equipment & water (manufacturers)
 */
export function buildFilingLayout(answers: AnswerMap): FilingSection[] {
  const sections: FilingSection[] = [];

  const foodCategories = list(answers, "licence.food_categories");
  const address = fullAddress(answers);

  // ── 1. Licence & business
  sections.push({
    title: "Licence & Business Details",
    step: 1,
    fields: [
      field("licence.type", "Licence category", str(answers, "licence.type")),
      field(
        "licence.kob",
        "Kind of business",
        str(answers, "licence.kob"),
        "Select the matching Kind of Business in the portal.",
      ),
      field("licence.duration_years", "Tenure (years)", durationYears(answers)),
      field(
        "business.legal_name",
        "Name of Company / Owner",
        str(answers, "business.legal_name"),
      ),
      field(
        "business.trade_name",
        "Name of the premises / brand",
        str(answers, "business.trade_name"),
      ),
      field(
        "business.constitution",
        "Constitution of business",
        str(answers, "business.constitution"),
      ),
    ],
    block: null,
  });

  // ── 2. Applicant / company identity (KYC)
  sections.push({
    title: "Applicant Details",
    step: 2,
    fields: [
      field(
        "applicant.full_name",
        "Name of applicant",
        str(answers, "applicant.full_name"),
      ),
      field(
        "applicant.designation",
        "Designation",
        str(answers, "applicant.designation"),
      ),
      field(
        "applicant.mobile",
        "Contact number",
        str(answers, "applicant.mobile"),
      ),
      field(
        "applicant.email",
        "Email address",
        str(answers, "applicant.email"),
      ),
      field(
        "applicant.aadhaar_no",
        "Aadhaar / ID number",
        str(answers, "applicant.aadhaar_no"),
      ),
      field("business.pan", "PAN", str(answers, "business.pan")),
      field("business.gstin", "GSTIN", str(answers, "business.gstin")),
      field(
        "business.incorporation_date",
        "Date of incorporation",
        str(answers, "business.incorporation_date"),
      ),
    ],
    block: null,
  });

  // ── 3. Premises. The portal has one address box — offer the whole thing.
  sections.push({
    title: "Premises Address",
    step: 3,
    fields: [
      field(
        "premises.address_1",
        "Address line 1",
        str(answers, "premises.address_1"),
      ),
      field(
        "premises.address_2",
        "Address line 2",
        str(answers, "premises.address_2"),
      ),
      field("premises.city", "City / town", str(answers, "premises.city")),
      field("premises.district", "District", str(answers, "premises.district")),
      field("premises.state", "State", str(answers, "premises.state")),
      field("premises.pincode", "PIN code", str(answers, "premises.pincode")),
      field(
        "premises.ownership",
        "Occupancy status",
        str(answers, "premises.ownership"),
      ),
      field(
        "premises.area_sqft",
        "Area (sq ft)",
        str(answers, "premises.area_sqft"),
      ),
    ],
    block: address,
  });

  // ── 4. Products. The portal takes food categories as ticks; a pasted list
  //       is the fastest way to work down them.
  sections.push({
    title: "Food Categories & Products",
    step: 4,
    fields: foodCategories.map((category, index) =>
      field(
        `licence.food_categories.${index}`,
        `Food category ${index + 1}`,
        category,
      ),
    ),
    block: foodCategories.length > 0 ? foodCategories.join("\n") : null,
  });

  // ── 5. Directors / partners KYC. A proprietorship has none.
  const people = rows(answers, "business.directors");
  if (people.length > 0) {
    sections.push({
      title: "Directors / Partners (KYC)",
      step: 5,
      fields: people.flatMap((person, index) => [
        field(
          `business.directors.${index}.name`,
          `Person ${index + 1} — name`,
          cell(person.name),
        ),
        field(
          `business.directors.${index}.designation`,
          `Person ${index + 1} — designation`,
          cell(person.designation),
        ),
        field(
          `business.directors.${index}.address`,
          `Person ${index + 1} — address`,
          cell(person.address),
        ),
        field(
          `business.directors.${index}.contact`,
          `Person ${index + 1} — contact`,
          cell(person.contact),
        ),
        field(
          `business.directors.${index}.id_details`,
          `Person ${index + 1} — ID details`,
          cell(person.id_details),
        ),
      ]),
      block: people
        .map(
          (person) =>
            `${cell(person.name) ?? ""}\t${cell(person.designation) ?? ""}\t${cell(person.contact) ?? ""}`,
        )
        .join("\n"),
    });
  }

  // ── 6. Person in charge / nominee (Form IX)
  const nomineeName = str(answers, "nominee.name");
  sections.push({
    title: "Person in Charge (Form IX)",
    step: 6,
    fields: [
      field(
        "nominee.name",
        "Name of nominee",
        nomineeName ?? str(answers, "applicant.full_name"),
      ),
      field(
        "nominee.designation",
        "Designation",
        str(answers, "nominee.designation") ??
          str(answers, "applicant.designation"),
      ),
      field(
        "nominee.address",
        "Address",
        str(answers, "nominee.address") ?? address,
      ),
    ],
    block: null,
  });

  // ── 7. Equipment & water — manufacturers and storage
  const equipment = rows(answers, "equipment.list");
  const waterSource = str(answers, "water.source");
  if (equipment.length > 0 || waterSource) {
    sections.push({
      title: "Equipment & Water",
      step: 7,
      fields: [
        ...equipment.map((item, index) =>
          field(
            `equipment.list.${index}`,
            `Equipment ${index + 1}`,
            [cell(item.name), cell(item.quantity), cell(item.capacity)]
              .filter(Boolean)
              .join(" · ") || null,
          ),
        ),
        field(
          "equipment.installed_capacity",
          "Installed capacity",
          str(answers, "equipment.installed_capacity"),
        ),
        field("water.source", "Source of water", waterSource),
        field(
          "water.test_report_date",
          "Water test report date",
          str(answers, "water.test_report_date"),
        ),
      ],
      block:
        equipment.length > 0
          ? equipment
              .map(
                (item) =>
                  `${cell(item.name) ?? ""}\t${cell(item.quantity) ?? ""}\t${cell(item.capacity) ?? ""}`,
              )
              .join("\n")
          : null,
    });
  }

  // Drop sections that ended up with no fields at all.
  return sections.filter((section) => section.fields.length > 0);
}

function field(
  key: string,
  label: string,
  value: string | null,
  hint?: string,
): FilingField {
  return { id: key, label, answerKey: key, value, hint };
}

/** A group-row cell as a paste-ready string. */
function cell(value: string | number | undefined): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

/** Every field id in the layout, for copy-tracking totals. */
export function filingFieldIds(sections: FilingSection[]): string[] {
  return sections.flatMap((section) =>
    section.fields.filter((f) => f.value !== null).map((f) => f.id),
  );
}
