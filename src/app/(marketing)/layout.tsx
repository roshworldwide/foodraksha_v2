import type { ReactNode } from "react";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { UtilityBar } from "@/components/marketing/UtilityBar";
import { JsonLd, organizationJsonLd } from "@/lib/marketing/seo";

/**
 * The marketing website shell, now on the client's enterprise design (R1 of the
 * redesign). SiteNav and SiteFooter are the ported Navbar/Footer from
 * docs/client-design.
 *
 * The `fr-` token namespace carries the client's palette — brandBlue #0C42B8,
 * brandGreen #00A859, brandDark #0B132A and the rest, taken from their
 * tailwind.config — and `.fr-site` scopes the Plus Jakarta Sans heading face to
 * this tree. The CRM's Titanium theme is a separate token set and is untouched.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fr-site flex min-h-screen flex-col bg-fr-bg font-sans text-fr-ink antialiased">
      <UtilityBar />
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <JsonLd data={organizationJsonLd()} />
    </div>
  );
}
