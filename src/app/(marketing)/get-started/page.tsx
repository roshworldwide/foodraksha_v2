import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/marketing/Button";
import { GetStartedForm } from "@/components/marketing/GetStartedForm";
import { LinkArrow, SectionHeading } from "@/components/marketing/primitives";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "Start your application",
  description:
    "Already know what you need? Create your Food Raksha account instantly and we'll prepare and file your FSSAI application. Prefer to talk first? Book a free consultation.",
  path: "/get-started",
});

const STEPS = [
  ["Create your account", "Takes a minute. You get your login straight away."],
  [
    "We prepare your forms",
    "Answer your questionnaire once — we fan it across every government form.",
  ],
  [
    "Track it in your dashboard",
    "Watch your application move from filed to licensed, and message us any time.",
  ],
];

export default async function GetStartedPage() {
  const categories = await prisma.businessCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { code: true, name: true },
  });

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-14">
      {/* Lead capture stays the dominant path — this is the express lane. */}
      <div className="fr-mesh-panel mb-10 flex flex-wrap items-center justify-between gap-4 rounded-fr-card border-[0.5px] border-fr-sep px-6 py-4">
        <p className="text-[15px] text-fr-ink-2">
          <span className="font-semibold text-fr-ink">Not sure yet?</span> Talk
          to an expert first — it&rsquo;s free.
        </p>
        <ButtonLink href="/book" variant="green" size="sm">
          Book a free consultation
        </ButtonLink>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow="Express lane"
            title="Start your application now"
            accent="now"
            lede="Already know what you need? Create your account and we'll take it from there — no waiting for a callback."
          />
          <ol className="mt-9 flex flex-col gap-6">
            {STEPS.map(([title, body], index) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fr-blue to-fr-blue-deep text-[15px] font-bold text-white shadow-fr-soft">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-[17px] font-semibold text-fr-ink">
                    {title}
                  </h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-fr-ink-2">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-[14px] text-fr-ink-2">
            Already have an account?{" "}
            <LinkArrow href="/login">Sign in</LinkArrow>
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-[520px] rounded-fr-card border-[0.5px] border-fr-sep bg-fr-panel" />
          }
        >
          <GetStartedForm categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
