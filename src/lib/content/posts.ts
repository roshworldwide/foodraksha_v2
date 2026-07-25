import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

/**
 * The content source for the blog and FSSAI-updates engine.
 *
 * Today it reads MDX files from /content/<collection>/*.mdx. The templates only
 * ever call getPosts / getPost / getSlugs — so a CMS (Contentful, Sanity, a DB)
 * can replace the file source later by reimplementing these three functions,
 * with zero change to the pages that render them.
 *
 * Frontmatter (per file):
 *   title · description · author · publishedAt · updatedAt? · category ·
 *   ogImage? · draft?    (slug comes from the filename; readingTime is derived)
 */

export type Collection = "blog" | "updates";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  author: string;
  /** ISO date. */
  publishedAt: string;
  /** ISO date, or null if never updated. */
  updatedAt: string | null;
  category: string;
  ogImage: string | null;
  /** e.g. "5 min read". */
  readingTime: string;
  /** Seed/example copy the client should replace before launch. */
  draft: boolean;
}

export interface Post {
  meta: PostMeta;
  /** Raw MDX body (frontmatter stripped) — rendered by <Mdx>. */
  body: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content");

function dirFor(collection: Collection): string {
  return path.join(CONTENT_ROOT, collection);
}

function toMeta(collection: Collection, slug: string, raw: string): Post {
  const { data, content } = matter(raw);
  const required = ["title", "description", "author", "publishedAt"] as const;
  for (const key of required) {
    if (!data[key]) {
      throw new Error(`content/${collection}/${slug}.mdx is missing "${key}"`);
    }
  }
  return {
    meta: {
      slug,
      title: String(data.title),
      description: String(data.description),
      author: String(data.author),
      publishedAt: new Date(String(data.publishedAt)).toISOString(),
      updatedAt: data.updatedAt
        ? new Date(String(data.updatedAt)).toISOString()
        : null,
      category: String(data.category ?? "General"),
      ogImage: data.ogImage ? String(data.ogImage) : null,
      readingTime: readingTime(content).text,
      draft: Boolean(data.draft),
    },
    body: content,
  };
}

/** Slugs (filenames without .mdx) in a collection. Empty if the dir is absent. */
export async function getSlugs(collection: Collection): Promise<string[]> {
  try {
    const files = await fs.readdir(dirFor(collection));
    return files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(/\.mdx$/, ""));
  } catch {
    return [];
  }
}

export async function getPost(
  collection: Collection,
  slug: string,
): Promise<Post | null> {
  try {
    const raw = await fs.readFile(
      path.join(dirFor(collection), `${slug}.mdx`),
      "utf8",
    );
    return toMeta(collection, slug, raw);
  } catch {
    return null;
  }
}

/** All posts in a collection, newest first (by publishedAt). */
export async function getPosts(collection: Collection): Promise<PostMeta[]> {
  const slugs = await getSlugs(collection);
  const posts = await Promise.all(
    slugs.map((slug) => getPost(collection, slug)),
  );
  return posts
    .filter((p): p is Post => p !== null)
    .map((p) => p.meta)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Distinct categories in a collection, for the filter chips. */
export async function getCategories(collection: Collection): Promise<string[]> {
  const posts = await getPosts(collection);
  return [...new Set(posts.map((p) => p.category))].sort();
}
