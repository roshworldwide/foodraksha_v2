import type { Metadata } from "next";
import { PostIndex } from "@/components/marketing/PostIndex";
import { getCategories, getPosts } from "@/lib/content/posts";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "FSSAI Updates — the latest regulatory changes",
  description:
    "Dated FSSAI regulatory updates for food businesses — reforms, thresholds and process changes, explained plainly and kept current.",
  path: "/fssai-updates",
});

export default async function UpdatesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  const active = Array.isArray(category) ? category[0] : category;
  const [posts, categories] = await Promise.all([
    getPosts("updates"),
    getCategories("updates"),
  ]);

  return (
    <PostIndex
      eyebrow="FSSAI Updates"
      title="The latest FSSAI updates"
      accent="latest"
      lede="Regulatory changes that affect food businesses — dated, plain-English, and kept current."
      posts={posts}
      categories={categories}
      base="/fssai-updates"
      activeCategory={active}
    />
  );
}
