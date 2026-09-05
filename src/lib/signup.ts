import { Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { env } from "@/lib/env";
import {
  getEmailAdapter,
  getSmsAdapter,
  type DeliveryResult,
} from "@/lib/notifications";
import { generatePassword } from "@/lib/password-generator";
import { prisma } from "@/lib/prisma";
import type { SignupInput } from "@/lib/validation";

export type SignupErrorCode =
  | "DUPLICATE_MOBILE"
  | "UNKNOWN_CATEGORY"
  | "NOT_FOUND";

export class SignupError extends Error {
  constructor(
    readonly code: SignupErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SignupError";
  }
}

export interface SignupAccount {
  /** Mobile number in E.164 — this is the username. */
  username: string;
  /**
   * The one and only moment this string exists in readable form. It is
   * returned to the caller, sent to the customer, and never persisted or
   * logged anywhere.
   */
  password: string;
  applicationNo: string;
  userId: string;
  name: string;
  email: string;
}

export interface DeliveryReport {
  sms: DeliveryResult;
  email: DeliveryResult;
}

/**
 * FR-YYYY-NNNN, sequential within the calendar year. Read inside the
 * transaction; the unique constraint plus a retry settles any race.
 */
async function nextApplicationNo(
  tx: Prisma.TransactionClient,
): Promise<string> {
  const prefix = `FR-${new Date().getFullYear()}-`;
  const latest = await tx.application.findFirst({
    where: { applicationNo: { startsWith: prefix } },
    orderBy: { applicationNo: "desc" },
    select: { applicationNo: true },
  });

  const sequence = latest
    ? Number.parseInt(latest.applicationNo.slice(prefix.length), 10) + 1
    : 1;

  return `${prefix}${String(sequence).padStart(4, "0")}`;
}

function isUniqueViolation(error: unknown, field: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2002") return false;
  const target = error.meta?.target;
  return Array.isArray(target)
    ? target.includes(field)
    : String(target ?? "").includes(field);
}

const DUPLICATE_MESSAGE =
  "An account already exists for this mobile number. Sign in instead, or use “Forgot password” to get back in.";

/**
 * Lead, User, Customer and DRAFT Application in one transaction. Either the
 * customer ends up with a complete, usable account or nothing is written —
 * a half-created account would strand them with no way forward.
 */
export async function createAccount(
  input: SignupInput,
  meta: { ipAddress: string | null },
): Promise<SignupAccount> {
  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  // Retries cover the narrow window where two signups pick the same
  // application number; everything else is rethrown immediately.
  for (let attempt = 0; ; attempt += 1) {
    try {
      const account = await prisma.$transaction(async (tx) => {
        const existing = await tx.user.findUnique({
          where: { mobile: input.mobile },
          select: { id: true },
        });
        if (existing) {
          throw new SignupError("DUPLICATE_MOBILE", DUPLICATE_MESSAGE);
        }

        const category = await tx.businessCategory.findFirst({
          where: { code: input.businessType, isActive: true },
          select: { id: true, code: true },
        });
        if (!category) {
          throw new SignupError(
            "UNKNOWN_CATEGORY",
            "That business type is not one we recognise. Choose one from the list.",
          );
        }

        // The funnel record. Survives the customer being deleted later.
        const lead = await tx.lead.create({
          data: {
            name: input.name,
            mobile: input.mobile,
            email: input.email,
            businessType: category.code,
            city: input.city,
            source: "website",
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
            referrer: input.referrer,
            ipAddress: meta.ipAddress,
            consentAt: new Date(),
          },
          select: { id: true },
        });

        const user = await tx.user.create({
          data: {
            role: "CUSTOMER",
            name: input.name,
            mobile: input.mobile,
            email: input.email,
            passwordHash,
            customer: {
              create: {
                // Provisional: replaced by business.legal_name once the
                // customer completes the Business Details section.
                businessName: input.name,
                city: input.city,
              },
            },
          },
          select: { id: true, customer: { select: { id: true } } },
        });

        if (!user.customer) {
          throw new Error("Customer row was not created alongside the user");
        }

        const application = await tx.application.create({
          data: {
            applicationNo: await nextApplicationNo(tx),
            customerId: user.customer.id,
            categoryId: category.id,
            // Confirmed by staff during review — turnover decides it, and we
            // deliberately do not ask at signup.
            licenceType: "STATE",
            status: "DRAFT",
          },
          select: { applicationNo: true },
        });

        await tx.lead.update({
          where: { id: lead.id },
          data: { convertedUserId: user.id },
        });

        return {
          username: input.mobile,
          password,
          applicationNo: application.applicationNo,
          userId: user.id,
          name: input.name,
          email: input.email,
        } satisfies SignupAccount;
      });

      return account;
    } catch (error) {
      if (isUniqueViolation(error, "mobile")) {
        throw new SignupError("DUPLICATE_MOBILE", DUPLICATE_MESSAGE);
      }
      if (isUniqueViolation(error, "applicationNo") && attempt < 4) {
        continue;
      }
      throw error;
    }
  }
}

/**
 * Convert an existing lead into a full account. Same rows as createAccount, but
 * it links the lead that already exists rather than creating a new one, and it
 * is initiated by a staff member — so it writes an AuditLog row.
 *
 * Reuses createAccount's transaction shape; the category is resolved by the
 * lead's businessType, which may be a code or a human label.
 */
export async function convertLead(
  leadId: string,
  staffUserId: string,
): Promise<SignupAccount> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      businessType: true,
      city: true,
      convertedUserId: true,
    },
  });
  if (!lead)
    throw new SignupError("UNKNOWN_CATEGORY", "That lead no longer exists.");
  if (lead.convertedUserId) {
    throw new SignupError(
      "DUPLICATE_MOBILE",
      "This lead has already been converted to an account.",
    );
  }

  const password = generatePassword();
  const passwordHash = await hashPassword(password);
  const { writeAudit } = await import("@/lib/audit");

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.user.findUnique({
          where: { mobile: lead.mobile },
          select: { id: true },
        });
        if (existing) {
          throw new SignupError("DUPLICATE_MOBILE", DUPLICATE_MESSAGE);
        }

        // The lead's businessType may be a code ("RESTAURANT") or a label
        // ("Restaurant"); resolve either.
        const category = await tx.businessCategory.findFirst({
          where: {
            isActive: true,
            OR: [
              { code: lead.businessType ?? "" },
              { name: lead.businessType ?? "" },
            ],
          },
          select: { id: true },
        });
        if (!category) {
          throw new SignupError(
            "UNKNOWN_CATEGORY",
            "This lead's business type does not match a category. Set it before converting.",
          );
        }

        const user = await tx.user.create({
          data: {
            role: "CUSTOMER",
            name: lead.name,
            mobile: lead.mobile,
            email: lead.email,
            passwordHash,
            customer: {
              create: { businessName: lead.name, city: lead.city },
            },
          },
          select: { id: true, customer: { select: { id: true } } },
        });
        if (!user.customer)
          throw new Error("Customer row missing after create");

        const application = await tx.application.create({
          data: {
            applicationNo: await nextApplicationNo(tx),
            customerId: user.customer.id,
            categoryId: category.id,
            licenceType: "STATE",
            status: "DRAFT",
          },
          select: { applicationNo: true },
        });

        await tx.lead.update({
          where: { id: lead.id },
          data: { convertedUserId: user.id },
        });

        await writeAudit(tx, {
          userId: staffUserId,
          entity: "Application",
          entityId: user.id,
          action: "status_change",
          after: {
            event: "lead_converted",
            leadId: lead.id,
            applicationNo: application.applicationNo,
          },
        });

        return {
          username: lead.mobile,
          password,
          applicationNo: application.applicationNo,
          userId: user.id,
          name: lead.name,
          email: lead.email ?? "",
        } satisfies SignupAccount;
      });
    } catch (error) {
      if (isUniqueViolation(error, "mobile")) {
        throw new SignupError("DUPLICATE_MOBILE", DUPLICATE_MESSAGE);
      }
      if (isUniqueViolation(error, "applicationNo") && attempt < 4) continue;
      throw error;
    }
  }
}

