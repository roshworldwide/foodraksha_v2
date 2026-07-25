import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The Food Raksha logo — the official mark, used by both the marketing site and
 * the portals.
 *
 * `lockup` is the supplied artwork unaltered. `mark` is the shield alone, cut
 * from the same file at the gap between shield and wordmark (columns 0–161 of
 * 750) and trimmed tight, so the two can never drift apart. src/app/icon.png and
 * apple-icon.png are generated from the same mark.
 *
 * The only asset supplied is a 750px-wide transparent PNG, so this is a raster,
 * not a vector: it is crisp at every size the interface uses (24–54px tall, and
 * the shield up to 180px square) but would soften if displayed much larger. If
 * the client can supply the original vector, drop in SVGs and only the two
 * `src` values below need to change.
 */

/** Intrinsic pixel size of the artwork, so next/image can reserve the box. */
const ART = {
  lockup: { src: "/brand/foodraksha-logo.png", width: 750, height: 162 },
  mark: { src: "/brand/foodraksha-mark.png", width: 161, height: 162 },
} as const;

export function Logo({
  variant = "lockup",
  className,
  height = 24,
}: {
  variant?: "lockup" | "mark";
  className?: string;
  height?: number;
}) {
  const art = ART[variant];
  // Width follows the artwork's own ratio, so the lockup never distorts.
  const width = Math.round((art.width / art.height) * height);

  return (
    <Image
      src={art.src}
      alt="Food Raksha"
      width={width}
      height={height}
      sizes={`${width}px`}
      priority
      className={cn("block w-auto", className)}
      style={{ height }}
    />
  );
}
