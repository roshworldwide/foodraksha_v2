import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { LogoStrip, TestimonialCard } from "@/components/marketing/primitives";
import { StickyLeadSidebar } from "@/components/marketing/StickyLeadSidebar";
import { TRUST } from "@/content/trust";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "Book a free consultation",
  description:
    "Book a free consultation with a Food Raksha compliance specialist — clear guidance on your FSSAI licence category, documents and timeline. Leave your number for a callback.",
  path: "/book",
});

const WHAT_YOU_GET = [
  "The right licence identified for your business",
  "A clear checklist of the documents you'll need",
  "Your timeline and price, upfront — no surprises",
  "No obligation. It's a free call.",
];

export default function BookPage() {
  return (
    <>
      {/* ── 1 · Hero */}
      <PageHero
        eyebrow="Free consultation"
        title="Book a free expert consultation for your food licence."
        accent="free"
        lede="Talk to a compliance specialist for clear guidance on your licence category, documents and timeline — free."
        align="center"
      >
        {TRUST.bookBadges.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {TRUST.bookBadges.map((badge) => (
              <span
                key={badge}
                className="fr-glass inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-[13px] font-semibold text-white"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-fr-green"
                />
                {badge}
              </span>
            ))}
          </div>
        )}
      </PageHero>

      <div className="mx-auto max-w-[1120px] px-6 pt-14 pb-16">
      {/* ── 2–5 · Content + sticky form */}
      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start">
        {/* Supporting content (scrolls) */}
        <div className="order-last lg:order-first">
          {/* WHAT YOU GET */}
          <section>
            <h2 className="text-title-3 text-fr-ink">On this free call</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {WHAT_YOU_GET.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-[16px] text-fr-ink"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-fr-green-050 text-[12px] font-bold text-fr-green-deep"
                  >
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </section>

          {/* TRUST — testimonials (hidden until real) */}
          {TRUST.testimonials.length > 0 && (
            <section className="mt-12">
              <h2 className="text-title-3 text-fr-ink">What clients say</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {TRUST.testimonials.slice(0, 2).map((t) => (
                  <TestimonialCard key={t.name} {...t} />
                ))}
              </div>
            </section>
          )}

          {/* Client logos */}
          {TRUST.clientLogos.length > 0 && (
            <section className="mt-12">
              <LogoStrip
                label="Trusted by"
                logos={TRUST.clientLogos}
                className="sm:text-left"
              />
            </section>
          )}

          {/* CTA reassurance */}
          <p className="mt-10 text-[14px] text-fr-ink-2">
            We usually call back within a few working hours. Your details stay
            100% confidential.
          </p>
        </div>

        {/* Sticky lead form — the centrepiece, via the reusable sidebar */}
        <StickyLeadSidebar
          qualifier={false}
          preferredTime
          serviceInterest="consultation"
          submitVariant="green"
          submitLabel="Get a free callback"
          title="Fast callback"
        />
      </div>
      </div>
    </>
  );
}
