import type { Metadata } from "next";
import { ButtonLink } from "@/components/marketing/Button";
import {
  Card,
  CTABand,
  SectionHeading,
} from "@/components/marketing/primitives";
import { TierCard } from "@/components/marketing/TierCard";
import { formatInr, MEMBERSHIP_PLANS, PLANS } from "@/lib/marketing/qualifier";
import { JsonLd, pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "Membership & pricing",
  description:
    "Transparent FSSAI pricing — Starter, Standard and Elite plans plus annual compliance memberships. Government fee shown separately. EMI available.",
  path: "/membership",
});

const COMPARE: { label: string; tiers: [boolean, boolean, boolean] }[] = [
  { label: "Right licence identified & filed", tiers: [true, true, true] },
  { label: "Application filed in 24 hours", tiers: [true, true, true] },
  { label: "Faster approval + priority documents", tiers: [false, true, true] },
  { label: "GST registration + 1 year filing", tiers: [false, false, true] },
  { label: "Trademark registration", tiers: [false, false, true] },
];

const PRICING_FAQ = [
  {
    q: "Is the government fee included?",
    a: "No. Our fee covers our professional service; the FSSAI government fee is separate and always shown before you pay.",
  },
  {
    q: "Can I pay in instalments?",
    a: "Yes — EMI is available on all of our plans.",
  },
  {
    q: "What's the difference between the plans?",
    a: "Starter covers a straightforward filing. Standard adds priority handling and faster approval. Elite adds GST registration with a year of filing, plus trademark registration.",
  },
  {
    q: "What is a membership plan?",
    a: "Memberships are annual compliance cover — we look after your ongoing obligations like annual returns and support on a simple yearly plan.",
  },
];

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRICING_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-[1120px] px-6 py-14">
      <JsonLd data={faqJsonLd()} />

      {/* ── Hero */}
      <div className="mx-auto max-w-[720px] text-center">
        <p className="text-[13px] font-semibold tracking-[0.02em] text-fr-blue uppercase">
          Membership & Pricing
        </p>
        <h1 className="mt-3.5 text-[36px] leading-[1.08] font-bold tracking-[-0.026em] text-balance text-fr-ink sm:text-[46px]">
          Plans that cover your compliance needs.
        </h1>
        <p className="mx-auto mt-4 max-w-[540px] text-[18px] leading-relaxed text-fr-ink-2">
          Pick what fits your business. Transparent pricing, government fee
          shown separately, EMI available.
        </p>
      </div>

      {/* ── Service tiers */}
      <section className="mt-12">
        <div className="grid items-start gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <TierCard
              key={plan.id}
              plan={plan}
              ctaHref="/book"
              ctaLabel={`Choose ${plan.name}`}
            />
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] text-fr-ink-3">
          Choosing a plan starts a free callback — no payment now.
        </p>
      </section>

      {/* ── Plan comparison */}
      <section className="mt-16">
        <SectionHeading
          title="Compare the plans"
          accent="Compare"
          align="center"
          className="mb-8"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b-[0.5px] border-fr-sep">
                <th className="py-3 pr-4 text-[14px] font-semibold text-fr-ink-2">
                  What&rsquo;s included
                </th>
                {PLANS.map((plan) => (
                  <th
                    key={plan.id}
                    className="px-3 py-3 text-center text-[15px] font-semibold text-fr-ink"
                  >
                    {plan.name}
                    <span className="block text-[13px] font-normal text-fr-ink-2">
                      {formatInr(plan.price)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr
                  key={row.label}
                  className="border-b-[0.5px] border-fr-sep last:border-0"
                >
                  <td className="py-3 pr-4 text-[14px] text-fr-ink">
                    {row.label}
                  </td>
                  {row.tiers.map((on, index) => (
                    <td key={index} className="px-3 py-3 text-center">
                      {on ? (
                        <span className="text-fr-green" aria-label="included">
                          ✓
                        </span>
                      ) : (
                        <span
                          className="text-fr-ink-3"
                          aria-label="not included"
                        >
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Membership plans */}
      <section className="mt-16">
        <SectionHeading
          title="Annual compliance memberships"
          accent="memberships"
          accentColor="green"
          lede="Keep your business compliant year-round — returns, support and ongoing guidance on a simple annual plan."
          align="center"
          className="mb-8"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {MEMBERSHIP_PLANS.map((plan) => (
            <Card key={plan.name} className="text-center">
              <h3 className="text-title-3 text-fr-ink">{plan.name}</h3>
              <p className="mt-2 text-title-1 font-bold tracking-[-0.02em] text-fr-ink">
                {formatInr(plan.price)}
                <span className="text-[14px] font-medium text-fr-ink-2">
                  {" "}
                  / year
                </span>
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-fr-ink-2">
                {plan.note}
              </p>
              <div className="mt-5">
                <ButtonLink href="/book" variant="soft" size="sm" fullWidth>
                  Enquire
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Pricing FAQ */}
      <section className="mx-auto mt-16 max-w-[760px]">
        <SectionHeading
          title="Pricing questions"
          accent="questions"
          align="center"
          className="mb-8"
        />
        <dl className="divide-y divide-fr-sep">
          {PRICING_FAQ.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="text-[17px] font-semibold text-fr-ink">
                {item.q}
              </dt>
              <dd className="mt-1.5 text-[15px] leading-relaxed text-fr-ink-2">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── CTA band */}
      <div className="mt-16">
        <CTABand
          title="Not sure which plan is right?"
          lede="Book a free consultation — we'll recommend the plan that fits your business and budget."
          tone="blue"
        >
          <ButtonLink href="/book" variant="green" size="lg">
            Book a free consultation
          </ButtonLink>
        </CTABand>
      </div>
    </div>
  );
}