/* ────────────────────────────────────────── credential delivery */

function credentialEmail(account: SignupAccount) {
  const loginUrl = `${env.NEXT_PUBLIC_APP_URL}/login`;
  return {
    to: account.email,
    subject: "Your FoodRaksha login details",
    text: [
      `Hello ${account.name},`,
      "",
      "Your FoodRaksha account is ready.",
      "",
      `Username: ${account.username}`,
      `Password: ${account.password}`,
      `Application: ${account.applicationNo}`,
      "",
      `Sign in: ${loginUrl}`,
      "",
      "Keep this message safe. You can change your password after signing in.",
      "",
      "FoodRaksha",
    ].join("\n"),
  };
}

function credentialSms(account: SignupAccount) {
  return {
    to: account.username,
    text: `FoodRaksha: username ${account.username}, password ${account.password}. Application ${account.applicationNo}. Sign in at ${env.NEXT_PUBLIC_APP_URL}/login`,
    variables: {
      NAME: account.name,
      USERNAME: account.username,
      PASSWORD: account.password,
      APPLICATION: account.applicationNo,
    },
  };
}

/**
 * Fire both channels. A provider being down, unconfigured or slow must never
 * cost the customer their account — the credentials are on screen either way.
 */
export async function deliverCredentials(
  account: SignupAccount,
): Promise<DeliveryReport> {
  const email = getEmailAdapter();
  const sms = getSmsAdapter();

  const [emailResult, smsResult] = await Promise.all([
    (async (): Promise<DeliveryResult> => {
      if (!email) {
        console.warn(
          `[signup] no email provider configured — credentials for user ${account.userId} not emailed`,
        );
        return { status: "skipped", to: null };
      }
      try {
        await email.send(credentialEmail(account));
        return { status: "sent", to: account.email };
      } catch (error) {
        // Never log the message body — it carries the password.
        console.error(
          `[signup] ${email.name} email failed for user ${account.userId}:`,
          error instanceof Error ? error.message : "unknown error",
        );
        return { status: "failed", to: account.email };
      }
    })(),
    (async (): Promise<DeliveryResult> => {
      if (!sms) {
        console.warn(
          `[signup] no SMS provider configured — credentials for user ${account.userId} not texted`,
        );
        return { status: "skipped", to: null };
      }
      try {
        await sms.send(credentialSms(account));
        return { status: "sent", to: account.username };
      } catch (error) {
        console.error(
          `[signup] ${sms.name} SMS failed for user ${account.userId}:`,
          error instanceof Error ? error.message : "unknown error",
        );
        return { status: "failed", to: account.username };
      }
    })(),
  ]);

  return { email: emailResult, sms: smsResult };
}

