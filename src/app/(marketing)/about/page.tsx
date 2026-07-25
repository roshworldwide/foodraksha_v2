import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/marketing/Button";
import { ClientMarquee } from "@/components/marketing/ClientMarquee";
import {
  Card,
  CTABand,
  LogoStrip,
  Placeholder,
  SectionHeading,
  TestimonialCard,
  TrustRow,
} from "@/components/marketing/primitives";
import {
  ABOUT_HERO,
  ABOUT_STORY,
  ABOUT_TEAM,
  ABOUT_VALUES,
  initials,
  visibleStats,
} from "@/content/about";
import { CLIENTS } from "@/content/clients";
import { TRUST } from "@/content/trust";
import { cn } from "@/lib/cn";
import { JsonLd, pageMeta, siteUrl } from "@/lib/marketing/seo";

/**
 * /about — a Server Component end to end; nothing here needs JS.
 *
 * Every number, photograph, face, credential and testimonial comes from
 * @/content/about or @/content/trust, and each block hides itself when its data
 * is empty. That is deliberate: an About page is where a compliance buyer looks
 * for proof, so a missing stat is cheaper than an invented one and a hidden team
 * grid is better than stock portraits.
 *
 * The Organization JSON-LD (including foundingDate and knowsAbout) is emitted
 * once from the marketing layout, so this page adds only the BreadcrumbList.
 */

export const metadata: Metadata = pageMeta({
  title: "About us",
  description:
    "Food Raksha — 35+ years in food handler and food manager training and FSSAI compliance. Good work at a fair price: we identify your licence, prepare every document and file it.",
  path: "/about",
});

function breadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About us",
        item: siteUrl("/about"),
      },
    ],
  };
}

