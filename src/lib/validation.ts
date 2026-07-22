import { z } from "zod";

/**
 * Shared Zod schemas. The same schema validates on the client and on the
 * server; the server boundary is the one that counts.
 */

/** Digits only, then reduce 12/11-digit forms to the national 10 digits. */
function normaliseMobile(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/** Accepts what a person types; always yields E.164 (+91XXXXXXXXXX). */
export const mobileSchema = z
  .string()
  .trim()
  .min(1, "Enter your mobile number")
  .transform(normaliseMobile)
  .pipe(
    z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number"),
  )
  .transform((national) => `+91${national}`);

/** Login only — never reject an existing password for failing today's rules. */
export const loginPasswordSchema = z
  .string()
  .min(1, "Enter your password")
  .max(200);

/** New passwords. */
export const newPasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(200);

export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, "Enter a 6-digit PIN code");

export const panSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}\d{4}[A-Z]$/, "Enter a valid PAN");

export const gstinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/,
    "Enter a valid 15-character GSTIN",
  );

export const loginSchema = z.object({
  mobile: mobileSchema,
  password: loginPasswordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
