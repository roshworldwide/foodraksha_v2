import type { Metadata } from "next";
import { ButtonLink } from "@/components/marketing/Button";
import { FssaiCalculator } from "@/components/marketing/FssaiCalculator";
import {
  CALCULATOR_FAQ,
  FEES_UPDATED_LABEL,
  KOB_GROUPS,
  kobsInGroup,
  PROFESSIONAL_FEE_NOTE,
  RULE_SUMMARY,
} from "@/content/fssai-fees";
import { JsonLd, pageMeta, siteUrl } from "@/lib/marketing/seo";

/**
 * /fssai-calculator — the high-intent SEO landing page ("fssai licence fee",
 * "fssai registration cost"). The widget answers the query above the fold; the
 * full fee matrix below it is server-rendered, indexable content, generated from
 * the same engine so the page can never contradict the calculator.
 */

export const metadata: Metadata = pageMeta({
  title: "FSSAI Licence Fee Calculator",
  description:
    "Work out which FSSAI licence your food business needs and the exact government fee per year — Registration ₹100, State ₹5,000, Central ₹7,500. Covers all 48 kinds of business, updated April 2026.",
  path: "/fssai-calculator",
});

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CALCULATOR_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function appJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FSSAI Licence Fee Calculator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl("/fssai-calculator"),
    description:
      "Find the FSSAI licence and per-annum government fee for any kind of food business in India.",
    offers: { "@type": "Offer", price: 0, priceCurrency: "INR" },
  };
}

export default function FssaiCalculatorPage() {
  return (
    <div className="mx-auto max-w-[1120px] px-6 py-14">
      <JsonLd data={appJsonLd()} />
      <JsonLd data={faqJsonLd()} />

      {/* ── 1 · Hero + the widget */}
      <div className="grid gap-10 lg:grid-cols-[1fr_440px] lg:items-start">
        <div>
          <p className="text-[13px] font-semibold tracking-[0.02em] text-fr-blue uppercase">
            Free tool · {FEES_UPDATED_LABEL}
          </p>
          <h1 className="mt-3.5 text-[36px] leading-[1.06] font-bold tracking-[-0.03em] text-balance text-fr-ink sm:text-[48px]">
            FSSAI Licence Fee{" "}
            <span className="text-fr-blue">Calculator</span>
          </h1>
          <p className="mt-4 max-w-[560px] text-[18px] leading-relaxed text-fr-ink-2">
            Pick your kind of business and we&rsquo;ll tell you which FSSAI
            licence you need and the exact government fee per year — using the
            official fee schedule, not a rule of thumb.
          </p>
          <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-fr-ink-2">
            {PROFESSIONAL_FEE_NOTE}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink href="/get-started" variant="blue" size="lg">
              Start your application
            </ButtonLink>
            <ButtonLink href="/services" variant="ghost" size="lg">
              See what&rsquo;s included
            </ButtonLink>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <FssaiCalculator title="FSSAI Fee Calculator" headingLevel="h2" />
        </div>
      </div>

      {/* ── 2 · The fee matrix, as indexable content */}
      <section className="mt-16">
        <h2 className="text-title-1 tracking-[-0.02em] text-fr-ink">
          FSSAI government fees by kind of business
        </h2>
        <p className="mt-2 max-w-[720px] text-[16px] leading-relaxed text-fr-ink-2">
          The official fee schedule as it stands after the 1 April 2026 revision.
          Fees are per annum and are the government&rsquo;s charge only. Turnover
          bands are inclusive of their lower edge — exactly ₹1.5 crore is a
          Registration, and exactly ₹50 crore is a State License.
        </p>

        <div className="mt-8 flex flex-col gap-10">
          {KOB_GROUPS.map((group) => (
            <div key={group}>
              <h3 className="text-title-3 text-fr-ink">{group}</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <caption className="sr-only">
                    FSSAI licence and government fee for each {group} kind of
                    business
                  </caption>
                  <thead>
                    <tr className="border-b-[0.5px] border-fr-sep">
                      <th
                        scope="col"
                        className="w-[38%] py-2.5 pr-4 text-[13px] font-semibold tracking-[0.03em] text-fr-ink-3 uppercase"
                      >
                        Kind of business
                      </th>
                      <th
                        scope="col"
                        className="py-2.5 text-[13px] font-semibold tracking-[0.03em] text-fr-ink-3 uppercase"
                      >
                        Licence &amp; government fee
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {kobsInGroup(group).map((kob) => (
                      <tr
                        key={kob.id}
                        className="border-b-[0.5px] border-fr-sep align-top"
                      >
                        <th
                          scope="row"
                          className="py-3 pr-4 text-[15px] font-semibold text-fr-ink"
                        >
                          {kob.label}
                          {kob.detail && (
                            <span className="block text-[13px] font-normal text-fr-ink-3">
                              {kob.detail}
                            </span>
                          )}
                        </th>
                        <td className="py-3 text-[15px] leading-relaxed text-fr-ink-2">
                          {RULE_SUMMARY[kob.rule]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3 · FAQ (mirrored as FAQPage structured data) */}
      <section className="mt-16">
        <h2 className="text-title-1 tracking-[-0.02em] text-fr-ink">
          FSSAI fees — common questions
        </h2>
        <dl className="mt-6 flex max-w-[760px] flex-col gap-6">
          {CALCULATOR_FAQ.map((item) => (
            <div key={item.q}>
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
    </div>
  );
}
