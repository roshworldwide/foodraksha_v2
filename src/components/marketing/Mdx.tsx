import type { ReactNode } from "react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";

/**
 * Renders an MDX article body with themed prose components. Server Component —
 * compiles at build for statically-generated posts. No client JS.
 */

const components = {
  h2: (props: { children?: ReactNode }) => (
    <h2
      className="mt-10 mb-3 text-title-2 tracking-[-0.02em] text-fr-ink"
      {...props}
    />
  ),
  h3: (props: { children?: ReactNode }) => (
    <h3 className="mt-8 mb-2 text-title-3 text-fr-ink" {...props} />
  ),
  p: (props: { children?: ReactNode }) => (
    <p className="mt-4 text-[17px] leading-[1.7] text-fr-ink-2" {...props} />
  ),
  ul: (props: { children?: ReactNode }) => (
    <ul
      className="mt-4 flex list-disc flex-col gap-2 pl-5 text-[17px] leading-[1.6] text-fr-ink-2"
      {...props}
    />
  ),
  ol: (props: { children?: ReactNode }) => (
    <ol
      className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-[17px] leading-[1.6] text-fr-ink-2"
      {...props}
    />
  ),
  li: (props: { children?: ReactNode }) => <li className="pl-1" {...props} />,
  strong: (props: { children?: ReactNode }) => (
    <strong className="font-semibold text-fr-ink" {...props} />
  ),
  a: ({ href = "#", children }: { href?: string; children?: ReactNode }) => (
    <Link href={href} className="font-semibold text-fr-blue underline">
      {children}
    </Link>
  ),
  blockquote: (props: { children?: ReactNode }) => (
    <blockquote
      className="mt-5 border-l-[3px] border-fr-blue bg-fr-blue-050 py-2 pr-4 pl-4 text-[17px] text-fr-ink italic"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-fr-sep" />,
};

export function Mdx({ source }: { source: string }) {
  return (
    <div className="max-w-[680px]">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
