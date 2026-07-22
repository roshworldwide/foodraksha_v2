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
  .string({ error: "Enter your mobile number" })
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

/** Attribution captured with a lead. Never required, never trusted. */
const attribution = z.string().trim().max(500).optional();

/**
 * The public signup contract. The marketing website (phase 2) posts exactly
 * this shape to /api/public/signup — keep it stable.
 */
export const signupSchema = z.object({
  name: z
    .string({ error: "Enter your full name" })
    .trim()
    .min(2, "Enter your full name")
    .max(120, "That name is too long"),
  mobile: mobileSchema,
  email: z
    .string({ error: "Enter a valid email address" })
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address"))
    .pipe(z.string().max(160)),
  /** BusinessCategory.code, e.g. "RESTAURANT". */
  businessType: z
    .string({ error: "Choose your business type" })
    .trim()
    .min(1, "Choose your business type")
    .max(60),
  city: z
    .string({ error: "Enter your city" })
    .trim()
    .min(2, "Enter your city")
    .max(80, "That city name is too long"),
  /** DPDP Act 2023 — an account cannot be created without it. */
  consent: z
    .boolean({
      error:
        "Please agree to the privacy terms so we can process your application",
    })
    .refine(
      (given) => given,
      "Please agree to the privacy terms so we can process your application",
    ),
  utmSource: attribution,
  utmMedium: attribution,
  utmCampaign: attribution,
  referrer: attribution,
});

export type SignupInput = z.infer<typeof signupSchema>;
