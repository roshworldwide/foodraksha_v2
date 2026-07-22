import { z } from "zod";
import type { FieldDef, FieldValidation, SubFieldDef } from "@/lib/fields";
import { hasAnswer, type AnswerMap, type AnswerValue } from "./schema";

/**
 * Zod rules built from the field definition, so a new question validates
 * correctly the moment staff save it — no code change.
 *
 * Note on `pattern`: it comes from the staff-edited definition and is compiled
 * here. Input length is capped upstream by answerValueSchema, which bounds the
 * damage a pathological expression can do.
 */

function requiredMessage(label: string, type: FieldDef["type"]): string {
  switch (type) {
    case "select":
    case "radio":
      return `Choose ${label.toLowerCase()}`;
    case "multiselect":
      return `Choose at least one ${label.toLowerCase()}`;
    case "checkbox":
      return `${label} is required to continue`;
    case "group":
      return `Add at least one ${label.toLowerCase()}`;
    case "date":
      return `Enter ${label.toLowerCase()}`;
    default:
      return `Enter ${label.toLowerCase()}`;
  }
}

function compilePattern(pattern: string, label: string): RegExp | null {
  try {
    return new RegExp(pattern);
  } catch {
    console.error(`[questionnaire] invalid pattern on "${label}": ${pattern}`);
    return null;
  }
}

function stringSchema(
  label: string,
  rules: FieldValidation | undefined,
): z.ZodType<unknown> {
  let schema = z.string();
  if (rules?.minLength !== undefined) {
    schema = schema.min(
      rules.minLength,
      `${label} must be at least ${rules.minLength} characters`,
    );
  }
  if (rules?.maxLength !== undefined) {
    schema = schema.max(
      rules.maxLength,
      `${label} must be ${rules.maxLength} characters or fewer`,
    );
  }
  if (rules?.pattern) {
    const expression = compilePattern(rules.pattern, label);
    if (expression) {
      schema = schema.regex(expression, `${label} is not in the right format`);
    }
  }
  return schema;
}

function numberSchema(
  label: string,
  rules: FieldValidation | undefined,
): z.ZodType<unknown> {
  let schema = z.coerce.number({ error: `${label} must be a number` });
  if (rules?.min !== undefined) {
    schema = schema.min(rules.min, `${label} must be ${rules.min} or more`);
  }
  if (rules?.max !== undefined) {
    schema = schema.max(rules.max, `${label} must be ${rules.max} or less`);
  }
  return schema;
}

function baseSchema(
  field: Pick<FieldDef, "label" | "type" | "options" | "validation">,
): z.ZodType<unknown> {
  const { label, type, options, validation } = field;

  switch (type) {
    case "number":
      return numberSchema(label, validation);

    case "date":
      return z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be a valid date`)
        .refine(
          (value) => !Number.isNaN(new Date(value).getTime()),
          `${label} must be a valid date`,
        );

    case "email":
      return z.email(`${label} must be a valid email address`);

    case "tel":
      return z
        .string()
        .regex(/^[6-9]\d{9}$/, `${label} must be a 10-digit mobile number`);

    case "checkbox":
      return z.boolean();

    case "select":
    case "radio":
      return options?.length
        ? z.enum(options as [string, ...string[]], {
            error: `Choose one of the listed options for ${label.toLowerCase()}`,
          })
        : z.string();

    case "multiselect":
      return z
        .array(
          options?.length
            ? z.enum(options as [string, ...string[]], {
                error: `${label} contains an option that is no longer offered`,
              })
            : z.string(),
        )
        .min(1, `Choose at least one ${label.toLowerCase()}`);

    default:
      return stringSchema(label, validation);
  }
}

function validateSubField(
  subField: SubFieldDef,
  value: unknown,
): string | null {
  const answered =
    value !== undefined &&
    value !== null &&
    !(typeof value === "string" && value.trim() === "");

  if (!answered) {
    return subField.required
      ? requiredMessage(subField.label, subField.type)
      : null;
  }

  const result = baseSchema(subField).safeParse(value);
  return result.success
    ? null
    : (result.error.issues[0]?.message ?? `${subField.label} is not valid`);
}

/** The first problem with this answer, or null when it is fine. */
export function validateField(
  field: FieldDef,
  value: AnswerValue | undefined,
): string | null {
  if (!hasAnswer(value)) {
    return field.required ? requiredMessage(field.label, field.type) : null;
  }

  if (field.type === "group") {
    if (!Array.isArray(value)) return `${field.label} is not valid`;
    const rows = value as Record<string, unknown>[];
    for (const [index, row] of rows.entries()) {
      if (typeof row !== "object" || row === null) {
        return `${field.label}: row ${index + 1} is not valid`;
      }
      for (const subField of field.itemFields ?? []) {
        const issue = validateSubField(subField, row[subField.key]);
        if (issue) return `Row ${index + 1}: ${issue}`;
      }
    }
    return null;
  }

  const result = baseSchema(field).safeParse(value);
  return result.success
    ? null
    : (result.error.issues[0]?.message ?? `${field.label} is not valid`);
}

/** Every problem in the section, keyed by field key. */
export function validateSection(
  fields: FieldDef[],
  answers: AnswerMap,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const issue = validateField(field, answers[field.key]);
    if (issue) errors[field.key] = issue;
  }
  return errors;
}

export function isSectionComplete(
  fields: FieldDef[],
  answers: AnswerMap,
): boolean {
  return Object.keys(validateSection(fields, answers)).length === 0;
}
