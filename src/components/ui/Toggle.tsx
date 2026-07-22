"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface ToggleProps {
  /** Controlled value. Omit for uncontrolled use with `defaultChecked`. */
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Accessible name — required when no visible label is associated. */
  label?: string;
  /** id of the visible label element, when the row supplies one. */
  labelledBy?: string;
  className?: string;
}

/** iOS switch — 51×31 track, inside a 44px tap target. */
export function Toggle({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  label,
  labelledBy,
  className,
}: ToggleProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => {
        if (!isControlled) setInternal(!on);
        onCheckedChange?.(!on);
      }}
      className={cn(
        "flex min-h-11 shrink-0 cursor-pointer items-center justify-center",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    >
      <span
        className={cn(
          "relative block h-[31px] w-[51px] rounded-pill transition-colors duration-300",
          on ? "bg-ok" : "bg-surface-sunk",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 block size-[27px] rounded-full bg-white shadow-knob",
            "transition-transform duration-300 ease-ios",
            on && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
