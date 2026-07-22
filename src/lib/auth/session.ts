import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { Role, User } from "@prisma/client";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "fr_session";

const DAY_MS = 86_400_000;
const SESSION_MS = env.SESSION_DURATION_DAYS * DAY_MS;

/** Everything a caller may see about the signed-in user. Never the hash. */
export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  mobile: string;
  email: string | null;
}

export interface SessionContext {
  sessionId: string;
  expiresAt: Date;
  user: SessionUser;
}

export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
  };
}

/**
 * The cookie carries a random token; the database stores only its HMAC.
 * A leaked database therefore cannot be turned into a working session, and
 * rotating AUTH_SECRET invalidates every session at once.
 */
function sessionIdFromToken(token: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(token).digest("hex");
}

export async function createSession(
  userId: string,
  meta: { ipAddress?: string | null; userAgent?: string | null } = {},
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MS);

  await prisma.session.create({
    data: {
      id: sessionIdFromToken(token),
      userId,
      expiresAt,
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });

  return { token, expiresAt };
}

/**
 * Resolve a token to its session, sliding the expiry once past halfway.
 * Returns null for unknown, expired or deactivated accounts.
 */
export async function validateSessionToken(
  token: string,
): Promise<SessionContext | null> {
  const sessionId = sessionIdFromToken(token);

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {
      // Already gone — another request cleaned it up first.
    });
    return null;
  }

  if (!session.user.isActive) {
    await prisma.session.deleteMany({ where: { userId: session.userId } });
    return null;
  }

  let expiresAt = session.expiresAt;
  if (expiresAt.getTime() - Date.now() < SESSION_MS / 2) {
    expiresAt = new Date(Date.now() + SESSION_MS);
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt },
    });
  }

  return {
    sessionId,
    expiresAt,
    user: toSessionUser(session.user),
  };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { id: sessionId } });
}

export async function invalidateAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

/* --------------------------------------------------------------- cookie */

export async function setSessionCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function readSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
