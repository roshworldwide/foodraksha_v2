import type { Metadata } from "next";
import { ButtonLink } from "@/components/marketing/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { CTABand, LogoStrip } from "@/components/marketing/primitives";
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
    <>
      <PageHero
        eyebrow="Our clients"
        title="Trusted by growing food businesses"
        accent="growing"
        lede="From restaurants to manufacturers, we've helped businesses of every size get licensed and stay compliant."
        align="center"
      />
      <div className="mx-auto max-w-[1120px] px-6 pt-14 pb-16">
      {TRUST.clientLogos.length > 0 && (
        <div className="fr-mesh-panel fr-elevate rounded-fr-card border-[0.5px] border-fr-sep px-6 py-14">
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
    </>
  );
}
