import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Card, Placeholder } from "@/components/marketing/primitives";
import { CONTACT, isPlaceholder } from "@/lib/marketing/contact";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "Contact us",
  description:
    "Get in touch with Food Raksha about your FSSAI licence — call, email, or send us a message and we'll get back to you.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1120px] px-6 py-14">
      {/* ── Hero */}
      <div className="mx-auto max-w-[680px] text-center">
        <p className="text-[13px] font-semibold tracking-[0.02em] text-fr-blue uppercase">
          Contact us
        </p>
        <h1 className="mt-3.5 text-[34px] leading-[1.08] font-bold tracking-[-0.026em] text-balance text-fr-ink sm:text-[42px]">
          We&rsquo;d love to <span className="text-fr-blue">help</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-[18px] leading-relaxed text-fr-ink-2">
          Questions about your FSSAI licence? Call us, email us, or send a
          message below — a specialist will get back to you.
        </p>
      </div>

      {/* ── Info cards */}
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        <InfoCard icon="📍" title="Our office">
          {isPlaceholder(CONTACT.address) ? (
            <Placeholder>{CONTACT.address}</Placeholder>
          ) : (
            CONTACT.address
          )}
        </InfoCard>
        <InfoCard icon="✉" title="Email us">
          {isPlaceholder(CONTACT.email) ? (
            <Placeholder>{CONTACT.email}</Placeholder>
          ) : (
            <a
              href={`mailto:${CONTACT.email}`}
              className="font-medium text-fr-blue hover:underline"
            >
              {CONTACT.email}
            </a>
          )}
        </InfoCard>
        <InfoCard icon="✆" title="Call us">
          {isPlaceholder(CONTACT.phoneDisplay) || !CONTACT.phoneHref ? (
            <Placeholder>{CONTACT.phoneDisplay}</Placeholder>
          ) : (
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="font-medium text-fr-blue hover:underline"
            >
              {CONTACT.phoneDisplay}
            </a>
          )}
          <span className="mt-1 block text-[13px] text-fr-ink-3">
            {CONTACT.hours}
          </span>
        </InfoCard>
      </div>

      {/* ── Message form + map */}
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div>
          <h2 className="text-title-2 text-fr-ink">Send us a message</h2>
          <p className="mt-2 max-w-[420px] text-[15px] leading-relaxed text-fr-ink-2">
            Tell us a little about your business and what you need. We usually
            reply within a few working hours.
          </p>
          {/* Map slot — the client's real location drops in here. */}
          <div className="mt-6 hidden aspect-[16/10] items-center justify-center rounded-fr-card border-[0.5px] border-fr-sep bg-fr-panel lg:flex">
            <Placeholder>Map — office location to be added</Placeholder>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="text-center">
      <span
        aria-hidden="true"
        className="mx-auto flex size-11 items-center justify-center rounded-[13px] bg-fr-blue-050 text-[20px] text-fr-blue"
      >
        {icon}
      </span>
      <h2 className="mt-3 text-[13px] font-semibold tracking-[0.05em] text-fr-ink-3 uppercase">
        {title}
      </h2>
      <div className="mt-1.5 text-[15px] text-fr-ink">{children}</div>
    </Card>
  );
}
