"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { CUSTOMER_ROLES, STAFF_ROLES, getSession } from "./guards";
import { fakeVerify, verifyPassword } from "./password";
import { checkRateLimit, clearRateLimit, recordFailure } from "./rate-limit";
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
const GENERIC_ERROR = "Mobile number or password is incorrect.";

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

async function attemptLogin(
  formData: FormData,
  allowedRoles: Role[],
): Promise<{ state: LoginState } | { redirectTo: string }> {
  const parsed = loginSchema.safeParse({
    mobile: formData.get("mobile"),
    password: formData.get("password"),
  });

  const { ip, userAgent } = await requestMeta();

  const ipKeys = ip ? [`ip:${ip}`] : [];

  // A malformed mobile still costs an attempt against the IP.
  if (!parsed.success) {
    recordFailure(ipKeys);
    return { state: { error: GENERIC_ERROR } };
  }

  const { mobile, password } = parsed.data;
  const keys = [`mobile:${mobile}`, ...ipKeys];

  const verdict = checkRateLimit(keys);
  if (!verdict.allowed) {
    const minutes = Math.ceil(verdict.retryAfterSeconds / 60);
    return {
      state: {
        error: `Too many attempts. Try again in ${minutes} minute${
          minutes === 1 ? "" : "s"
        }.`,
      },
    };
  }

  const user = await prisma.user.findUnique({ where: { mobile } });

  if (!user) {
    await fakeVerify(password); // keep unknown-account timing indistinguishable
    recordFailure(keys);
    return { state: { error: GENERIC_ERROR } };
  }

  const passwordOk = await verifyPassword(user.passwordHash, password);

  if (!passwordOk || !user.isActive || !allowedRoles.includes(user.role)) {
    recordFailure(keys);
    return { state: { error: GENERIC_ERROR } };
  }

  clearRateLimit([`mobile:${mobile}`]);

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
  const result = await attemptLogin(formData, CUSTOMER_ROLES);
  if ("redirectTo" in result) redirect(result.redirectTo);
  return result.state;
}

export async function loginStaff(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const result = await attemptLogin(formData, STAFF_ROLES);
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
