import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StatusTone = "ok" | "wait" | "stop" | "idle";

const TONE: Record<StatusTone, string> = {
  ok: "bg-ok-bg text-ok",
  wait: "bg-wait-bg text-wait",
  stop: "bg-stop-bg text-stop",
  idle: "bg-idle-bg text-idle",
};

export interface StatusPillProps {
  tone: StatusTone;
  /** Required — a pill never carries meaning by colour alone. */
  children: ReactNode;
  className?: string;
}

export function StatusPill({ tone, children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-pill px-[11px] py-[5px]",
        "text-[12px] font-semibold tracking-[-0.002em] whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-current"
      />
      {children}
    </span>
  );
}
