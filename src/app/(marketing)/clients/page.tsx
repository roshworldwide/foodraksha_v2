import type { Metadata } from "next";
import { ButtonLink } from "@/components/marketing/Button";
import {
  CTABand,
  LogoStrip,
  SectionHeading,
} from "@/components/marketing/primitives";
import { TRUST } from "@/content/trust";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "Our clients",
  description:
    "The food businesses that trust Food Raksha with their FSSAI licensing and compliance.",
  path: "/clients",
});

export default function ClientsPage() {
  return (
    <div className="mx-auto max-w-[1120px] px-6 py-14">
      <SectionHeading
        level={1}
        eyebrow="Our clients"
        title="Trusted by growing food businesses"
        accent="growing"
        accentColor="green"
        lede="From restaurants to manufacturers, we've helped businesses of every size get licensed and stay compliant."
        align="center"
        className="mb-12"
      />

      {TRUST.clientLogos.length > 0 && (
        <div className="rounded-fr-card border-[0.5px] border-fr-sep bg-fr-panel px-6 py-14">
          <LogoStrip logos={TRUST.clientLogos} />
        </div>
      )}

      <div className="mt-14">
        <CTABand
          title="Join our clients"
          lede="Get your FSSAI licence handled by a team that's done it thousands of times."
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
