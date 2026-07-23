import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginSwitcher } from "@/components/auth/LoginSwitcher";
import { Card } from "@/components/ui";
import { getSession, portalHomeFor } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Sign in — FoodRaksha",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; deleted?: string; role?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(portalHomeFor(session.user.role));

  const { next, deleted, role } = await searchParams;
  const initialRole = role === "staff" ? "staff" : "customer";

  return (
    <LoginSwitcher initialRole={initialRole} nextPath={next}>
      {deleted === "1" && (
        <Card className="mb-4 border-l-[3px] border-ok">
          <p className="text-body">
            Your account and data have been deleted. Thank you for using
            FoodRaksha.
          </p>
        </Card>
      )}
    </LoginSwitcher>
  );
}
