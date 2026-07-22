import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui";
import { loginCustomer } from "@/lib/auth/actions";
import { getSession, portalHomeFor } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Sign in — FoodRaksha",
};

export default async function CustomerLoginPage({
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
        <h1 className="text-title-1">Sign in</h1>
        <p className="mt-1.5 text-body text-label-2">
          Continue your FSSAI application.
        </p>
      </header>

      <Card>
        <LoginForm
          action={loginCustomer}
          submitLabel="Sign in"
          nextPath={next}
        />
      </Card>

      <p className="mt-6 text-center text-footnote text-label-2">
        FoodRaksha staff sign in{" "}
        <Link
          href="/staff/login"
          className="font-semibold text-label underline"
        >
          here
        </Link>
        .
      </p>
    </>
  );
}
