import type { ReactNode } from "react";
import { Footer } from "@/components/marketing/Footer";
import { Nav } from "@/components/marketing/Nav";
import { UtilityBar } from "@/components/marketing/UtilityBar";
import { JsonLd, organizationJsonLd } from "@/lib/marketing/seo";

/**
 * The marketing website shell (phase 2). Its own white / blue / green Apple
 * theme — the fr- namespaced tokens — sitting alongside the CRM's Titanium
 * theme without touching it. Server-rendered end to end; only the LeadForm
 * ships JavaScript.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fr-site flex min-h-screen flex-col bg-fr-bg font-sans text-fr-ink antialiased">
      <UtilityBar />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <JsonLd data={organizationJsonLd()} />
    </div>
  );
}
