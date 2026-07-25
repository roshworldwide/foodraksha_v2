import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/marketing/Button";
import { ClientMarquee } from "@/components/marketing/ClientMarquee";
import { FssaiCalculator } from "@/components/marketing/FssaiCalculator";
import { LeadForm } from "@/components/marketing/LeadForm";
import {
  Card,
  CTABand,
  LinkArrow,
  SectionHeading,
  TestimonialCard,
  TrustBar,
  TrustRow,
} from "@/components/marketing/primitives";
import { ServicePanel } from "@/components/marketing/ServicePanel";
import { TierCard } from "@/components/marketing/TierCard";
import { CLIENTS } from "@/content/clients";
import { TRUST } from "@/content/trust";
import { PLANS } from "@/lib/marketing/qualifier";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "FSSAI licensing, made simple",
  path: "/",
});

const ACTIONS = [
  {
    icon: "✎",
    tone: "blue" as const,
    title: "New Application",
    body: "Get your FSSAI licence done. We handle the paperwork and get it processed — fair prices, no runaround.",
    cta: "Get started",
  },
  {
    icon: "⟳",
    tone: "green" as const,
    title: "Modification",
    body: "Need to change something on your licence? We handle modifications and get it sorted quickly.",
    cta: "Modify licence",
  },
  {
    icon: "↻",
    tone: "blue" as const,
    title: "Renewal",
    body: "Licence renewal coming up? We take care of it so you stay compliant, hassle-free.",
    cta: "Renew now",
  },
];

