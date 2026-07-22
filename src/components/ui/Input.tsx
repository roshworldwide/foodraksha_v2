import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Shared control styling for Input, Select and Textarea.
 * 17px prevents iOS zoom-on-focus — do not shrink it.
 */
export const controlClass = cn(
  "w-full rounded-input border-[0.5px] border-separator bg-surface",
  "px-4 py-[14px] text-[17px] tracking-[-0.011em] text-label",
  "transition-[border-color,box-shadow] duration-200",
  "outline-none focus:border-nat-titanium-deep focus:shadow-focus",
  "disabled:opacity-50",
  "aria-[invalid=true]:border-stop aria-[invalid=true]:focus:border-stop",
);

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(controlClass, className)} {...props} />;
}
