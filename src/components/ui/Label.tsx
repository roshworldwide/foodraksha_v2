import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Label above the control — 13px/600, --label-2. Never placeholder-as-label. */
export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block pl-0.5 text-[13px] leading-none font-semibold tracking-[-0.004em] text-label-2",
        className,
      )}
      {...props}
    />
  );
}
