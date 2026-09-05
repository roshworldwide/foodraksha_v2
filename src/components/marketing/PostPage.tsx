import Link from "next/link";
import type { Post, PostMeta } from "@/lib/content/posts";
import { JsonLd, siteUrl } from "@/lib/marketing/seo";
import { ArticleCard, formatPostDate } from "./ArticleCard";
import { StickyLeadSidebar } from "./StickyLeadSidebar";
import { Mdx } from "./Mdx";

/**
 * The shared article template for the blog and FSSAI-updates engines. Both
 * [slug] routes render this — adding a post is adding an MDX file, no code.
 */
export function PostPage({
  post,
  related,
  collectionLabel,
  base,
  emphasizeUpdated = false,
}: {
  post: Post;
  related: PostMeta[];
  collectionLabel: string;
  base: string;
  emphasizeUpdated?: boolean;
}) {
  const { meta } = post;
  const url = siteUrl(`${base}/${meta.slug}`);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": emphasizeUpdated ? "NewsArticle" : "Article",
    headline: meta.title,
    description: meta.description,
    author: { "@type": "Person", name: meta.author },
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt ?? meta.publishedAt,
    mainEntityOfPage: url,
    publisher: { "@type": "Organization", name: "Food Raksha" },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: collectionLabel,
        item: siteUrl(base),
      },
      { "@type": "ListItem", position: 3, name: meta.title, item: url },
    ],
  };

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-12">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-[13px] text-fr-ink-2">
        <Link href="/" className="hover:text-fr-ink">
          Home
        </Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <Link href={base} className="hover:text-fr-ink">
          {collectionLabel}
        </Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <span className="text-fr-ink-3">{meta.title}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Article */}
        <article className="order-last min-w-0 lg:order-first">
          <span className="inline-flex rounded-pill bg-fr-blue-050 px-3 py-1 text-[12px] font-bold tracking-[0.04em] text-fr-blue uppercase">
            {meta.category}
          </span>
          <h1 className="mt-3 text-[34px] leading-[1.1] font-bold tracking-[-0.026em] text-balance text-fr-ink sm:text-[40px]">
            {meta.title}
          </h1>

          {emphasizeUpdated && meta.updatedAt && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-pill bg-fr-green-050 px-3.5 py-1.5 text-[13px] font-semibold text-fr-green-deep">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-fr-green"
              />
              Updated {formatPostDate(meta.updatedAt)}
            </p>
          )}

          <p className="mt-4 text-[14px] text-fr-ink-2">
            By {meta.author} · {formatPostDate(meta.publishedAt)} ·{" "}
            {meta.readingTime}
            {!emphasizeUpdated && meta.updatedAt && (
              <> · Updated {formatPostDate(meta.updatedAt)}</>
            )}
          </p>

          {meta.draft && (
            <p className="mt-5 rounded-input border-[0.5px] border-[#F0C98A] bg-[#FFF4E5] px-4 py-2.5 text-[13px] text-[#8a5200]">
              Example content — seeded to demonstrate the engine. Replace before
              launch.
            </p>
          )}

          <div className="mt-6">
            <Mdx source={post.body} />
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-14 border-t-[0.5px] border-fr-sep pt-8">
              <h2 className="text-title-3 text-fr-ink">Keep reading</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {related.map((item) => (
                  <ArticleCard key={item.slug} post={item} base={base} />
                ))}
              </div>
            </section>
          )}
        </article>

        {/* CTA sidebar */}
        <StickyLeadSidebar
          qualifier
          serviceInterest="New FSSAI licence"
          submitVariant="green"
          submitLabel="Get a free callback"
          title="Which licence do you need?"
        />
      </div>
    </div>
  );
}
