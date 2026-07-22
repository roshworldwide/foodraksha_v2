import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardTone = "surface" | "dark";

const TONE: Record<CardTone, string> = {
  surface: "bg-surface text-label",
  dark: "bg-graphite text-white",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
}

/** Never nest a card inside a card. */
export function Card({ tone = "surface", className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-card p-5 shadow-1", TONE[tone], className)}
      {...props}
    />
  );
}