export default function AboutPage() {
  const stats = visibleStats();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd()} />

      {/* ── 1 · HERO */}
      <header className="bg-[radial-gradient(120%_90%_at_50%_-20%,var(--color-fr-blue-050),transparent_60%)]">
        <div className="mx-auto max-w-[1120px] px-6 py-16 sm:py-20">
          <SectionHeading
            level={1}
            eyebrow={ABOUT_HERO.eyebrow}
            title={ABOUT_HERO.title}
            accent={ABOUT_HERO.accent}
            accentColor={ABOUT_HERO.accentColor}
            lede={ABOUT_HERO.lede}
            align="center"
            className="mx-auto max-w-[720px]"
          />
        </div>
      </header>

      {/* ── 2 · OUR STORY */}
      <section className="mx-auto max-w-[1120px] px-6 pb-18">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
          <div>
            <SectionHeading
              title={ABOUT_STORY.heading}
              accent={ABOUT_STORY.accent}
              accentColor="blue"
            />
            <div className="mt-5 flex flex-col gap-4">
              {ABOUT_STORY.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-[17px] leading-relaxed text-fr-ink-2"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* A real team/office photograph. Fixed ratio either way, so dropping
              the real image in causes no layout shift. */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px]">
            {ABOUT_STORY.photo ? (
              <Image
                src={ABOUT_STORY.photo.src}
                alt={ABOUT_STORY.photo.alt}
                width={ABOUT_STORY.photo.width}
                height={ABOUT_STORY.photo.height}
                sizes="(max-width: 1024px) 100vw, 420px"
                className="h-full w-full rounded-[26px] border-[0.5px] border-fr-sep object-cover shadow-fr-lift"
              />
            ) : (
              <div className="flex h-full items-center justify-center overflow-hidden rounded-[26px] border-[0.5px] border-fr-sep bg-gradient-to-br from-fr-blue-050 to-fr-green-050">
                <Placeholder>Team photo — client to supply</Placeholder>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 3 · BY THE NUMBERS */}
      {stats.length > 0 && (
        <section className="bg-fr-panel py-16">
          <div className="mx-auto max-w-[1120px] px-6">
            <SectionHeading
              title="By the numbers"
              accent="numbers"
              accentColor="green"
              align="center"
              className="mb-10"
            />
            <TrustRow
              items={stats}
              className="mx-auto max-w-[820px] text-center"
            />
          </div>
        </section>
      )}

      {/* ── 4 · WHAT WE STAND FOR — one consolidated values section */}
      <section className="mx-auto max-w-[1120px] px-6 py-18">
        <SectionHeading
          title="What we stand for"
          accent="stand for"
          lede="Four commitments, each with something you can hold us to."
          align="center"
          className="mb-10"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {ABOUT_VALUES.map((value) => (
            <Card key={value.title} hover>
              <span
                aria-hidden="true"
                className={
                  "flex size-11 items-center justify-center rounded-[13px] text-[19px] " +
                  (value.tone === "green"
                    ? "bg-fr-green-050 text-fr-green-deep"
                    : "bg-fr-blue-050 text-fr-blue")
                }
              >
                {value.glyph}
              </span>
              <h3 className="mt-4 text-title-3 text-fr-ink">{value.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-fr-ink-2">
                {value.proof}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── 5 · THE TEAM — hidden entirely until real photographs and consent
             are supplied. No stock faces, and no "coming soon" panel on a live
             marketing page. */}
      {ABOUT_TEAM.length > 0 && (
        <section className="bg-fr-panel py-18">
          <div className="mx-auto max-w-[1120px] px-6">
            <SectionHeading
              title="The people on your file"
              accent="people"
              lede="The team who prepare and file your application."
              align="center"
              className="mb-10"
            />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ABOUT_TEAM.map((member) => (
                <li key={member.name}>
                  <Card className="text-center">
                    {member.photo ? (
                      <Image
                        src={member.photo.src}
                        alt={member.photo.alt}
                        width={member.photo.width}
                        height={member.photo.height}
                        sizes="120px"
                        className="mx-auto size-[104px] rounded-full object-cover"
                      />
                    ) : (
                      /* An initials monogram — honest where a stock portrait
                         would not be. */
                      <span
                        aria-hidden="true"
                        className="mx-auto flex size-[104px] items-center justify-center rounded-full bg-fr-blue-050 text-[30px] font-bold tracking-[-0.02em] text-fr-blue"
                      >
                        {initials(member.name)}
                      </span>
                    )}
                    <h3 className="mt-4 text-[17px] font-semibold text-fr-ink">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-[14px] text-fr-ink-2">
                      {member.role}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── 6 · CREDENTIALS & RECOGNITION — ISO, memberships, press. Hidden
             until real ones exist; never seeded with plausible badges. */}
      {TRUST.badges.length > 0 && (
        <section className="mx-auto max-w-[1120px] px-6 py-18">
          <SectionHeading
            title="Credentials & recognition"
            accent="recognition"
            accentColor="green"
            align="center"
            className="mb-10"
          />
          <LogoStrip logos={TRUST.badges} />
        </section>
      )}

      {/* ── 7 · TESTIMONIALS — named, or absent. */}
      {TRUST.testimonials.length > 0 && (
        <section className="bg-fr-panel py-18">
          <div className="mx-auto max-w-[1120px] px-6">
            <SectionHeading
              title="What clients say"
              accent="clients"
              align="center"
              className="mb-10"
            />
            {/* Columns follow the count, so one or two real testimonials sit
                centred rather than stranded in the left third of a 3-up grid. */}
            <div
              className={cn(
                "mx-auto grid gap-5",
                TRUST.testimonials.length === 1
                  ? "max-w-[560px]"
                  : TRUST.testimonials.length === 2
                    ? "max-w-[840px] md:grid-cols-2"
                    : "md:grid-cols-3",
              )}
            >
              {TRUST.testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.name} {...testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── The client wall — real logos, so it belongs on the page that argues
             for our credibility. */}
      {CLIENTS.length > 0 && (
        <section className="py-18">
          <ClientMarquee label="Our clients" logos={CLIENTS} />
        </section>
      )}

      {/* ── 8 · CTA BAND */}
      <div className="mx-auto max-w-[1120px] px-6 pb-18">
        <CTABand
          title="Ready to get your licence sorted?"
          lede="Talk to a compliance specialist — clear guidance on your category, documents and timeline, free."
          tone="ink"
        >
          <ButtonLink href="/book" variant="green" size="lg">
            Book a free consultation
          </ButtonLink>
          <ButtonLink href="/membership" variant="soft" size="lg">
            See our pricing
          </ButtonLink>
        </CTABand>
      </div>
    </>
  );
}
