/**
 * Which annexures a given application needs.
 *
 * FoodRaksha staff key the application into the FoSCoS portal themselves and
 * FoSCoS produces Form A and Form B. This system never fills a government
 * application form — it produces the supporting annexures that get attached.
 * See docs/FINDINGS.md.
 *
 * Pure and self-contained on purpose: applicability is a rule, and rules that
 * live in one tested function do not drift.
 */

export const ANNEXURE_KEYS = [
  "form_ix",
  "people_list",
  "proprietor_declaration",
  "equipment_list",
  "recall_plan",
] as const;

export type AnnexureKey = (typeof ANNEXURE_KEYS)[number];

export const ANNEXURE_TITLES: Record<AnnexureKey, string> = {
  form_ix: "Form IX — Nomination of Persons",
  people_list: "List of Directors / Partners / Proprietor",
  proprietor_declaration: "Self-Declaration for Proprietorship",
  equipment_list: "List of Equipment and Machinery",
  recall_plan: "Recall Plan",
};

/** Constitutions as offered in the questionnaire. */
export const PROPRIETORSHIP = "Proprietorship";

/** Categories that manufacture or store, and so owe the extra annexures. */
export const MANUFACTURING_CATEGORIES = ["MANUFACTURER", "STORAGE"];

export interface ApplicabilityInput {
  /** business.constitution, as answered. */
  constitution: string | null;
  /** BusinessCategory.code. */
  categoryCode: string;
  /** equipment.list and equipment.installed_capacity are both answered. */
  hasEquipmentData: boolean;
  /** Enough business, premises and product data to write a recall plan. */
  hasRecallData: boolean;
}

export function isManufacturing(categoryCode: string): boolean {
  return MANUFACTURING_CATEGORIES.includes(categoryCode);
}

export function applicableAnnexures(input: ApplicabilityInput): AnnexureKey[] {
  const keys: AnnexureKey[] = [];

  // Form IX is signed by "the proprietor or a signatory authorized by the
  // board" — its own wording covers a proprietorship, so it is produced for
  // every constitution. Note that the FoSCoS document checklist annotates it
  // "(Not applicable in case of Proprietor)"; if the client confirms that
  // reading, this becomes one condition here and nothing else changes.
  keys.push("form_ix");

  // Every constitution files a list of its people — directors, partners,
  // executive members, or the proprietor alone.
  keys.push("people_list");

  if (input.constitution === PROPRIETORSHIP) {
    keys.push("proprietor_declaration");
  }

  if (isManufacturing(input.categoryCode)) {
    // Omitted rather than half-filled when the questionnaire has not reached
    // these sections yet.
    if (input.hasEquipmentData) keys.push("equipment_list");
    if (input.hasRecallData) keys.push("recall_plan");
  }

  return keys;
}
