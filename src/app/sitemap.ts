import type { MetadataRoute } from "next";
import { getSlugs } from "@/lib/content/posts";
import { siteUrl } from "@/lib/marketing/seo";

/**
 * Public marketing routes, including every blog post and FSSAI update
 * (enumerated from the content source). CRM areas, the API and the noindex
 * /components page are excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/",
    "/services",
    "/fssai-calculator",
    "/membership",
    "/about",
    "/contact",
    "/book",
    "/get-started",
    "/explore",
    "/faq",
    "/benefits",
    "/reviews",
    "/clients",
    "/fsm-registration",
    "/blog",
    "/fssai-updates",
  ];

  const [blogSlugs, updateSlugs] = await Promise.all([
    getSlugs("blog"),
    getSlugs("updates"),
  ]);

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: siteUrl(path),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  for (const slug of blogSlugs) {
    entries.push({
      url: siteUrl(`/blog/${slug}`),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  for (const slug of updateSlugs) {
    entries.push({
      url: siteUrl(`/fssai-updates/${slug}`),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
