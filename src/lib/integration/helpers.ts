import { prisma } from "@/lib/prisma";

/**
 * Integration tests run against a real Postgres (the same one migrations and
 * the seed target). They are gated on DATABASE_URL so the pure-unit test run
 * needs no services. Each test uses a unique mobile and cleans up after itself.
 */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

let counter = 0;
export function uniqueMobile(): string {
  // +9188 + 8 digits, kept clear of the seed's ranges.
  counter += 1;
  const suffix = String(10_000_000 + process.pid * 100 + counter).slice(0, 8);
  return `88${suffix}`;
}

export async function purgeByMobile(e164: string): Promise<void> {
  await prisma.lead.deleteMany({ where: { mobile: e164 } });
  await prisma.user.deleteMany({ where: { mobile: e164 } });
}
