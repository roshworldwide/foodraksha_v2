import { env } from "@/lib/env";

/**
 * Fixed-window limiter for failed logins, keyed by mobile number and by IP.
 *
 * In-memory: correct for a single Node process, which is what this deploys as
 * today. Moving to more than one instance means swapping this module for Redis
 * (Upstash) — the surface is deliberately three functions wide.
 */
interface Window {
  failures: number;
  resetAt: number;
}

const WINDOW_MS = env.LOGIN_RATE_LIMIT_WINDOW_MINUTES * 60_000;
const MAX_FAILURES = env.LOGIN_RATE_LIMIT_ATTEMPTS;
const MAX_TRACKED_KEYS = 10_000;

const windows = new Map<string, Window>();

function sweep(now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export interface RateLimitVerdict {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(keys: string[]): RateLimitVerdict {
  const now = Date.now();
  let retryAfterMs = 0;

  for (const key of keys) {
    const window = windows.get(key);
    if (!window) continue;
    if (window.resetAt <= now) {
      windows.delete(key);
      continue;
    }
    if (window.failures >= MAX_FAILURES) {
      retryAfterMs = Math.max(retryAfterMs, window.resetAt - now);
    }
  }

  return {
    allowed: retryAfterMs === 0,
    retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
  };
}

export function recordFailure(keys: string[]): void {
  const now = Date.now();
  if (windows.size > MAX_TRACKED_KEYS) sweep(now);

  for (const key of keys) {
    const window = windows.get(key);
    if (!window || window.resetAt <= now) {
      windows.set(key, { failures: 1, resetAt: now + WINDOW_MS });
    } else {
      window.failures += 1;
    }
  }
}

export function clearRateLimit(keys: string[]): void {
  for (const key of keys) windows.delete(key);
}
