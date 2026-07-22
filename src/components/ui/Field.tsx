import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Label } from "./Label";

export interface FieldProps {
  /** Must match the control's `id`. Every input has a real label. */
  htmlFor: string;
  label: string;
  hint?: string;
  /** Announced to screen readers and named after the field. */
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({
  htmlFor,
  label,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("mb-[18px]", className)}>
      <Label htmlFor={htmlFor} className="mb-[7px]">
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p
          id={`${htmlFor}-hint`}
          className="mt-[7px] pl-0.5 text-footnote text-label-2"
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-[7px] pl-0.5 text-footnote font-medium text-stop"
        >
          {label}: {error}
        </p>
      )}
    </div>
  );
}
