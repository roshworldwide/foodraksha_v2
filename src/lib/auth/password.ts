import { hash, verify, type Algorithm } from "@node-rs/argon2";

/**
 * Algorithm is an ambient `const enum`, which isolatedModules forbids
 * importing as a value — hence the literal. 2 is Algorithm.Argon2id.
 */
const ARGON2ID = 2 as Algorithm;

/** OWASP-recommended Argon2id parameters (19 MiB, t=2, p=1). */
const OPTIONS = {
  algorithm: ARGON2ID,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

/**
 * Never throws on a malformed stored hash — a corrupt row must read as
 * "wrong password", not as a 500 that tells an attacker the account exists.
 */
export async function verifyPassword(
  passwordHash: string,
  password: string,
): Promise<boolean> {
  try {
    return await verify(passwordHash, password, OPTIONS);
  } catch {
    return false;
  }
}

/**
 * Burns one hash's worth of CPU when no account matched, so "unknown mobile"
 * and "wrong password" cost the same wall-clock time. The decoy hash is
 * computed once per process from a value nobody can supply.
 */
let decoy: Promise<string> | null = null;

export async function fakeVerify(password: string): Promise<void> {
  decoy ??= hashPassword(`decoy:${crypto.randomUUID()}`);
  await verifyPassword(await decoy, password);
}
