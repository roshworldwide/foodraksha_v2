import type { Metadata } from "next";
import { PostIndex } from "@/components/marketing/PostIndex";
import { getCategories, getPosts } from "@/lib/content/posts";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "Blog — FSSAI guides & insights",
  description:
    "Practical guides on FSSAI licensing for food businesses — which licence you need, documents, timelines and the 2026 reforms.",
  path: "/blog",
});

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  const active = Array.isArray(category) ? category[0] : category;
  const [posts, categories] = await Promise.all([
    getPosts("blog"),
    getCategories("blog"),
  ]);

  return (
    <PostIndex
      eyebrow="Blog"
      title="FSSAI guides & insights"
      accent="guides"
      lede="Clear, practical writing on FSSAI licensing for food businesses — the right licence, the documents, the timelines."
      posts={posts}
      categories={categories}
      base="/blog"
      activeCategory={active}
    />
  );
}
