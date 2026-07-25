import type { Metadata } from "next";
import { ButtonLink } from "@/components/marketing/Button";
import {
  Card,
  CTABand,
  LogoStrip,
  SectionHeading,
  TrustRow,
} from "@/components/marketing/primitives";
import { TRUST } from "@/content/trust";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "About us",
  description:
    "Food Raksha — 35+ years helping food businesses with FSSAI compliance. Good work at a fair price. Reliable, cost-effective and efficient.",
  path: "/about",
});

const COMMITMENT = [
  {
    tone: "blue" as const,
    title: "Reliable Services",
    body: "35+ years handling food-safety compliance. We do it properly the first time, so nothing bounces back from the authority.",
  },
  {
    tone: "green" as const,
    title: "Cost-Effective",
    body: "Fair, transparent pricing with the government fee always shown separately. Good work at a price you can compare with anyone.",
  },
  {
    tone: "blue" as const,
    title: "Efficient Process",
    body: "Answer once; we fan it across every form and file for you. We move fast so you're not left waiting.",
  },
];

const RELATIONSHIPS = [
  {
    tone: "green" as const,
    title: "Customer-Centric",
    body: "Your business comes first. Clear guidance in plain language — no jargon, no runaround.",
  },
  {
    tone: "blue" as const,
    title: "Loyal Partnerships",
    body: "We're here for the long term — ongoing compliance, annual returns and support, not just the first filing.",
  },
  {
    tone: "green" as const,
    title: "Collaborative Support",
    body: "A real team you can message any time, from your first question to your issued licence.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1120px] px-6 py-14">
      {/* ── Hero */}
      <div className="mx-auto max-w-[760px] text-center">
        <p className="text-[13px] font-semibold tracking-[0.02em] text-fr-blue uppercase">
          About us
        </p>
        <h1 className="mt-3.5 text-[34px] leading-[1.08] font-bold tracking-[-0.026em] text-balance text-fr-ink sm:text-[44px]">
          Quality service at an{" "}
          <span className="text-fr-green">affordable</span> price.
        </h1>
        <p className="mx-auto mt-5 max-w-[600px] text-[18px] leading-relaxed text-fr-ink-2">
          We wanted to build something that actually helps — saving food
          businesses time, money and stress on FSSAI compliance. With 35+ years
          behind us, it comes down to something simple: good work at a fair
          price. You can compare us with anyone.
        </p>
      </div>

      {/* ── Trust numbers */}
      {TRUST.stats.length > 0 && (
        <TrustRow
          items={TRUST.stats}
          className="mx-auto mt-12 max-w-[820px] text-center"
        />
      )}

      {/* ── Our Commitment to Excellence */}
      <section className="mt-16">
        <SectionHeading
          title="Our commitment to excellence"
          accent="excellence"
          align="center"
          className="mb-10"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {COMMITMENT.map((item) => (
            <ValueCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* ── Your Satisfaction & Relationships */}
      <section className="mt-16">
        <SectionHeading
          title="Your satisfaction & relationships"
          accent="satisfaction"
          accentColor="green"
          align="center"
          className="mb-10"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {RELATIONSHIPS.map((item) => (
            <ValueCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* ── Clients */}
      {TRUST.clientLogos.length > 0 && (
        <section className="mt-16">
          <LogoStrip
            label="Trusted by growing food businesses"
            logos={TRUST.clientLogos}
          />
        </section>
      )}

      {/* ── CTA */}
      <div className="mt-16">
        <CTABand
          title="Ready to get started?"
          lede="Talk to a compliance specialist today — clear guidance on your licence, free."
          tone="ink"
        >
          <ButtonLink href="/book" variant="green" size="lg">
            Book a free consultation
          </ButtonLink>
        </CTABand>
      </div>
    </div>
  );
}

function ValueCard({
  tone,
  title,
  body,
}: {
  tone: "blue" | "green";
  title: string;
  body: string;
}) {
  return (
    <Card hover>
      <span
        aria-hidden="true"
        className={
          "flex size-11 items-center justify-center rounded-[13px] text-[20px] " +
          (tone === "green"
            ? "bg-fr-green-050 text-fr-green-deep"
            : "bg-fr-blue-050 text-fr-blue")
        }
      >
        ★
      </span>
      <h3 className="mt-4 text-title-3 text-fr-ink">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-fr-ink-2">{body}</p>
    </Card>
  );
}
