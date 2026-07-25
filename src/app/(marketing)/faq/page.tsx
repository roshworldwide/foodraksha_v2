import type { Metadata } from "next";
import { ButtonLink } from "@/components/marketing/Button";
import { CTABand, SectionHeading } from "@/components/marketing/primitives";
import { FAQ } from "@/content/faq";
import { JsonLd, pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "FSSAI FAQ — your questions answered",
  description:
    "Answers to the most common FSSAI licensing questions — which licence you need, renewals, timelines, documents and costs, after the 2026 reforms.",
  path: "/faq",
});

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-[820px] px-6 py-14">
      <JsonLd data={faqJsonLd()} />

      <SectionHeading
        level={1}
        eyebrow="FAQ"
        title="FSSAI questions, answered"
        accent="answered"
        lede="The things food businesses ask us most — straight answers, kept accurate after the 2026 reforms."
        align="center"
        className="mb-10"
      />

      <div className="rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg shadow-fr-soft">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group border-b-[0.5px] border-fr-sep last:border-b-0"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[17px] font-semibold text-fr-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden="true"
                className="shrink-0 text-fr-blue transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-6 pb-5 text-[16px] leading-relaxed text-fr-ink-2">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-12">
        <CTABand
          title="Still have a question?"
          lede="Ask a compliance specialist directly — a free call, no obligation."
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
