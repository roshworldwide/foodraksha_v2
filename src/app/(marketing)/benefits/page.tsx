import type { Metadata } from "next";
import { ButtonLink } from "@/components/marketing/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { Card, CTABand } from "@/components/marketing/primitives";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "Benefits — why choose Food Raksha",
  description:
    "Why food businesses choose Food Raksha for FSSAI licensing — answer once, fair pricing, 35+ years of expertise, and real human support.",
  path: "/benefits",
});

const BENEFITS = [
  [
    "Answer once, filed everywhere",
    "You fill one questionnaire; we fan it across every government form. No typing the same thing twice.",
  ],
  [
    "Fair, transparent pricing",
    "Clear professional fees with the government fee shown separately. Good work at a price you can compare with anyone.",
  ],
  [
    "35+ years of expertise",
    "Decades of food-safety compliance behind every application — we know what the authority wants.",
  ],
  [
    "Track it online",
    "Watch your application move from filed to licensed in your dashboard, and message us any time.",
  ],
  [
    "Real human support",
    "A specialist on the phone, not a chatbot — from your first question to your issued licence.",
  ],
  [
    "Always current",
    "Post-reform accurate: perpetual validity, instant Basic Registration, the right thresholds.",
  ],
];

export default function BenefitsPage() {
  return (
    <>
      <PageHero
        eyebrow="Benefits"
        title="Why food businesses choose us"
        accent="choose us"
        lede="Compliance shouldn't be painful. Here's what makes Food Raksha different."
        align="center"
      />
      <div className="mx-auto max-w-[1120px] px-6 pt-14 pb-16">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map(([title, body], index) => (
          <Card key={title} hover>
            <span
              aria-hidden="true"
              className={
                "flex size-12 items-center justify-center rounded-[14px] text-[18px] font-bold text-white shadow-fr-soft " +
                (index % 2 === 0
                  ? "bg-gradient-to-br from-fr-blue to-fr-blue-deep"
                  : "bg-gradient-to-br from-fr-green to-fr-green-deep")
              }
            >
              {index + 1}
            </span>
            <h2 className="mt-4 text-title-3 text-fr-ink">{title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-fr-ink-2">
              {body}
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-14">
        <CTABand
          title="See the difference for yourself"
          lede="Book a free consultation — no obligation, just clear guidance."
          tone="ink"
        >
          <ButtonLink href="/book" variant="green" size="lg">
            Book a free consultation
          </ButtonLink>
        </CTABand>
      </div>
      </div>
    </>
  );
}
