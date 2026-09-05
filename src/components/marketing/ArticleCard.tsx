import Link from "next/link";
import type { PostMeta } from "@/lib/content/posts";

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export function formatPostDate(iso: string): string {
  return DATE.format(new Date(iso));
}

/** A card in a blog / updates index. Whole card links to the article. */
export function ArticleCard({ post, base }: { post: PostMeta; base: string }) {
  return (
    <Link
      href={`${base}/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-soft transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-1.5 hover:shadow-fr-lift"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fr-blue to-fr-green"
      />
      <span aria-hidden="true" className="fr-shine" />
      <div className="relative flex items-center gap-2">
        <span className="rounded-pill bg-fr-blue-050 px-2.5 py-1 text-[11.5px] font-bold tracking-[0.04em] text-fr-blue uppercase">
          {post.category}
        </span>
        {post.draft && (
          <span className="rounded bg-[#FFF4E5] px-1.5 py-0.5 text-[11px] text-[#B85C00]">
            Example
          </span>
        )}
      </div>
      <h3 className="relative mt-3 text-title-3 text-balance text-fr-ink group-hover:text-fr-blue-deep">
        {post.title}
      </h3>
      <p className="relative mt-2 line-clamp-3 text-[15px] leading-relaxed text-fr-ink-2">
        {post.description}
      </p>
      <p className="relative mt-4 text-[13px] text-fr-ink-3">
        {formatPostDate(post.publishedAt)} · {post.readingTime}
      </p>
    </Link>
  );
}
