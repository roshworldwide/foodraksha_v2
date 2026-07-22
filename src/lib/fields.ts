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
] as const;

export type FieldKey = (typeof FIELD_KEYS)[number];

const FIELD_KEY_SET: ReadonlySet<string> = new Set(FIELD_KEYS);

export function isFieldKey(value: string): value is FieldKey {
  return FIELD_KEY_SET.has(value);
}

/** How a field is rendered in the questionnaire. */
export type FieldInputType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "date"
  | "number"
  | "tel"
  | "email"
  | "file"
  | "signature"
  | "checkbox";

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

/** One entry of a FormSection's `fields` JSON column. */
export interface FieldDef {
  key: FieldKey;
  label: string;
  type: FieldInputType;
  required: boolean;
  options?: string[];
  validation?: FieldValidation;
  helpText?: string;
}

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