/* ────────────────────────────────────────── staff-assisted reset */

/**
 * Generate a fresh password for a customer who is locked out, staff-initiated
 * from the client file. Sets the new hash, signs out every existing session for
 * that user, and returns the credentials so they can be delivered (SMS/email)
 * and shown on screen for staff to relay. Audited against the customer's User.
 *
 * The plaintext password exists only in the returned value — never persisted
 * or logged, exactly like the signup path.
 */
export async function resetCustomerPassword(
  applicationId: string,
  staffUserId: string,
  meta: { ipAddress: string | null },
): Promise<SignupAccount> {
  const { writeAudit } = await import("@/lib/audit");
  const { invalidateAllSessions } = await import("@/lib/auth/session");

  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  const account = await prisma.$transaction(async (tx) => {
    const application = await tx.application.findUnique({
      where: { id: applicationId },
      select: {
        applicationNo: true,
        customer: {
          select: {
            user: {
              select: {
                id: true,
                role: true,
                name: true,
                mobile: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new SignupError(
        "NOT_FOUND",
        "That client file could not be found.",
      );
    }

    const user = application.customer.user;
    if (user.role !== "CUSTOMER") {
      throw new SignupError(
        "NOT_FOUND",
        "Only a customer login can be reset here.",
      );
    }

    await tx.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await writeAudit(tx, {
      userId: staffUserId,
      entity: "User",
      entityId: user.id,
      action: "credential_reset",
      ipAddress: meta.ipAddress,
    });

    return {
      username: user.mobile,
      password,
      applicationNo: application.applicationNo,
      userId: user.id,
      name: user.name,
      email: user.email ?? "",
    } satisfies SignupAccount;
  });

  // Outside the transaction: revoke every session the customer (or a thief)
  // may still hold, so the old password is dead everywhere immediately.
  await invalidateAllSessions(account.userId);

  return account;
}
