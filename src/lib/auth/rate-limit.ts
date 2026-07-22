/**
 * Fixed-window rate limiting, keyed by whatever the caller passes.
 *
 * In-memory: correct for a single Node process, which is what this deploys as
 * today. More than one instance means swapping this module for Redis
 * (Upstash) — the surface is deliberately three functions wide.
 */
export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export interface RateRule {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateVerdict {
  allowed: boolean;
  retryAfterSeconds: number;
}

interface Window {
  count: number;
  resetAt: number;
}

const MAX_TRACKED_KEYS = 10_000;
const windows = new Map<string, Window>();

function sweep(now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

/** Does any rule already sit at its limit? */
export function checkRateLimit(rules: RateRule[]): RateVerdict {
  const now = Date.now();
  let retryAfterMs = 0;

  for (const rule of rules) {
    const window = windows.get(rule.key);
    if (!window) continue;
    if (window.resetAt <= now) {
      windows.delete(rule.key);
      continue;
    }
    if (window.count >= rule.limit) {
      retryAfterMs = Math.max(retryAfterMs, window.resetAt - now);
    }
  }

  return {
    allowed: retryAfterMs === 0,
    retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
  };
}

/** Count one event against every rule. */
export function recordHit(rules: RateRule[]): void {
  const now = Date.now();
  if (windows.size > MAX_TRACKED_KEYS) sweep(now);

  for (const rule of rules) {
    const window = windows.get(rule.key);
    if (!window || window.resetAt <= now) {
      windows.set(rule.key, { count: 1, resetAt: now + rule.windowMs });
    } else {
      window.count += 1;
    }
  }
}

/** Forget these keys — e.g. a successful login clears its failure count. */
export function clearRateLimit(keys: string[]): void {
  for (const key of keys) windows.delete(key);
}

/** "3 minutes", "45 seconds" — for user-facing retry messages. */
export function formatRetryAfter(seconds: number): string {
  if (seconds < 90) {
    const rounded = Math.max(1, seconds);
    return `${rounded} second${rounded === 1 ? "" : "s"}`;
  }
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 90) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}
