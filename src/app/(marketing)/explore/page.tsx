import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/marketing/Button";
import { CTABand, SectionHeading } from "@/components/marketing/primitives";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "Explore",
  description:
    "Explore FoodRaksha — FSM registration, our blog, FSSAI updates, FAQs, benefits, clients and reviews.",
  path: "/explore",
});

const LINKS = [
  {
    href: "/fsm-registration",
    icon: "🛡️",
    tone: "blue" as const,
    title: "FSM Registration",
    body: "Food Safety Management registration and supervisor certification.",
  },
  {
    href: "/blog",
    icon: "✎",
    tone: "green" as const,
    title: "Blog",
    body: "Practical guides on FSSAI licensing for food businesses.",
  },
  {
    href: "/fssai-updates",
    icon: "📢",
    tone: "blue" as const,
    title: "FSSAI Updates",
    body: "Dated regulatory changes, explained plainly and kept current.",
  },
  {
    href: "/faq",
    icon: "❓",
    tone: "green" as const,
    title: "FAQ",
    body: "Answers to the questions food businesses ask us most.",
  },
  {
    href: "/benefits",
    icon: "★",
    tone: "blue" as const,
    title: "Benefits",
    body: "Why food businesses choose FoodRaksha for their compliance.",
  },
  {
    href: "/clients",
    icon: "🏢",
    tone: "green" as const,
    title: "Our Clients",
    body: "The food businesses we've helped get licensed.",
  },
  {
    href: "/reviews",
    icon: "💬",
    tone: "blue" as const,
    title: "Reviews",
    body: "What our clients say about working with us.",
  },
];

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-[1120px] px-6 py-14">
      <SectionHeading
        level={1}
        eyebrow="Explore"
        title="Everything else, in one place"
        accent="one place"
        lede="Guides, updates, answers and proof — dig into the detail or jump straight to a consultation."
        align="center"
        className="mb-12"
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex flex-col rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-soft transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-1 hover:shadow-fr-lift"
          >
            <span
              aria-hidden="true"
              className={
                "flex size-11 items-center justify-center rounded-[13px] text-[20px] " +
                (link.tone === "green"
                  ? "bg-fr-green-050 text-fr-green-deep"
                  : "bg-fr-blue-050 text-fr-blue")
              }
            >
              {link.icon}
            </span>
            <h2 className="mt-4 text-title-3 text-fr-ink group-hover:text-fr-blue-deep">
              {link.title}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-fr-ink-2">
              {link.body}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-14">
        <CTABand
          title="Ready to get licensed?"
          lede="Skip the reading — book a free consultation and we'll guide you through it."
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
