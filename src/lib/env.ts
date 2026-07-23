import { z } from "zod";

/**
 * Server environment. Parsed once at import; a bad value fails fast at boot
 * rather than at the first request that needs it.
 * Never import this from a Client Component.
 */
/** Empty strings in a .env file mean "unset", not "set to nothing". */
const optional = z
  .string()
  .optional()
  .transform((value) => (value?.trim() ? value.trim() : undefined));

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(
      32,
      "AUTH_SECRET must be at least 32 characters — openssl rand -base64 48",
    ),
  SESSION_DURATION_DAYS: z.coerce.number().int().positive().default(30),
  LOGIN_RATE_LIMIT_ATTEMPTS: z.coerce.number().int().positive().default(5),
  LOGIN_RATE_LIMIT_WINDOW_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .default(15),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Object storage. Absent means uploads are switched off with a clear
  // message rather than half-working.
  S3_ENDPOINT: optional,
  S3_REGION: optional,
  S3_ACCESS_KEY_ID: optional,
  S3_SECRET_ACCESS_KEY: optional,
  S3_BUCKET_DOCUMENTS: optional,
  // Never longer than 15 minutes, whatever the environment says.
  S3_SIGNED_URL_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .max(900)
    .default(900),

  // Delivery providers. Absent means "not configured yet" — credential
  // delivery is then reported as skipped, never as a signup failure.
  RESEND_API_KEY: optional,
  EMAIL_FROM: optional,
  EMAIL_REPLY_TO: optional,
  MSG91_AUTH_KEY: optional,
  MSG91_SENDER_ID: optional,
  MSG91_TEMPLATE_ID_CREDENTIALS: optional,
  MSG91_TEMPLATE_ID_STATUS_UPDATE: optional,
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment:\n${issues}\n\nSee .env.example.`);
}

export const env = parsed.data;
