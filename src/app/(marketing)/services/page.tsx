import type { Metadata } from "next";
import { ButtonLink } from "@/components/marketing/Button";
import {
  Card,
  LogoStrip,
  TestimonialCard,
} from "@/components/marketing/primitives";
import { StickyLeadSidebar } from "@/components/marketing/StickyLeadSidebar";
import { LICENCES, SERVICES_FAQ } from "@/content/licences";
import { TRUST } from "@/content/trust";
import { formatInr, recommend } from "@/lib/marketing/qualifier";
import { JsonLd, pageMeta, siteUrl } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "FSSAI licence services — find the right one",
  description:
    "Find the right FSSAI licence for your business — Basic Registration, State Licence or Central Licence. We identify it from your turnover, prepare every document and file it for you.",
  path: "/services",
});

const STEPS = [
  [
    "Tell us about your business",
    "Turnover, type, city — the qualifier does the rest.",
  ],
  [
    "We prepare & file",
    "Answer your questionnaire once; we fan it across every form and file with FoSCoS.",
  ],
  [
    "Track it in your dashboard",
    "Watch it move from filed to licensed, and message us any time.",
  ],
  [
    "Licence issued",
    "You get your FSSAI licence — with perpetual validity, no renewals.",
  ],
];

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
    mainEntity: SERVICES_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-[1120px] px-6 py-14">
      <JsonLd data={serviceJsonLd()} />
      <JsonLd data={faqJsonLd()} />

      {/* ── 1 · Hero */}
      <div className="mx-auto max-w-[760px] text-center">
        <p className="text-[13px] font-semibold tracking-[0.02em] text-fr-blue uppercase">
          FSSAI Licence Services
        </p>
        <h1 className="mt-3.5 text-[36px] leading-[1.06] font-bold tracking-[-0.03em] text-balance text-fr-ink sm:text-[48px]">
          Find the right FSSAI licence for your{" "}
          <span className="text-fr-blue">business</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[18px] leading-relaxed text-fr-ink-2">
          Answer two questions and we&rsquo;ll identify your licence, prepare
          every document, and file it for you. One flow — no 22-field forms.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="#find" variant="blue" size="lg">
            Book a free consultation
          </ButtonLink>
          <ButtonLink href="/get-started" variant="ghost" size="lg">
            Start your application
          </ButtonLink>
        </div>
      </div>

      {/* ── 2/3 · Content + smart qualifier sidebar */}
      <div
        id="find"
        className="mt-14 grid scroll-mt-20 gap-10 lg:grid-cols-[1fr_400px] lg:items-start"
      >
        <div className="order-last lg:order-first">
          {/* ── 4 · The three licences (SEO content) */}
          <section>
            <h2 className="text-title-1 tracking-[-0.02em] text-fr-ink">
              The three FSSAI licences
            </h2>
            <p className="mt-2 max-w-[560px] text-[16px] leading-relaxed text-fr-ink-2">
              Your turnover decides which one you need. Since the 2026 reform
              all three carry perpetual validity — no renewals.
            </p>

            <div className="mt-6 flex flex-col gap-5">
              {LICENCES.map((licence) => {
                const rec = recommend(licence.kind);
                return (
                  <Card key={licence.kind} id={licence.kind.toLowerCase()}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-title-3 text-fr-ink">
                        {licence.name}
                      </h3>
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

          {/* ── 5 · How it works */}
          <section className="mt-14">
            <h2 className="text-title-1 tracking-[-0.02em] text-fr-ink">
              How it works
            </h2>
            <ol className="mt-6 flex flex-col gap-6">
              {STEPS.map(([title, body], index) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fr-blue-050 text-[15px] font-bold text-fr-blue">
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
          </section>

          {/* ── 6 · Trust */}
          {TRUST.testimonials.length > 0 && (
            <section className="mt-14">
              <h2 className="text-title-3 text-fr-ink">What clients say</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {TRUST.testimonials.slice(0, 2).map((t) => (
                  <TestimonialCard key={t.name} {...t} />
                ))}
              </div>
            </section>
          )}
          {TRUST.clientLogos.length > 0 && (
            <section className="mt-14">
              <LogoStrip
                label="Trusted by"
                logos={TRUST.clientLogos}
                className="sm:text-left"
              />
            </section>
          )}
        </div>

        {/* The smart qualifier, as the sticky sidebar */}
        <StickyLeadSidebar
          qualifier
          serviceInterest="New FSSAI licence"
          submitVariant="green"
          submitLabel="Get a free callback"
          title="Which licence do you need?"
        />
      </div>
    </div>
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
