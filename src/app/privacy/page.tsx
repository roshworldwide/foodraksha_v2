import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy — FoodRaksha",
  description:
    "How FoodRaksha collects, uses, stores and deletes your personal data under the DPDP Act 2023.",
};

/**
 * Public privacy policy. Kept a plain, readable document — this is a legal
 * notice, not a marketing page. The real marketing site (phase 2) will host
 * the polished version; this satisfies the DPDP Act 2023 disclosure duty now.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-14">
      <h1 className="text-large-title">Privacy policy</h1>
      <p className="mt-2 text-footnote text-label-2">
        Under the Digital Personal Data Protection Act 2023. Last updated 23
        July 2026.
      </p>

      <div className="mt-8 flex flex-col gap-7 text-body leading-relaxed">
        <section>
          <h2 className="mb-2 text-title-3">Who we are</h2>
          <p>
            FoodRaksha is an FSSAI food-licensing consultancy. We are the data
            fiduciary for the personal data you give us to prepare and file your
            application.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-title-3">What we collect, and why</h2>
          <p className="text-label-2">Only what an FSSAI application needs:</p>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-label-2">
            <li>
              Your name, mobile number and email, to create and run your
              account.
            </li>
            <li>
              Business and premises details, to complete the government forms.
            </li>
            <li>
              Aadhaar and PAN, which the FSSAI application requires. These are
              sensitive personal data and we treat them as such.
            </li>
            <li>Documents you upload, such as proofs and photographs.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-title-3">Consent</h2>
          <p>
            We record your consent, with a timestamp, when you create your
            account. We process your data only for the purpose you gave it —
            preparing and filing your FSSAI application — and for no other.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-title-3">How we store it</h2>
          <p>
            Passwords are hashed and never stored in readable form. Uploaded
            documents are held in private storage and are only ever served
            through short-lived links, never public URLs. Access is limited to
            FoodRaksha staff handling your application, and every staff change
            to your data is logged.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-title-3">How long we keep it</h2>
          <p>
            We keep your application data for <strong>seven years</strong> after
            your licence is issued or your application is closed, which is the
            period FSSAI compliance records are expected to be retained. After
            that, or sooner if you ask, we erase it. A minimal record that you
            were once a customer — with no personal details — is kept for our
            own accounting and attribution.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-title-3">Your rights</h2>
          <p>
            You can see and correct your data any time from your dashboard. You
            can ask us to erase it from your{" "}
            <Link
              href="/profile"
              className="font-semibold text-label underline"
            >
              profile page
            </Link>
            — this removes your account, application and documents. You may also
            withdraw consent by writing to us; we will then stop processing your
            data and delete it, unless the law requires us to keep it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-title-3">Contact</h2>
          <p className="text-label-2">
            Reach our Data Protection point of contact at the email on your
            welcome message, or through your FoodRaksha agent, for any privacy
            request or grievance.
          </p>
        </section>
      </div>

      <p className="mt-10 text-footnote text-label-2">
        <Link href="/login" className="font-semibold text-label underline">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
