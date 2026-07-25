import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostPage } from "@/components/marketing/PostPage";
import { getPost, getPosts, getSlugs } from "@/lib/content/posts";
import { articleMeta } from "@/lib/marketing/seo";

export async function generateStaticParams() {
  const slugs = await getSlugs("updates");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost("updates", slug);
  if (!post) return {};
  return articleMeta({
    title: post.meta.title,
    description: post.meta.description,
    path: `/fssai-updates/${slug}`,
    publishedTime: post.meta.publishedAt,
    modifiedTime: post.meta.updatedAt ?? undefined,
    author: post.meta.author,
  });
}

export default async function UpdatePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost("updates", slug);
  if (!post) notFound();

  const all = await getPosts("updates");
  const related = all.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <PostPage
      post={post}
      related={related}
      collectionLabel="FSSAI Updates"
      base="/fssai-updates"
      emphasizeUpdated
    />
  );
}
