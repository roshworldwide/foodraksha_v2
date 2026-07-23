import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginLockup } from "@/components/auth/LoginLockup";
import { Card } from "@/components/ui";
import { loginCustomer } from "@/lib/auth/actions";
import { getSession, portalHomeFor } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Sign in — FoodRaksha",
};

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; deleted?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(portalHomeFor(session.user.role));

  const { next, deleted } = await searchParams;

  return (
    <LoginLockup
      badge="Customer"
      title="Welcome back"
      subtitle="Track your FSSAI licence application"
      footer={
        <>
          New here?{" "}
          <Link
            href="/get-started"
            className="font-semibold text-label underline"
          >
            Start your application →
          </Link>
          <span className="mt-2 block">
            FoodRaksha team?{" "}
            <Link
              href="/staff/login"
              className="font-semibold text-label underline"
            >
              Staff login
            </Link>
          </span>
        </>
      }
    >
      {deleted === "1" && (
        <Card className="mb-4 border-l-[3px] border-ok">
          <p className="text-body">
            Your account and data have been deleted. Thank you for using
            FoodRaksha.
          </p>
        </Card>
      )}

      <Card>
        <LoginForm
          action={loginCustomer}
          submitLabel="Sign in"
          nextPath={next}
          identifier={{
            name: "mobile",
            label: "Mobile number",
            hint: "The number you registered with.",
            type: "tel",
            inputMode: "numeric",
            autoComplete: "username",
            placeholder: "98450 21764",
          }}
        />
      </Card>
    </LoginLockup>
  );
}
