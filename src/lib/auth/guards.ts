import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  readSessionToken,
  validateSessionToken,
  type SessionContext,
} from "./session";

export const STAFF_ROLES: Role[] = ["STAFF", "ADMIN"];
export const CUSTOMER_ROLES: Role[] = ["CUSTOMER"];
/** Team management — creating and deactivating staff — is admin-only. */
export const ADMIN_ROLES: Role[] = ["ADMIN"];

/** Where a signed-in user belongs. */
export function portalHomeFor(role: Role): string {
  return role === "CUSTOMER" ? "/dashboard" : "/staff";
}

function loginPathFor(roles: Role[]): string {
  // One sign-in page for both portals; staff land on its Staff side.
  return roles.some((role) => role !== "CUSTOMER")
    ? "/login?role=staff"
    : "/login";
}

/**
 * The signed-in user, or null. Deduped per request by React cache, so a
 * layout and its pages share one database round trip.
 */
export const getSession = cache(async (): Promise<SessionContext | null> => {
  const token = await readSessionToken();
  if (!token) return null;
  return validateSessionToken(token);
});

/**
 * Guard a route group. Sends anonymous visitors to the matching login page
 * and signed-in users who took a wrong turn back to their own portal.
 */
export async function requireRole(roles: Role[]): Promise<SessionContext> {
  const session = await getSession();

  if (!session) redirect(loginPathFor(roles));
  if (!roles.includes(session.user.role)) {
    redirect(portalHomeFor(session.user.role));
  }

  return session;
}

export function requireCustomer(): Promise<SessionContext> {
  return requireRole(CUSTOMER_ROLES);
}

export function requireStaff(): Promise<SessionContext> {
  return requireRole(STAFF_ROLES);
}

/**
 * Admin-only pages. A STAFF user who lands here is sent back to the staff
 * dashboard rather than shown an error — the sidebar never offers them the
 * link in the first place.
 */
export function requireAdmin(): Promise<SessionContext> {
  return requireRole(ADMIN_ROLES);
}
