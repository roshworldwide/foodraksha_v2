import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/marketing/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep the private CRM, the API and the preview page out of the index.
      disallow: [
        "/staff",
        "/dashboard",
        "/application",
        "/forms",
        "/messages",
        "/profile",
        "/api/",
        "/components",
        "/design-system",
      ],
    },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
