import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/marketing/seo";

/**
 * Public marketing routes only. CRM areas (/staff, /dashboard, /application),
 * the API and the noindex /components page are deliberately excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/services", "/book", "/get-started"];
  return paths.map((path) => ({
    url: siteUrl(path),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