export default function MarketingHome() {
  return (
    <>
      {/* ── 1 · HERO */}
      <header className="bg-[radial-gradient(120%_90%_at_75%_-10%,var(--color-fr-blue-050),transparent_55%)]">
        <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <p className="text-[13px] font-semibold tracking-[0.02em] text-fr-blue uppercase">
              FSSAI Licensing, Done Right
            </p>
            <h1 className="mt-3.5 text-[40px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-fr-ink sm:text-[54px]">
              FSSAI licensing you can be{" "}
              <span className="text-fr-green">sure</span> about.
            </h1>
            <p className="mt-5 max-w-[520px] text-[19px] leading-relaxed tracking-[-0.01em] text-fr-ink-2">
              Tell us about your business — our experts identify the right
              licence, prepare every document, and file it for you. Fair prices,
              no runaround.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href="#qualifier" variant="blue" size="lg">
                Book a free consultation
              </ButtonLink>
              <ButtonLink href="/get-started" variant="ghost" size="lg">
                Start your application
              </ButtonLink>
            </div>
            <TrustBar
              rating={TRUST.rating}
              reviewCount={TRUST.reviewCount}
              reviewSource={TRUST.reviewSource}
              chips={TRUST.chips}
              className="mt-8 justify-start"
            />
          </div>

          {/* Hero right column — the FSSAI Fee Calculator, the page's primary
              lead source. It replaced the "client to supply" photo placeholder.
              The widget is a client component but renders its full markup on the
              server (no useSearchParams, no effect-gated content), so there is
              nothing to shift on hydration.

              The photo's two floating trust chips are gone with it: chips
              overlapping a form would sit on top of its inputs and its bottom
              link. The same claims are in the TrustBar under the headline. */}
          <div className="mx-auto w-full max-w-[468px]">
            <FssaiCalculator title="FSSAI Fee Calculator" />
          </div>
        </div>
      </header>

      {/* ── 2 · ACTION CARDS */}
      <section className="mx-auto max-w-[1120px] px-6 py-16">
        <SectionHeading
          title="What do you need today?"
          accent="today"
          lede="Three ways we help — pick yours and we'll take it from there."
          align="center"
          className="mb-11"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {ACTIONS.map((action) => (
            <Card key={action.title} hover>
              <span
                className={
                  "flex size-[52px] items-center justify-center rounded-[15px] text-[24px] " +
                  (action.tone === "green"
                    ? "bg-fr-green-050 text-fr-green-deep"
                    : "bg-fr-blue-050 text-fr-blue")
                }
                aria-hidden="true"
              >
                {action.icon}
              </span>
              <h3 className="mt-4 text-title-3 text-fr-ink">{action.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-fr-ink-2">
                {action.body}
              </p>
              <div className="mt-4">
                <LinkArrow href="#qualifier">{action.cta}</LinkArrow>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── 3 · FOOD LICENCE SERVICE PANEL
             Section 5 of docs/Website-Structure-Teardown.md — the offer, its
             price, and the Overview / Process & Documents tabs. */}
      <section className="bg-fr-panel py-18">
        <div className="mx-auto max-w-[1120px] px-6">
          <ServicePanel />
        </div>
      </section>

      {/* ── 4 · CONSULTATION + LEAD
             The licence question is answered by the calculator in the hero, on
             the full official matrix. This band deliberately does NOT repeat it:
             two qualifiers on one page competed for the same job, and the
             turnover-band one contradicted the hero for caterers, hotels and
             importers. So `qualifier` is off here and this is purely "talk to a
             specialist". */}
      <section
        id="qualifier"
        className="mx-auto max-w-[1120px] scroll-mt-20 px-6 pb-16"
      >
        <div className="grid items-center gap-9 rounded-[28px] bg-gradient-to-br from-fr-blue to-fr-blue-deep p-8 text-white sm:p-11 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-[13px] font-semibold tracking-[0.02em] text-white/80 uppercase">
              Talk to a specialist
            </p>
            <h2 className="mt-3 text-title-1 tracking-[-0.02em] sm:text-large-title">
              Get a free callback.
            </h2>
            <p className="mt-3 max-w-[440px] text-[17px] leading-relaxed text-white/85">
              Know your licence from the calculator, or still weighing it up —
              either way, leave your number and a licensing specialist will call
              you back with your documents, timeline and a fixed quote.
            </p>
            <p className="mt-4 text-[15px] text-white/75">
              Not sure which licence you need?{" "}
              <a
                href="/fssai-calculator"
                className="font-semibold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white"
              >
                Use the fee calculator
              </a>
              .
            </p>
          </div>
          <Suspense
            fallback={<div className="h-[520px] rounded-[20px] bg-white/10" />}
          >
            <LeadForm
              compact
              qualifier={false}
              submitVariant="blue"
              serviceInterest="New FSSAI licence"
            />
          </Suspense>
        </div>
      </section>

      {/* ── 4 · PRICING */}
      <section id="pricing" className="scroll-mt-20 bg-fr-panel py-20">
        <div className="mx-auto max-w-[1120px] px-6">
          <SectionHeading
            title="The right plan for your food licence"
            accent="food licence"
            lede="Transparent pricing. Government fee shown separately. EMI available."
            align="center"
            className="mb-12"
          />
          <div className="grid items-start gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <TierCard
                key={plan.id}
                plan={plan}
                ctaHref="#qualifier"
                ctaLabel={`Choose ${plan.name}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 6 · TRUST STACK
             The marquee sits outside the 1120px container so it runs the full
             width of the viewport; its own overflow-hidden keeps that from
             adding a horizontal scrollbar. */}
      <section className="py-20">
        <div className="mx-auto max-w-[1120px] px-6">
          <SectionHeading
            title="Trusted by growing food businesses"
            accent="growing"
            accentColor="green"
            align="center"
            className="mb-12"
          />

          {TRUST.stats.length > 0 && (
            <TrustRow
              items={TRUST.stats}
              className="mx-auto max-w-[820px] text-center"
            />
          )}
        </div>

        {CLIENTS.length > 0 && (
          <ClientMarquee label="Our clients" logos={CLIENTS} className="mt-14" />
        )}

        <div className="mx-auto max-w-[1120px] px-6">
        {/* Hidden until real testimonials are supplied — never fabricated. */}
        {TRUST.testimonials.length > 0 && (
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TRUST.testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        )}

        {/* Hidden until real ISO / press badges are supplied. */}
        {TRUST.badges.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-70">
            {TRUST.badges.map((badge) => (
              <span
                key={badge}
                className="text-[15px] font-semibold text-fr-ink-2"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* ── 7 · CTA BAND */}
      <div className="mx-auto max-w-[1120px] px-6 pb-16">
        <CTABand
          title="Ready to get licensed?"
          lede="Talk to a compliance specialist today. Clear guidance on your category, documents and timeline — free."
          tone="ink"
        >
          <ButtonLink href="#qualifier" variant="green" size="lg">
            Book your free consultation
          </ButtonLink>
        </CTABand>
      </div>
    </>
  );
}
