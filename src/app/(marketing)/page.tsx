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
  TrustRow,
} from "@/components/marketing/primitives";
import { TierCard } from "@/components/marketing/TierCard";
import {
  formatPriceFrom,
  LICENCE_INFO,
  type LicenceKind,
} from "@/lib/marketing/qualifier";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "FSSAI licensing, made simple",
  path: "/",
});

const TIER_ORDER: LicenceKind[] = ["BASIC", "STATE", "CENTRAL"];

/** Placeholder home — enough to prove the shell + primitives + lead engine. */
export default function MarketingHome() {
  return (
    <>
      {/* ── Hero */}
      <section className="border-b-[0.5px] border-fr-sep">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-pill bg-fr-green-050 px-3 py-1.5 text-[13px] font-semibold text-fr-green-deep">
              <span className="size-1.5 rounded-full bg-fr-green" />
              Trusted FSSAI licensing consultancy
            </span>
            <h1 className="mt-5 text-large-title text-balance text-fr-ink sm:text-[52px] sm:leading-[1.05] sm:tracking-[-0.03em]">
              Your FSSAI licence, <span className="text-fr-blue">handled</span>{" "}
              for you.
            </h1>
            <p className="mt-5 max-w-[520px] text-[19px] leading-relaxed tracking-[-0.01em] text-fr-ink-2">
              Answer a few questions once — we prepare and file every government
              form, from Basic Registration to Central Licence, and keep you
              posted the whole way.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/book" variant="green" size="lg">
                Book a free consultation
              </ButtonLink>
              <ButtonLink href="#pricing" variant="ghost" size="lg">
                See pricing
              </ButtonLink>
            </div>
            <div className="mt-10">
              <TrustRow
                items={[
                  { value: "2,000+", label: "Licences filed" },
                  { value: "4.9★", label: "Client rating" },
                  { value: "17", label: "Forms, one answer set" },
                  { value: "100%", label: "Online process" },
                ]}
              />
            </div>
          </div>

          {/* Qualifier */}
          <div>
            <Suspense
              fallback={
                <div className="h-[520px] rounded-fr-card border-[0.5px] border-fr-sep bg-fr-panel" />
              }
            >
              <LeadForm
                title="Which licence do you need?"
                serviceInterest="New FSSAI licence"
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── Logo strip */}
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <LogoStrip
          label="Food businesses across India trust FoodRaksha"
          logos={[
            "Restaurants",
            "Cloud kitchens",
            "Manufacturers",
            "Traders",
            "Importers",
          ]}
        />
      </div>

      {/* ── Services (anchor) */}
      <section id="services" className="scroll-mt-24 bg-fr-panel py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <SectionHeading
            eyebrow="What we do"
            title="Every FSSAI need, in one place"
            accent="one place"
            lede="From your first registration to renewals, modifications and annual returns — we handle the paperwork so you don't have to."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "New licence",
                "We work out the right licence and file it end to end.",
              ],
              [
                "Renewals",
                "Never miss a deadline — we track and renew for you.",
              ],
              [
                "Modifications",
                "Change of address, category or capacity, handled.",
              ],
              [
                "Annual returns",
                "Form D filings prepared and submitted on time.",
              ],
              [
                "Product approvals",
                "Guidance on categories, labels and specifications.",
              ],
              [
                "Compliance support",
                "Ongoing help so you stay on the right side of FSSAI.",
              ],
            ].map(([title, body]) => (
              <Card key={title} hover>
                <h3 className="text-title-3 text-fr-ink">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-fr-ink-2">
                  {body}
                </p>
                <div className="mt-4">
                  <LinkArrow href="/book">Get started</LinkArrow>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing (real qualifier data) */}
      <section id="pricing" className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple, transparent pricing"
            accent="transparent"
            accentColor="green"
            align="center"
            lede="Your turnover decides your licence. Professional fees below — government fees are separate and shown before you pay."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {TIER_ORDER.map((kind) => {
              const info = LICENCE_INFO[kind];
              return (
                <TierCard
                  key={kind}
                  name={info.name}
                  priceFrom={formatPriceFrom(kind)}
                  timeline={info.timeline}
                  summary={info.summary}
                  featured={kind === "STATE"}
                  ctaLabel="Book a consultation"
                />
              );
            })}
          </div>
          <p className="mt-6 text-center text-[13px] text-fr-ink-3">
            Indicative professional fees. Final quote confirmed after a free
            consultation.
          </p>
        </div>
      </section>

      {/* ── Placeholder anchored sections (content is Stage 2) */}
      {[
        [
          "about",
          "About FoodRaksha",
          "Who we are and why food businesses trust us with their licensing.",
        ],
        [
          "membership",
          "Membership",
          "Ongoing compliance cover — renewals, returns and support on a simple plan.",
        ],
        [
          "enrollment",
          "Enrollment",
          "How to get started and what to expect once you sign up.",
        ],
        [
          "explore",
          "Explore",
          "Guides and resources on FSSAI licensing for food businesses.",
        ],
      ].map(([id, title, lede]) => (
        <section
          key={id}
          id={id}
          className="scroll-mt-24 border-t-[0.5px] border-fr-sep py-16"
        >
          <div className="mx-auto max-w-[1200px] px-6">
            <SectionHeading eyebrow="Coming soon" title={title} lede={lede} />
            <p className="mt-4 text-[14px] text-fr-ink-3">
              This section is part of the website content build (Stage 2).
            </p>
          </div>
        </section>
      ))}

      {/* ── CTA band */}
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <CTABand
          title="Ready to get your FSSAI licence?"
          lede="Book a free consultation. No payment now — an adviser will call you back."
          tone="blue"
        >
          <ButtonLink href="/book" variant="green" size="lg">
            Book now
          </ButtonLink>
          <ButtonLink
            href="/login"
            variant="ghost"
            size="lg"
            className="!text-white !ring-white/40 hover:!bg-white/10"
          >
            Track my application
          </ButtonLink>
        </CTABand>
      </div>
    </>
  );
}
