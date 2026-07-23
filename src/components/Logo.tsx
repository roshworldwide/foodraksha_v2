import { cn } from "@/lib/cn";

/**
 * The FoodRaksha logo.
 *
 * Interpretation vectors live in public/brand/ — swap them for the official
 * files when supplied (they slot in with no code change). The shield keeps its
 * blue/green: it is the only colour in an otherwise titanium interface.
 *
 * TODO(brand): replace public/brand/foodraksha-{logo,mark}.svg and
 * src/app/icon.svg with the official vectors.
 */
export function Logo({
  variant = "lockup",
  className,
  height,
}: {
  variant?: "lockup" | "mark";
  className?: string;
  height?: number;
}) {
  const src =
    variant === "mark"
      ? "/brand/foodraksha-mark.svg"
      : "/brand/foodraksha-logo.svg";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="FoodRaksha"
      height={height}
      className={cn(variant === "mark" ? "block" : "block", className)}
      style={height ? { height } : undefined}
    />
  );
}
