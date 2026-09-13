import { Prisma, type Role } from "@prisma/client";
import { writeAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/auth/password";
import { invalidateAllSessions } from "@/lib/auth/session";
import { generatePassword } from "@/lib/password-generator";
import { prisma } from "@/lib/prisma";
import type { StaffInput } from "@/lib/validation";

/**
 * Team management: the admin-only operations behind /staff/team.
 *
 * Staff are never deleted — their id is on every audit row, status event and
 * document review they ever touched. Leaving is `isActive = false`, which the
 * login path already refuses, plus revoking every live session.
 */

export type TeamErrorCode =
  | "DUPLICATE_MOBILE"
  | "DUPLICATE_EMAIL"
  | "NOT_FOUND"
  | "SELF"
  | "LAST_ADMIN";

export class TeamError extends Error {
  constructor(
    readonly code: TeamErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "TeamError";
  }
}

export interface StaffCredentials {
  userId: string;
  name: string;
  email: string;
  /** E.164 mobile — the fallback username. */
  mobile: string;
  role: Role;
  /**
   * Shown to the admin exactly once, so they can hand it over. Never
   * persisted or logged — the same trust boundary as customer signup.
   */
  password: string;
}

export interface StaffRow {
  id: string;
  name: string;
  email: string | null;
  mobile: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

function isUniqueViolation(error: unknown, field: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2002") return false;
  const target = error.meta?.target;
  return Array.isArray(target)
    ? target.includes(field)
    : String(target ?? "").includes(field);
}

export async function listStaff(): Promise<StaffRow[]> {
  return prisma.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] } },
    orderBy: [{ isActive: "desc" }, { role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}

/**
 * Create a staff login. Email is not unique in the schema (customers may
 * share one), so uniqueness among staff is checked here: two staff members
 * with the same work email would make email sign-in ambiguous and fail
 * closed for both.
 */
export async function createStaffUser(
  input: StaffInput,
  actorId: string,
  meta: { ipAddress: string | null },
): Promise<StaffCredentials> {
  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const emailTaken = await tx.user.findFirst({
        where: {
          email: { equals: input.email, mode: "insensitive" },
          role: { in: ["STAFF", "ADMIN"] },
        },
        select: { id: true },
      });
      if (emailTaken) {
        throw new TeamError(
          "DUPLICATE_EMAIL",
          "A staff member already signs in with that email.",
        );
      }

      const created = await tx.user.create({
        data: {
          role: input.role,
          name: input.name,
          email: input.email,
          mobile: input.mobile,
          passwordHash,
        },
        select: { id: true },
      });

      await writeAudit(tx, {
        userId: actorId,
        entity: "User",
        entityId: created.id,
        action: "staff_created",
        after: { role: input.role, email: input.email },
        ipAddress: meta.ipAddress,
      });

      return created;
    });

    return {
      userId: user.id,
      name: input.name,
      email: input.email,
      mobile: input.mobile,
      role: input.role,
      password,
    };
  } catch (error) {
    if (isUniqueViolation(error, "mobile")) {
      throw new TeamError(
        "DUPLICATE_MOBILE",
        "An account already exists for that mobile number.",
      );
    }
    throw error;
  }
}

/**
 * Deactivate or reactivate a staff login. Two things are refused outright:
 * an admin locking themselves out, and deactivating the last active admin —
 * either would leave nobody able to manage the team.
 */
export async function setStaffActive(
  userId: string,
  isActive: boolean,
  actorId: string,
  meta: { ipAddress: string | null },
): Promise<StaffRow> {
  if (!isActive && userId === actorId) {
    throw new TeamError("SELF", "You cannot deactivate your own account.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isActive: true },
    });
    if (!target || target.role === "CUSTOMER") {
      throw new TeamError("NOT_FOUND", "That staff member could not be found.");
    }

    if (!isActive && target.role === "ADMIN" && target.isActive) {
      const activeAdmins = await tx.user.count({
        where: { role: "ADMIN", isActive: true },
      });
      if (activeAdmins <= 1) {
        throw new TeamError(
          "LAST_ADMIN",
          "This is the only active administrator. Make someone else an admin first.",
        );
      }
    }

    const row = await tx.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    await writeAudit(tx, {
      userId: actorId,
      entity: "User",
      entityId: userId,
      action: isActive ? "staff_reactivated" : "staff_deactivated",
      before: { isActive: target.isActive },
      after: { isActive },
      ipAddress: meta.ipAddress,
    });

    return row;
  });

  // Outside the transaction: a deactivated login must be dead everywhere now,
  // not at the next request that happens to re-validate the session.
  if (!isActive) await invalidateAllSessions(userId);

  return updated;
}

/**
 * Admin-issued password reset for a staff member. Mirrors the customer reset:
 * new hash, every session revoked, plaintext returned once for hand-over.
 */
export async function resetStaffPassword(
  userId: string,
  actorId: string,
  meta: { ipAddress: string | null },
): Promise<StaffCredentials> {
  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, mobile: true, role: true },
    });
    if (!target || target.role === "CUSTOMER") {
      throw new TeamError("NOT_FOUND", "That staff member could not be found.");
    }

    await tx.user.update({ where: { id: userId }, data: { passwordHash } });

    await writeAudit(tx, {
      userId: actorId,
      entity: "User",
      entityId: userId,
      action: "credential_reset",
      ipAddress: meta.ipAddress,
    });

    return target;
  });

  await invalidateAllSessions(userId);

  return {
    userId: user.id,
    name: user.name,
    email: user.email ?? "",
    mobile: user.mobile,
    role: user.role,
    password,
  };
}
