import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/marketing/Button";
import { LeadForm } from "@/components/marketing/LeadForm";
import {
  Card,
  CTABand,
  LinkArrow,
  LogoStrip,
  SectionHeading,
} from "@/components/marketing/primitives";
import { TierCard } from "@/components/marketing/TierCard";
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
      {/* ── Hero */}
      <header className="bg-[radial-gradient(120%_80%_at_50%_-10%,var(--color-fr-blue-050),transparent_60%)] px-6 pt-20 pb-6 text-center">
        <div className="mx-auto max-w-[900px]">
          <p className="text-[13px] font-semibold tracking-[0.02em] text-fr-blue uppercase">
            FSSAI Licensing, Done Right
          </p>
          <h1 className="mx-auto mt-3.5 max-w-[900px] text-[40px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-fr-ink sm:text-[60px]">
            Your food licence, <span className="text-fr-blue">without</span> the{" "}
            <span className="text-fr-green">headache</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-[640px] text-[19px] leading-relaxed tracking-[-0.01em] text-fr-ink-2 sm:text-[21px]">
            Tell us about your business — our experts identify the right
            licence, prepare every document, and file it for you. Fair prices,
            no runaround.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/book" variant="blue" size="lg">
              Book a free consultation
            </ButtonLink>
            <LinkArrow href="#pricing">See pricing</LinkArrow>
          </div>
          <div className="mx-auto mt-9 flex max-w-[720px] flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {[
              ["35+ years", "experience"],
              ["120+", "experts"],
              ["24 hours", "typical filing"],
              ["100%", "confidential"],
            ].map(([value, label]) => (
              <span
                key={label}
                className="flex items-center gap-2 text-[14px] font-medium text-fr-ink-2"
              >
                <span className="size-[7px] rounded-full bg-fr-green" />
                <b className="font-bold text-fr-ink">{value}</b> {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Action cards */}
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
                <LinkArrow href="/book">{action.cta}</LinkArrow>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Qualifier / lead */}
      <section className="mx-auto max-w-[1120px] px-6 pb-16">
        <div className="grid items-center gap-9 rounded-[28px] bg-gradient-to-br from-fr-blue to-fr-blue-deep p-8 text-white sm:p-11 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-[13px] font-semibold tracking-[0.02em] text-white/80 uppercase">
              Not sure which licence?
            </p>
            <h2 className="mt-3 text-title-1 tracking-[-0.02em] sm:text-large-title">
              Find out in 10 seconds.
            </h2>
            <p className="mt-3 max-w-[440px] text-[17px] leading-relaxed text-white/85">
              Answer two questions and we&rsquo;ll tell you exactly which FSSAI
              licence you need, what it costs, and how fast we can file it —
              then a specialist calls you back.
            </p>
          </div>
          <Suspense
            fallback={<div className="h-[440px] rounded-[20px] bg-white/10" />}
          >
            <LeadForm
              compact
              submitVariant="blue"
              serviceInterest="New FSSAI licence"
            />
          </Suspense>
        </div>
      </section>

      {/* ── Pricing */}
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
                ctaLabel={`Choose ${plan.name}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Clients */}
      <section className="mx-auto max-w-[1120px] px-6 py-16">
        <SectionHeading
          title="Trusted by growing food businesses"
          accent="growing"
          accentColor="green"
          align="center"
          className="mb-10"
        />
        <LogoStrip
          logos={[
            "Dr Agarwals",
            "Karim's",
            "Marine Lifesciences",
            "Criticam",
            "Vinati Organics",
            "Smayan",
          ]}
        />
      </section>

      {/* ── CTA band */}
      <div className="mx-auto max-w-[1120px] px-6 pb-16">
        <CTABand
          title="Ready to get licensed?"
          lede="Talk to a compliance specialist today. Clear guidance on your category, documents and timeline — free."
          tone="ink"
        >
          <ButtonLink href="/book" variant="green" size="lg">
            Book your free consultation
          </ButtonLink>
        </CTABand>
      </div>
    </>
  );
}
