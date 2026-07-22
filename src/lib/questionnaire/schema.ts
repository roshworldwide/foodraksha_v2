import { z } from "zod";
import type { FieldDef } from "@/lib/fields";

/**
 * FormSection.fields is staff-editable JSON. Parse it before rendering — a
 * typo in the mapper must never take the questionnaire down for a customer.
 */

const validationSchema = z
  .object({
    pattern: z.string().optional(),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().positive().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  })
  .optional();

const widthSchema = z.enum(["full", "half"]).optional();

const subFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "number", "date", "select", "tel", "email"]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: validationSchema,
  width: widthSchema,
});

const fieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum([
    "text",
    "multiline",
    "number",
    "date",
    "select",
    "multiselect",
    "radio",
    "checkbox",
    "group",
    "tel",
    "email",
    "file",
    "signature",
  ]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: validationSchema,
  helpText: z.string().optional(),
  width: widthSchema,
  itemFields: z.array(subFieldSchema).optional(),
  itemLabel: z.string().optional(),
});

/**
 * Invalid definitions are dropped, not thrown — one bad field should cost the
 * customer that question, not the whole application.
 */
export function parseFields(raw: unknown, sectionKey: string): FieldDef[] {
  if (!Array.isArray(raw)) {
    console.error(`[questionnaire] ${sectionKey}: fields is not an array`);
    return [];
  }

  const fields: FieldDef[] = [];
  raw.forEach((entry, index) => {
    const parsed = fieldSchema.safeParse(entry);
    if (!parsed.success) {
      console.error(
        `[questionnaire] ${sectionKey}: field ${index} is invalid —`,
        parsed.error.issues.map((issue) => issue.message).join("; "),
      );
      return;
    }
    if (parsed.data.type === "group" && !parsed.data.itemFields?.length) {
      console.error(
        `[questionnaire] ${sectionKey}: group field "${parsed.data.key}" has no itemFields`,
      );
      return;
    }
    fields.push(parsed.data);
  });

  return fields;
}

/* ─────────────────────────────────────────────────── answer values */

export type GroupRow = Record<string, string | number>;

export type AnswerValue =
  string | number | boolean | string[] | GroupRow[] | null;

export type AnswerMap = Record<string, AnswerValue>;

const groupRowSchema = z.record(
  z.string(),
  z.union([z.string().max(500), z.number()]),
);

/** What a client is allowed to put in Application.data. */
export const answerValueSchema: z.ZodType<AnswerValue> = z.union([
  z.string().max(5000),
  z.number(),
  z.boolean(),
  z.array(z.string().max(500)).max(100),
  z.array(groupRowSchema).max(200),
  z.null(),
]);

/** Application.data as it comes back from Prisma. */
export function parseAnswers(raw: unknown): AnswerMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const answers: AnswerMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const parsed = answerValueSchema.safeParse(value);
    if (parsed.success) answers[key] = parsed.data;
  }
  return answers;
}

/** True when the customer has actually answered — "" and [] have not. */
export function hasAnswer(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
