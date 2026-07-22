import { z } from "zod";

/**
 * Server environment. Parsed once at import; a bad value fails fast at boot
 * rather than at the first request that needs it.
 * Never import this from a Client Component.
 */
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
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment:\n${issues}\n\nSee .env.example.`);
}

export const env = parsed.data;
