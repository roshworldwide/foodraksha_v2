import { redirect } from "next/navigation";
import { getSession, portalHomeFor } from "@/lib/auth/guards";

/**
 * The root is not a landing page — this is a CRM. Send visitors straight to
 * sign-in, and anyone already signed in to their portal home.
 */
export default async function Home() {
  const session = await getSession();
  redirect(session ? portalHomeFor(session.user.role) : "/login");
}
