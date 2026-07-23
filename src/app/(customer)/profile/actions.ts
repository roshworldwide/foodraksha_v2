"use server";

import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireCustomer } from "@/lib/auth/guards";
import {
  clearSessionCookie,
  createSession,
  invalidateAllSessions,
  setSessionCookie,
} from "@/lib/auth/session";
import { deleteCustomerAccount } from "@/lib/dpdp/deletion";
import { prisma } from "@/lib/prisma";
import { newPasswordSchema } from "@/lib/validation";

export interface DeleteState {
  error?: string;
}

/**
 * Customer-initiated account deletion (DPDP Act 2023). Requires typing the
 * confirmation phrase, erases the account and its files, then signs out.
 */
export async function deleteMyAccount(
  _previous: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const session = await requireCustomer();

  const confirm = String(formData.get("confirm") ?? "").trim();
  if (confirm !== "DELETE") {
    return { error: "Type DELETE to confirm — nothing was removed." };
  }

  await deleteCustomerAccount(session.user.id);
  await clearSessionCookie();
  redirect("/login?deleted=1");
}

export interface PasswordState {
  error?: string;
  ok?: boolean;
}

/**
 * Change password. The current password is re-verified server-side — a valid
 * session is not enough to swap a credential — and every OTHER session is
 * revoked so a leaked cookie cannot outlive the change. The new password is
 * only ever stored as an Argon2id hash; neither value is logged.
 */
export async function changePassword(
  _previous: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const session = await requireCustomer();

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!current) return { error: "Enter your current password." };
  if (next !== confirm) return { error: "The new passwords do not match." };

  const parsed = newPasswordSchema.safeParse(next);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Choose a stronger password.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user || !(await verifyPassword(user.passwordHash, current))) {
    return { error: "That current password is not right." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await hashPassword(parsed.data) },
  });

  // Drop every session — including any a thief may hold — then hand this
  // device a fresh one so the person who just changed the password stays in.
  await invalidateAllSessions(session.user.id);
  const fresh = await createSession(session.user.id);
  await setSessionCookie(fresh.token, fresh.expiresAt);

  return { ok: true };
}
