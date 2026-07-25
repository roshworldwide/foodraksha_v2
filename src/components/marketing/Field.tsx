import type {
  ComponentPropsWithRef,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

/* Shared control shell: blue focus ring, hairline border, 12px radius. */
const control = cn(
  "w-full rounded-input border-[0.5px] border-fr-sep bg-fr-bg px-4 text-[16px] text-fr-ink",
  "min-h-[50px] transition-shadow duration-150 outline-none",
  "placeholder:text-fr-ink-3",
  "focus:border-fr-blue focus:ring-[3.5px] focus:ring-fr-blue/25",
  "disabled:opacity-50",
);

/** A labelled field wrapper — real <label>, hint and error slots. */
export function Field({
  htmlFor,
  label,
  hint,
  error,
  className,
  children,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[14px] font-semibold tracking-[-0.006em] text-fr-ink"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-[13px] text-fr-ink-2">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-[13px] font-medium text-fr-green-deep"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }: ComponentPropsWithRef<"input">) {
  return <input className={cn(control, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(control, "appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-fr-ink-3"
      >
        ▾
      </span>
    </div>
  );
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithRef<"textarea">) {
  return (
    <textarea
      className={cn(
        control,
        "min-h-[110px] resize-y py-3 leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
