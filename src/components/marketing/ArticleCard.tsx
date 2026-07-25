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
      className="group flex flex-col rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-soft transition-[transform,box-shadow] duration-300 ease-ios hover:-translate-y-1 hover:shadow-fr-lift"
    >
      <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.02em] text-fr-blue uppercase">
        <span>{post.category}</span>
        {post.draft && (
          <span className="rounded bg-[#FFF4E5] px-1.5 py-0.5 text-[#B85C00] normal-case">
            Example
          </span>
        )}
      </div>
      <h3 className="mt-2 text-title-3 text-balance text-fr-ink group-hover:text-fr-blue-deep">
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-fr-ink-2">
        {post.description}
      </p>
      <p className="mt-4 text-[13px] text-fr-ink-3">
        {formatPostDate(post.publishedAt)} · {post.readingTime}
      </p>
    </Link>
  );
}
