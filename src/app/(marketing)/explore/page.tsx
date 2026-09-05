import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/marketing/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { CTABand } from "@/components/marketing/primitives";
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
    <>
      <PageHero
        eyebrow="Explore"
        title="Everything else, in one place"
        accent="one place"
        lede="Guides, updates, answers and proof — dig into the detail or jump straight to a consultation."
        align="center"
      />
      <div className="mx-auto max-w-[1120px] px-6 pt-14 pb-16">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group relative flex flex-col overflow-hidden rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-soft transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-1.5 hover:shadow-fr-lift"
          >
            <span aria-hidden="true" className="fr-shine" />
            <span
              aria-hidden="true"
              className={
                "relative flex size-12 items-center justify-center rounded-[14px] text-[20px] text-white shadow-fr-soft " +
                (link.tone === "green"
                  ? "bg-gradient-to-br from-fr-green to-fr-green-deep"
                  : "bg-gradient-to-br from-fr-blue to-fr-blue-deep")
              }
            >
              {link.icon}
            </span>
            <h2 className="relative mt-4 text-title-3 text-fr-ink group-hover:text-fr-blue-deep">
              {link.title}
            </h2>
            <p className="relative mt-2 text-[15px] leading-relaxed text-fr-ink-2">
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
    </>
  );
}
