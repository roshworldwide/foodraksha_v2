import { cn } from "@/lib/cn";

export interface ProgressProps {
  /** 0–100. */
  value: number;
  /** 4px track instead of 7px. */
  thin?: boolean;
  /** Accessible name, e.g. "Sections complete". */
  label: string;
  className?: string;
}

export function Progress({
  value,
  thin = false,
  label,
  className,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "overflow-hidden rounded-pill bg-surface-sunk",
        thin ? "h-1" : "h-[7px]",
        className,
      )}
    >
      <span
        className="block h-full rounded-pill bg-graphite transition-[width] duration-500 ease-ios"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
