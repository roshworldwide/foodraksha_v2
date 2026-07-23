"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { mobileSchema } from "@/lib/validation";
import { CUSTOMER_ROLES, STAFF_ROLES, getSession } from "./guards";
import { fakeVerify, verifyPassword } from "./password";
import {
  MINUTE,
  checkRateLimit,
  clearRateLimit,
  formatRetryAfter,
  recordHit,
  type RateRule,
} from "./rate-limit";
import {
  clearSessionCookie,
  createSession,
  invalidateSession,
  setSessionCookie,
} from "./session";

/**
 * One message for every failure mode: unknown mobile, wrong password,
 * deactivated account, wrong portal. Nothing here tells an attacker whether
 * an account exists.
 */
const GENERIC_ERROR = "Those sign-in details are incorrect.";

export interface LoginState {
  error?: string;
}

/**
 * `ip` is null when no proxy header is present. It is deliberately not
 * defaulted to a constant: one shared "unknown" bucket would let a single
 * attacker rate-limit every other user off the login page.
 */
async function requestMeta(): Promise<{
  ip: string | null;
  userAgent: string | null;
}> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerList.get("x-real-ip") || null;
  return { ip, userAgent: headerList.get("user-agent") };
}

/**
 * Only ever redirect to a relative path inside the portal the user just
 * signed in to — an open redirect here would be a phishing gift.
 */
function safeNextPath(raw: FormDataEntryValue | null, role: Role): string {
  const home = role === "CUSTOMER" ? "/dashboard" : "/staff";
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return home;
  }

  const wantsStaff = raw === "/staff" || raw.startsWith("/staff/");
  if ((role === "CUSTOMER") === wantsStaff) return home;
  return raw;
}

/**
 * Resolve the login identifier to a single user.
 *
 * Both portals sign in with email; the same field also accepts a mobile number
 * as a fallback, so nothing breaks for someone who only knows their number.
 * Email is not unique in the schema, so an email lookup is scoped to the
 * allowed roles and fails closed unless it matches exactly one account.
 */
async function resolveLogin(
  raw: string,
  allowedRoles: Role[],
  allowEmail: boolean,
): Promise<{
  user: Awaited<ReturnType<typeof prisma.user.findUnique>>;
  key: string;
} | null> {
  const value = raw.trim();

  if (allowEmail && value.includes("@")) {
    const email = value.toLowerCase();
    const matches = await prisma.user.findMany({
      where: {
        email: { equals: email, mode: "insensitive" },
        role: { in: allowedRoles },
      },
    });
    return {
      user: matches.length === 1 ? matches[0] : null,
      key: `login:email:${email}`,
    };
  }

  const parsedMobile = mobileSchema.safeParse(value);
  if (!parsedMobile.success) return null;
  const mobile = parsedMobile.data;
  return {
    user: await prisma.user.findUnique({ where: { mobile } }),
    key: `login:mobile:${mobile}`,
  };
}

async function attemptLogin(
  formData: FormData,
  allowedRoles: Role[],
  allowEmail: boolean,
): Promise<{ state: LoginState } | { redirectTo: string }> {
  const identifier = String(
    formData.get("identifier") ?? formData.get("mobile") ?? "",
  );
  const password = String(formData.get("password") ?? "");

  const { ip, userAgent } = await requestMeta();

  const windowMs = env.LOGIN_RATE_LIMIT_WINDOW_MINUTES * MINUTE;
  const limit = env.LOGIN_RATE_LIMIT_ATTEMPTS;
  const ipRules: RateRule[] = ip
    ? [{ key: `login:ip:${ip}`, limit, windowMs }]
    : [];

  // A malformed identifier or password still costs an attempt against the IP.
  if (!identifier.trim() || !password) {
    recordHit(ipRules);
    return { state: { error: GENERIC_ERROR } };
  }

  const resolved = await resolveLogin(identifier, allowedRoles, allowEmail);
  if (!resolved) {
    recordHit(ipRules);
    return { state: { error: GENERIC_ERROR } };
  }

  const { user, key } = resolved;
  const rules: RateRule[] = [{ key, limit, windowMs }, ...ipRules];

  const verdict = checkRateLimit(rules);
  if (!verdict.allowed) {
    return {
      state: {
        error: `Too many attempts. Try again in ${formatRetryAfter(
          verdict.retryAfterSeconds,
        )}.`,
      },
    };
  }

  if (!user) {
    await fakeVerify(password); // keep unknown-account timing indistinguishable
    recordHit(rules);
    return { state: { error: GENERIC_ERROR } };
  }

  const passwordOk = await verifyPassword(user.passwordHash, password);

  if (!passwordOk || !user.isActive || !allowedRoles.includes(user.role)) {
    recordHit(rules);
    return { state: { error: GENERIC_ERROR } };
  }

  clearRateLimit([key]);

  const { token, expiresAt } = await createSession(user.id, {
    ipAddress: ip,
    userAgent,
  });
  await setSessionCookie(token, expiresAt);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { redirectTo: safeNextPath(formData.get("next"), user.role) };
}

export async function loginCustomer(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const result = await attemptLogin(formData, CUSTOMER_ROLES, true);
  if ("redirectTo" in result) redirect(result.redirectTo);
  return result.state;
}

export async function loginStaff(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const result = await attemptLogin(formData, STAFF_ROLES, true);
  if ("redirectTo" in result) redirect(result.redirectTo);
  return result.state;
}

export async function logout(): Promise<void> {
  const session = await getSession();
  const backTo =
    session && session.user.role !== "CUSTOMER" ? "/staff/login" : "/login";

  if (session) await invalidateSession(session.sessionId);
  await clearSessionCookie();
  redirect(backTo);
}
