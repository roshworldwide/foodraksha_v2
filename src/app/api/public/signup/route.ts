import { NextResponse, type NextRequest } from "next/server";
import {
  DAY,
  HOUR,
  checkRateLimit,
  formatRetryAfter,
  recordHit,
  type RateRule,
} from "@/lib/auth/rate-limit";
import { SignupError, createAccount, deliverCredentials } from "@/lib/signup";
import { signupSchema } from "@/lib/validation";

/**
 * POST /api/public/signup — the single entry point for account creation.
 *
 * Unauthenticated and public. The marketing website (phase 2) will call this
 * exact endpoint — it is the one and only entry point for account creation, so
 * this logic must never be duplicated into a page.
 */

const IP_LIMIT: Omit<RateRule, "key"> = { limit: 5, windowMs: HOUR };
const MOBILE_LIMIT: Omit<RateRule, "key"> = { limit: 3, windowMs: DAY };

function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  return forwarded?.trim() || request.headers.get("x-real-ip") || null;
}

function tooManyRequests(retryAfterSeconds: number, message: string) {
  return NextResponse.json(
    { error: message, retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const ipRules: RateRule[] = ip
    ? [{ key: `signup:ip:${ip}`, ...IP_LIMIT }]
    : [];

  const ipVerdict = checkRateLimit(ipRules);
  if (!ipVerdict.allowed) {
    return tooManyRequests(
      ipVerdict.retryAfterSeconds,
      `Too many signups from this connection. Try again in ${formatRetryAfter(
        ipVerdict.retryAfterSeconds,
      )}, or get in touch and we will set the account up for you.`,
    );
  }
  recordHit(ipRules);

  const body: unknown = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return NextResponse.json(
      { error: "Please check the details below.", fieldErrors },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const mobileRules: RateRule[] = [
    { key: `signup:mobile:${input.mobile}`, ...MOBILE_LIMIT },
  ];

  const mobileVerdict = checkRateLimit(mobileRules);
  if (!mobileVerdict.allowed) {
    return tooManyRequests(
      mobileVerdict.retryAfterSeconds,
      `This mobile number has been used for several signups today. Try again in ${formatRetryAfter(
        mobileVerdict.retryAfterSeconds,
      )}, or sign in if you already have an account.`,
    );
  }
  recordHit(mobileRules);

  try {
    const account = await createAccount(input, { ipAddress: ip });
    const delivery = await deliverCredentials(account);

    return NextResponse.json(
      {
        username: account.username,
        password: account.password,
        applicationNo: account.applicationNo,
        delivery,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SignupError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "DUPLICATE_MOBILE" ? 409 : 400 },
      );
    }

    console.error("[signup] account creation failed:", error);
    return NextResponse.json(
      {
        error:
          "Something went wrong creating your account. Nothing was saved — please try again.",
      },
      { status: 500 },
    );
  }
}
