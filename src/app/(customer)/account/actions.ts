"use server";

import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/auth/guards";
import { clearSessionCookie } from "@/lib/auth/session";
import { deleteCustomerAccount } from "@/lib/dpdp/deletion";

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
