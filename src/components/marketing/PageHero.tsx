import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A reusable dark, cinematic page banner for the top of every subpage.
 *
 * It renders a navy mesh-gradient field with soft colour blobs and a light
 * dot-grid, a glass eyebrow pill, a large white headline with a bright
 * blue→green gradient accent, an optional lede and optional actions. The base
 * fades into the page surface at the bottom so the white content below joins
 * seamlessly. Server Component — pure markup, no client JS.
 */
export function PageHero({
  eyebrow,
  title,
  accent,
  lede,
  children,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  /** A phrase within the title to paint with the gradient accent. */
  accent?: string;
  lede?: string;
  /** Actions (buttons/links). */
  children?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  let titleNode: ReactNode = title;
  if (accent && title.includes(accent)) {
    const [before, after] = title.split(accent);
    titleNode = (
      <>
        {before}
        <span className="text-[#5b9bff]">{accent}</span>
        {after}
      </>
    );
  }

  return (
    <section className={cn("fr-mesh relative overflow-hidden", className)}>
      {/* decorative layers */}
      <span
        aria-hidden="true"
        className="fr-dotgrid-light absolute inset-0 opacity-70"
      />
      <span
        aria-hidden="true"
        className="fr-blob fr-blob-blue absolute -top-28 -left-24 size-[30rem]"
      />
      <span
        aria-hidden="true"
        className="fr-blob fr-blob-green absolute -right-24 -bottom-32 size-[28rem]"
      />
      {/* fade into the page surface below */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-fr-bg to-transparent"
      />

      <div
        className={cn(
          "relative z-10 mx-auto max-w-[1120px] px-6 py-16 lg:py-24",
          align === "center" && "text-center",
        )}
      >
        {eyebrow && (
          <span
            className={cn(
              "fr-eyebrow mb-5 inline-flex items-center gap-3 text-[13px] text-fr-mint",
              align === "center" && "justify-center",
            )}
          >
            <span aria-hidden="true" className="h-px w-7 bg-fr-mint" />
            {eyebrow}
          </span>
        )}
        <h1 className="fr-display fr-display-tight text-[46px] text-balance text-white sm:text-[64px] lg:text-[80px]">
          {titleNode}
        </h1>
        {lede && (
          <p
            className={cn(
              "mt-5 text-[17px] leading-relaxed text-white/75 sm:text-[19px]",
              align === "center" ? "mx-auto max-w-[660px]" : "max-w-[660px]",
            )}
          >
            {lede}
          </p>
        )}
        {children && (
          <div
            className={cn(
              "mt-8 flex flex-wrap gap-3",
              align === "center" && "justify-center",
            )}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
