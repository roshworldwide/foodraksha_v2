/**
 * Canonical field keys — the backbone of "ask once, print everywhere".
 *
 * A FieldMapping row referencing "business.legal_name" breaks the moment that
 * key is renamed. NEVER rename a key in use: deprecate it and add a new one.
 * Source of truth: docs/DATA-MODEL.md § Canonical field keys.
 */
export const FIELD_KEYS = [
  // Business
  "business.legal_name",
  "business.trade_name",
  "business.constitution",
  "business.pan",
  "business.gstin",
  "business.incorporation_date",

  // Applicant
  "applicant.full_name",
  "applicant.designation",
  "applicant.aadhaar_no",
  "applicant.mobile",
  "applicant.email",
  "applicant.photo",
  "applicant.signature",

  // Premises
  "premises.address_1",
  "premises.address_2",
  "premises.city",
  "premises.district",
  "premises.state",
  "premises.pincode",
  "premises.ownership",
  "premises.area_sqft",

  // Licence
  "licence.type",
  "licence.kob",
  "licence.food_categories",
  "licence.duration_years",

  // Equipment
  "equipment.list",
  "equipment.installed_capacity",

  // Water
  "water.source",
  "water.test_report_date",

  // Nominee
  "nominee.name",
  "nominee.designation",
  "nominee.address",

  // Vehicles
  "vehicle.count",
  "vehicle.registration_numbers",

  // Declaration — added for the Form B declaration block, never renamed.
  "declaration.accepted",
  "declaration.place",

  // Document slots. These identify uploads (Document.docType) rather than
  // values printed into a form, but they live in the same dictionary so a
  // slot can never be renamed by accident either.
  "doc.aadhaar",
  "doc.pan_card",
  "doc.premises_proof",
  "doc.noc_owner",
  "doc.water_test_report",
  "doc.layout_plan",
  "doc.machinery_list",
] as const;

export type FieldKey = (typeof FIELD_KEYS)[number];

const FIELD_KEY_SET: ReadonlySet<string> = new Set(FIELD_KEYS);

export function isFieldKey(value: string): value is FieldKey {
  return FIELD_KEY_SET.has(value);
}

/**
 * How a field is rendered. Staff add questions by writing these definitions
 * into FormSection.fields — no code change, no migration.
 */
export type FieldInputType =
  | "text"
  | "multiline"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "group"
  | "tel"
  | "email"
  | "file"
  | "signature";

/** Field types allowed inside a repeatable group's rows. */
export type SubFieldInputType = Extract<
  FieldInputType,
  "text" | "number" | "date" | "select" | "tel" | "email"
>;

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

/** Half-width fields pair up two per row — city/PIN, state/district. */
export type FieldWidth = "full" | "half";

export interface SubFieldDef {
  /** Row-local key, e.g. "name". Not a canonical key. */
  key: string;
  label: string;
  type: SubFieldInputType;
  required: boolean;
  options?: string[];
  validation?: FieldValidation;
  width?: FieldWidth;
}

/**
 * One entry of a FormSection's `fields` JSON column.
 *
 * `key` is a string, not FieldKey: staff must be able to add a question for a
 * new government field without waiting for a release. Use CanonicalFieldDef
 * where the keys are known at compile time (the seed) so typos are caught.
 */
export interface FieldDef {
  key: string;
  label: string;
  type: FieldInputType;
  required: boolean;
  options?: string[];
  validation?: FieldValidation;
  helpText?: string;
  width?: FieldWidth;
  /** Repeatable groups only: the shape of one row. */
  itemFields?: SubFieldDef[];
  /** Repeatable groups only: singular noun for the add/remove controls. */
  itemLabel?: string;
}

/** A field definition whose key is checked against the canonical dictionary. */
export type CanonicalFieldDef = Omit<FieldDef, "key"> & { key: FieldKey };

/** Section keys used by FormSection.key and Application.completedSections. */
export const SECTION_KEYS = [
  "business_details",
  "applicant_details",
  "premises",
  "licence_details",
  "equipment",
  "water",
  "nominee",
  "vehicles",
  "documents",
  "declaration",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

/** Uploads land in a later stage; these render as placeholders for now. */
export function isUploadField(type: FieldInputType): boolean {
  return type === "file" || type === "signature";
}
