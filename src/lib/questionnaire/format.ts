import type { FieldDef } from "@/lib/fields";
import { hasAnswer, type AnswerValue, type GroupRow } from "./schema";

const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

function formatGroupRow(row: GroupRow, field: FieldDef): string {
  const parts = (field.itemFields ?? []).map((subField) => {
    const value = row[subField.key];
    return value === undefined || value === "" ? null : `${value}`;
  });
  const filled = parts.filter((part): part is string => part !== null);
  return filled.length > 0 ? filled.join(" · ") : "—";
}

/**
 * An answer as a person would read it back — the review page must be
 * checkable by someone who has never seen the form.
 */
export function formatAnswer(
  field: FieldDef,
  value: AnswerValue | undefined,
): string[] {
  if (!hasAnswer(value)) return [];

  switch (field.type) {
    case "checkbox":
      return [value === true ? "Yes" : "No"];

    case "date": {
      const date = new Date(String(value));
      return [
        Number.isNaN(date.getTime()) ? String(value) : DATE_FORMAT.format(date),
      ];
    }

    case "multiselect":
      return Array.isArray(value) ? (value as string[]) : [String(value)];

    case "group":
      return Array.isArray(value)
        ? (value as GroupRow[]).map((row) => formatGroupRow(row, field))
        : [];

    case "file":
    case "signature":
      return ["Uploaded"];

    default:
      return [String(value)];
  }
}

/** One-line version, for tight spaces. */
export function formatAnswerLine(
  field: FieldDef,
  value: AnswerValue | undefined,
): string {
  const parts = formatAnswer(field, value);
  return parts.length > 0 ? parts.join(", ") : "Not answered yet";
}
