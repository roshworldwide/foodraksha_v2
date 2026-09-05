import type { Metadata } from "next";

import { ClientMarquee } from "@/components/marketing/ClientMarquee";
import { PageHero } from "@/components/marketing/PageHero";
import { ServiceTools } from "@/components/marketing/ServiceTools";
import {
  Card,
  SectionHeading,
  TestimonialCard,
} from "@/components/marketing/primitives";
import { CLIENTS } from "@/content/clients";
import { DOCUMENTS_FAQ } from "@/content/fssai-documents";
import { LICENCES, SERVICES_FAQ } from "@/content/licences";
import { PROCESS_STEPS } from "@/content/services";
import { TRUST } from "@/content/trust";
import { formatInr, recommend } from "@/lib/marketing/qualifier";
import { JsonLd, pageMeta, siteUrl } from "@/lib/marketing/seo";

/**
 * The page's FAQ — the document questions first, since "documents required for
 * FSSAI licence" is the higher-intent query this page now targets. Every one of
 * these is rendered on the page AND emitted as FAQPage structured data; the two
 * must always match, which is why they come from one array.
 */
const PAGE_FAQ = [...DOCUMENTS_FAQ, ...SERVICES_FAQ];

export const metadata: Metadata = pageMeta({
  title: "FSSAI licence services — find the right one",
  description:
    "Find the right FSSAI licence for your business — Basic Registration, State Licence or Central Licence. We identify it from your turnover, prepare every document and file it for you.",
  path: "/services",
});

/* The steps live in @/content/services — the home page's service panel shows
   the same four, and they must not drift apart. */

function serviceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "FSSAI licensing and registration",
    provider: {
      "@type": "Organization",
      name: "Food Raksha",
      url: siteUrl("/"),
    },
    areaServed: { "@type": "Country", name: "India" },
    url: siteUrl("/services"),
    description:
      "End-to-end FSSAI licensing — Basic Registration, State Licence and Central Licence — prepared and filed for food businesses across India.",
  };
}

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PAGE_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={serviceJsonLd()} />
      <JsonLd data={faqJsonLd()} />

      {/* ── 1 · Hero */}
      <PageHero
        eyebrow="FSSAI Licence Services"
        title="Find the right FSSAI licence for your business."
        accent="business"
        lede="Two questions tell you which licence you need and what it costs. Then see exactly which documents it takes — and how many of them we prepare for you."
      />

      <div className="mx-auto max-w-[1120px] px-6 pt-14 pb-16">
        {/* ── 2 · The two tools, immediately below the hero.
             The hero deliberately has NO buttons of its own: the two pill
             buttons at the top of this section are the real control, so there is
             only one place the "which tool is open" state can live. Duplicating
             them in the hero and syncing through the URL hash is what made them
             stop working. The ids remain for deep links from elsewhere. */}
      <section>
        <span id="find" aria-hidden="true" className="block scroll-mt-24" />
        <span
          id="documents"
          aria-hidden="true"
          className="block scroll-mt-24"
        />
        <h2 className="sr-only">FSSAI licence and document tools</h2>
        <ServiceTools />
      </section>

      {/* ── 3 · The three licences (SEO content) */}
      <section className="mt-20">
        <h2 className="text-title-1 tracking-[-0.02em] text-fr-ink">
          The three FSSAI licences
        </h2>
        <p className="mt-2 max-w-[560px] text-[16px] leading-relaxed text-fr-ink-2">
          Your turnover decides which one you need. Since the 2026 reform all
          three carry perpetual validity — no renewals.
        </p>

        <div className="mt-6 flex flex-col gap-5">
          {LICENCES.map((licence) => {
            const rec = recommend(licence.kind);
            return (
              <Card key={licence.kind} id={licence.kind.toLowerCase()} hover>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-title-3 text-fr-ink">{licence.name}</h3>
                  <span className="text-[14px] font-medium text-fr-ink-2">
                    {licence.turnover}
                  </span>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-fr-ink-2">
                  {licence.whoNeedsIt}
                </p>
                <p className="mt-3 text-[15px] font-semibold text-fr-ink">
                  Our fee from {formatInr(rec.plan.price)}{" "}
                  <span className="font-normal text-fr-ink-2">
                    + govt fee · {licence.timeline}
                  </span>
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {licence.examples.map((example) => (
                    <span
                      key={example}
                      className="rounded-pill bg-fr-panel px-2.5 py-1 text-[12px] text-fr-ink-2"
                    >
                      {example}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <LicenceList
                    title="What's included"
                    items={licence.included}
                  />
                  <LicenceList
                    title="Typical documents"
                    items={licence.documents}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── 4 · How it works */}
      <section className="mt-20">
        <SectionHeading title="How it works" accent="works" />
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-fr-blue to-fr-blue-deep text-[16px] font-bold text-white shadow-fr-soft">
                {index + 1}
              </span>
              <h3 className="mt-3.5 text-[17px] font-semibold text-fr-ink">
                {step.title}
              </h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-fr-ink-2">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 5 · FAQ. Rendered, not just emitted as JSON-LD: an FAQPage whose
             questions appear nowhere on the page is against Google's own
             guideline, and these answers are what the page ranks for. */}
      <section className="mt-20">
        <SectionHeading
          title="Questions people ask"
          accent="ask"
          accentColor="green"
        />
        <dl className="mt-8 grid max-w-[880px] gap-x-10 gap-y-7 sm:grid-cols-2">
          {PAGE_FAQ.map((item) => (
            <div key={item.q}>
              <dt className="text-[16px] font-semibold text-fr-ink">
                {item.q}
              </dt>
              <dd className="mt-1.5 text-[14.5px] leading-relaxed text-fr-ink-2">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── 6 · Trust */}
      {TRUST.testimonials.length > 0 && (
        <section className="mt-20">
          <SectionHeading title="What clients say" accent="clients" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {TRUST.testimonials.slice(0, 2).map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </section>
      )}

      {CLIENTS.length > 0 && (
        <section className="mt-20">
          <ClientMarquee label="Trusted by" logos={CLIENTS} />
        </section>
      )}
      </div>
    </>
  );
}

function LicenceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-[13px] font-semibold tracking-[0.03em] text-fr-ink-3 uppercase">
        {title}
      </h4>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-[14px] text-fr-ink"
          >
            <span aria-hidden="true" className="mt-0.5 text-fr-green">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
