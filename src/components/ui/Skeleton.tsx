import { cn } from "@/lib/cn";

/**
 * A loading placeholder — a soft pulsing block, never a spinner. Compose these
 * into the shape of the content that is coming, so the layout does not jump.
 * Respects prefers-reduced-motion via the globals.css reduced-motion rule.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-[10px] bg-surface-sunk", className)}
    />
  );
}

/** A card-shaped skeleton, for list and detail screens. */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-card bg-surface p-5 shadow-1">
      <Skeleton className="mb-3 h-5 w-1/3" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn("h-4", index === lines - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}
