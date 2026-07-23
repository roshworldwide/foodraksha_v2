import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { requireCustomer } from "@/lib/auth/guards";
import { DeleteAccount } from "./DeleteAccount";

export const metadata: Metadata = {
  title: "Your account — FoodRaksha",
};

export default async function AccountPage() {
  const session = await requireCustomer();

  return (
    <main className="mx-auto max-w-[720px] px-6 py-10">
      <h1 className="text-large-title">Your account</h1>
      <p className="mt-2 mb-8 text-body text-label-2">
        Signed in as {session.user.mobile}.
      </p>

      <Card className="mb-6">
        <h2 className="text-title-3">Your data</h2>
        <p className="mt-1.5 text-body text-label-2">
          We hold the details you gave us only to prepare and file your FSSAI
          application. Read how we handle it in our{" "}
          <Link href="/privacy" className="font-semibold text-label underline">
            privacy policy
          </Link>
          .
        </p>
      </Card>

      <Card className="border-l-[3px] border-stop">
        <h2 className="text-title-3">Delete your account</h2>
        <p className="mt-1.5 mb-5 text-body text-label-2">
          Under the DPDP Act 2023 you can ask us to erase your personal data. We
          will remove your account, your application and every document you
          uploaded. This cannot be undone.
        </p>
        <DeleteAccount />
      </Card>
    </main>
  );
}
