import type { Metadata } from "next";
import { FOUNDED_YEAR, KNOWS_ABOUT } from "@/content/about";
import { env } from "@/lib/env";
import { CONTACT, CONTACT_IS_PLACEHOLDER } from "./contact";

const SITE_NAME = "Food Raksha";
const DEFAULT_DESCRIPTION =
  "FSSAI licensing made simple. FoodRaksha prepares and files every form for you — Basic Registration, State and Central Licence, renewals and annual returns.";

export function siteUrl(path = "/"): string {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return path === "/"
    ? base
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Per-page metadata. Title templates, canonical, Open Graph and Twitter. */
export function pageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
}: {
  title: string;
  description?: string;
  path?: string;
}): Metadata {
  const url = siteUrl(path);
  const fullTitle =
    path === "/"
      ? `${SITE_NAME} — FSSAI licensing, made simple`
      : `${title} — ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/** Per-article metadata — Open Graph type "article" with dates and author. */
export function articleMeta({
  title,
  description,
  path,
  publishedTime,
  modifiedTime,
  author,
}: {
  title: string;
  description: string;
  path: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
}): Metadata {
  const base = pageMeta({ title, description, path });
  return {
    ...base,
    authors: [{ name: author }],
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime,
      modifiedTime: modifiedTime ?? publishedTime,
      authors: [author],
    },
  };
}

/**
 * Organization + LocalBusiness JSON-LD. While contact details are placeholders
 * we emit only what is real (name, url, logo) and omit the address and phone —
 * never seed structured data with invented contact facts.
 *
 * Emitted once, from the marketing layout, so every page carries the same
 * single Organization entity. /about therefore does NOT emit its own — a second
 * node would describe the same company twice. Its `foundingDate` and
 * `knowsAbout` come from @/content/about and follow the same rule as the rest:
 * foundingDate is omitted entirely until the client confirms a year, because
 * "35+ years" is a floor, not a date.
 */
export function organizationJsonLd(): Record<string, unknown> {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    name: SITE_NAME,
    url: siteUrl("/"),
    logo: siteUrl("/brand/foodraksha-logo.svg"),
    description: DEFAULT_DESCRIPTION,
    knowsAbout: KNOWS_ABOUT,
  };

  if (FOUNDED_YEAR !== null) base.foundingDate = String(FOUNDED_YEAR);

  if (!CONTACT_IS_PLACEHOLDER) {
    base.email = CONTACT.email;
    if (CONTACT.phoneHref) base.telephone = CONTACT.phoneHref;
    base.address = {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address,
      addressCountry: "IN",
    };
    base.openingHours = CONTACT.hours;
  }

  return base;
}

/** Renders a JSON-LD script tag. Use once per page, in the <body>. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered from our own trusted object; not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
