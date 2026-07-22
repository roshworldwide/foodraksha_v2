import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { controlClass } from "./Input";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(controlClass, "resize-y leading-[1.45]", className)}
      {...props}
    />
  );
}
