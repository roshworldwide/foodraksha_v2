import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { controlClass } from "./Input";

const CHEVRON =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8'><path d='M1 1l5 5 5-5' stroke='%236E6960' stroke-width='1.8' fill='none' stroke-linecap='round'/></svg>\")";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        controlClass,
        "appearance-none bg-no-repeat pr-11",
        className,
      )}
      style={{
        backgroundImage: CHEVRON,
        backgroundPosition: "right 16px center",
      }}
      {...props}
    >
      {children}
    </select>
  );
}
