import { randomInt } from "node:crypto";

/**
 * Issued passwords are read off a screen, an SMS or a phone call and typed
 * back in, often by someone who is not confident with computers. Every
 * character that can be misread is removed:
 *   no O/0, no I/l/1, no S/5, no B/8, no Z/2 in the same class.
 */
const UPPER = "ACDEFGHJKLMNPQRTUVWXY"; // no B, I, O, S, Z
const LOWER = "acdefghjkmnpqrtuvwxyz"; // no b, i, l, o, s
const DIGIT = "34679"; // no 0, 1, 2, 5, 8

/** Shape of the issued password: Xx0x-X0xX */
const PATTERN = [UPPER, LOWER, DIGIT, LOWER, "-", UPPER, DIGIT, LOWER, UPPER];

/**
 * Nine characters from ~21·21·5·21·21·5·21·21 ≈ 2.2×10^10 combinations.
 * Enough for a credential that is delivered out-of-band and rate limited;
 * customers change it later from settings.
 */
export function generatePassword(): string {
  return PATTERN.map((set) =>
    set.length === 1 ? set : set[randomInt(set.length)],
  ).join("");
}
