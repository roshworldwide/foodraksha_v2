import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight, FilePlus2, RefreshCw, Replace } from "lucide-react";
import { ButtonLink } from "@/components/marketing/Button";
import { ClientMarquee } from "@/components/marketing/ClientMarquee";
import { Hero } from "@/components/marketing/Hero";
import {
  GovAlignment,
  ProcessSection,
  SectorHub,
  ServicesSection,
} from "@/components/marketing/HomeSections";
import { LiveLedger } from "@/components/marketing/LiveLedger";
import { LeadForm } from "@/components/marketing/LeadForm";
import {
  CTABand,
  SectionHeading,
  TestimonialCard,
  TrustRow,
} from "@/components/marketing/primitives";
import { ServicePanel } from "@/components/marketing/ServicePanel";
import { TierCard } from "@/components/marketing/TierCard";
import { CLIENTS } from "@/content/clients";
import { cn } from "@/lib/cn";
import { TRUST } from "@/content/trust";
import { PLANS } from "@/lib/marketing/qualifier";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "FSSAI licensing, made simple",
  path: "/",
});

/* One accent per action, as the reference deck gives each business category its
   own colour (FR-002) rather than repeating blue. */
const ACTIONS = [
  {
    Icon: FilePlus2,
    tone: "blue" as const,
    title: "New Application",
    body: "Get your FSSAI licence done. We handle the paperwork and get it processed — fair prices, no runaround.",
    cta: "Get started",
  },
  {
    Icon: Replace,
    tone: "green" as const,
    title: "Modification",
    body: "Need to change something on your licence? We handle modifications and get it sorted quickly.",
    cta: "Modify licence",
  },
  {
    Icon: RefreshCw,
    tone: "orange" as const,
    title: "Renewal",
    body: "Licence renewal coming up? We take care of it so you stay compliant, hassle-free.",
    cta: "Renew now",
  },
];

/* `-deep` tones for the glyphs: the base accents are fill colours and orange at
   base measures 3.42:1, below AA. */
const ACTION_TONE: Record<string, string> = {
  blue: "bg-gradient-to-br from-fr-blue to-fr-blue-deep text-white",
  green: "bg-gradient-to-br from-fr-green to-fr-green-deep text-white",
  orange: "bg-gradient-to-br from-fr-orange to-fr-orange-deep text-white",
};

export default function MarketingHome() {
  return (
    <>
      {/* ── 1 · HERO — FR-001 of the reference deck. */}
      <Hero />

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
            <a
              key={action.title}
              href="#qualifier"
              className="group relative flex flex-col overflow-hidden rounded-[20px] border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-soft transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-1.5 hover:shadow-fr-lift"
            >
              <span aria-hidden="true" className="fr-shine" />
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
                  ACTION_TONE[action.tone],
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "relative flex size-[54px] items-center justify-center rounded-[16px] shadow-fr-soft transition-transform duration-300 group-hover:scale-105",
                  ACTION_TONE[action.tone],
                )}
              >
                <action.Icon className="size-6" />
              </span>
              <h3 className="relative mt-5 text-title-3 text-fr-ink">
                {action.title}
              </h3>
              <p className="relative mt-2 text-[15px] leading-relaxed text-fr-ink-2">
                {action.body}
              </p>
              <span className="relative mt-4 flex items-center gap-1.5 text-[14px] font-semibold text-fr-blue transition-[gap] duration-300 group-hover:gap-2.5">
                {action.cta}
                <ArrowRight aria-hidden="true" className="size-4" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── The client's home-page sequence (their app/page.tsx order):
             Services → Process → Calculator → Enterprise clients → Live ledger
             → Sector hub → Gov alignment. Their VideoCaseStudies section is
             omitted at your instruction. The calculator sits in the hero and the
             enterprise clients are the logo marquee further down, so those two
             slots are already filled. */}
      <ServicesSection />
      <ProcessSection />
      <LiveLedger />
      <SectorHub />
      <GovAlignment />

      {/* ── 3 · FOOD LICENCE SERVICE PANEL
             Section 5 of docs/Website-Structure-Teardown.md — the offer, its
             price, and the Overview / Process & Documents tabs. */}
      <section className="bg-fr-cream py-18">
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
            <h2 className="fr-display mt-3 text-[38px] sm:text-[54px]">
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
      <section id="pricing" className="scroll-mt-20 bg-fr-cream py-20">
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
          <ClientMarquee
            label="Our clients"
            logos={CLIENTS}
            className="mt-14"
          />
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
