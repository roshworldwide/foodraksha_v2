import Link from "next/link";
import type { PostMeta } from "@/lib/content/posts";
import { cn } from "@/lib/cn";
import { ArticleCard } from "./ArticleCard";
import { PageHero } from "./PageHero";

/**
 * The shared index template for the blog and FSSAI-updates engines. The
 * category filter is link-based (?category=…), so the page stays a Server
 * Component with no client JS.
 */
export function PostIndex({
  eyebrow,
  title,
  accent,
  lede,
  posts,
  categories,
  base,
  activeCategory,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  lede: string;
  posts: PostMeta[];
  categories: string[];
  base: string;
  activeCategory?: string;
}) {
  const filtered = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} accent={accent} lede={lede} />
      <div className="mx-auto max-w-[1120px] px-6 pt-12 pb-16">
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <FilterChip href={base} active={!activeCategory}>
            All
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category}
              href={`${base}?category=${encodeURIComponent(category)}`}
              active={activeCategory === category}
            >
              {category}
            </FilterChip>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-12 text-body text-fr-ink-2">Nothing here yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <ArticleCard key={post.slug} post={post} base={base} />
          ))}
        </div>
      )}
      </div>
    </>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-pill border-[0.5px] px-3.5 py-1.5 text-[14px] font-medium transition-colors",
        active
          ? "border-transparent bg-fr-blue text-white"
          : "border-fr-sep bg-fr-bg text-fr-ink-2 hover:bg-fr-panel",
      )}
    >
      {children}
    </Link>
  );
}
