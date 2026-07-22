import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
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
    <>
      <header className="mb-6">
        <h1 className="text-title-1">Staff sign in</h1>
        <p className="mt-1.5 text-body text-label-2">
          FoodRaksha employees only.
        </p>
      </header>

      <Card>
        <LoginForm action={loginStaff} submitLabel="Sign in" nextPath={next} />
      </Card>

      <p className="mt-6 text-center text-footnote text-label-2">
        Customer?{" "}
        <Link href="/login" className="font-semibold text-label underline">
          Sign in here
        </Link>
        .
      </p>
    </>
  );
}
