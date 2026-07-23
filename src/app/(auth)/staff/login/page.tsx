import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginLockup } from "@/components/auth/LoginLockup";
import { Card } from "@/components/ui";
import { loginStaff } from "@/lib/auth/actions";
import { getSession, portalHomeFor } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Staff sign in — FoodRaksha",
};

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(portalHomeFor(session.user.role));

  const { next } = await searchParams;

  return (
    <LoginLockup
      badge="Staff"
      title="CRM Workspace"
      subtitle="for the Food Raksha team"
      footer={
        <>
          Not a team member?{" "}
          <Link href="/login" className="font-semibold text-label underline">
            → Customer login
          </Link>
        </>
      }
    >
      <Card>
        <LoginForm
          action={loginStaff}
          submitLabel="Sign in"
          nextPath={next}
          identifier={{
            name: "identifier",
            label: "Work email",
            hint: "Your FoodRaksha email. Your mobile number works too.",
            type: "text",
            inputMode: "email",
            autoComplete: "username",
            placeholder: "you@foodraksha.in",
          }}
        />
      </Card>
    </LoginLockup>
  );
}
