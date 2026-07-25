import { NextResponse, type NextRequest } from "next/server";
import {
  DAY,
  HOUR,
  checkRateLimit,
  formatRetryAfter,
  recordHit,
  type RateRule,
} from "@/lib/auth/rate-limit";
import { createWebsiteLead, leadSchema } from "@/lib/marketing/lead";

/**
 * POST /api/public/lead — the website's enquiry endpoint.
 *
 * Unauthenticated and public. Creates a Lead (source = "website") that lands in
 * the CRM's Website Enquiries inbox for the team to convert manually. This is
 * DISTINCT from /api/public/signup, which creates a full account with
 * credentials — leave that as the secondary "start now" path.
 */

export const runtime = "nodejs";

const IP_LIMIT: Omit<RateRule, "key"> = { limit: 8, windowMs: HOUR };
const MOBILE_LIMIT: Omit<RateRule, "key"> = { limit: 4, windowMs: DAY };

function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  return forwarded?.trim() || request.headers.get("x-real-ip") || null;
}

function tooMany(retryAfterSeconds: number, message: string) {
  return NextResponse.json(
    { error: message, retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const ipRules: RateRule[] = ip ? [{ key: `lead:ip:${ip}`, ...IP_LIMIT }] : [];

  const ipVerdict = checkRateLimit(ipRules);
  if (!ipVerdict.allowed) {
    return tooMany(
      ipVerdict.retryAfterSeconds,
      `Too many requests from this connection. Try again in ${formatRetryAfter(
        ipVerdict.retryAfterSeconds,
      )}, or call us instead.`,
    );
  }
  recordHit(ipRules);

  const body: unknown = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
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
    { key: `lead:mobile:${input.mobile}`, ...MOBILE_LIMIT },
  ];
  const mobileVerdict = checkRateLimit(mobileRules);
  if (!mobileVerdict.allowed) {
    return tooMany(
      mobileVerdict.retryAfterSeconds,
      `We've already got a few requests from this number today. We'll be in touch — or call us in ${formatRetryAfter(
        mobileVerdict.retryAfterSeconds,
      )}.`,
    );
  }
  recordHit(mobileRules);

  await createWebsiteLead(input, { ipAddress: ip });

  return NextResponse.json(
    {
      ok: true,
      message:
        "Thanks — we've got your details and a FoodRaksha adviser will call you back shortly.",
    },
    { status: 201 },
  );
}
