import type { ComponentPropsWithRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * The website's capsule button. Blue is the primary action, green the
 * conversion accent ("Book Now"), soft a neutral panel button, ghost an
 * outline. Presses scale to .965, matching the prototype.
 */
export type FrButtonVariant = "blue" | "green" | "soft" | "ghost";
export type FrButtonSize = "lg" | "base" | "sm";

const VARIANT: Record<FrButtonVariant, string> = {
  blue: "bg-fr-blue text-white hover:bg-fr-blue-deep",
  green: "bg-fr-green text-white hover:bg-fr-green-deep",
  soft: "bg-fr-blue-050 text-fr-blue-deep hover:bg-fr-blue-100",
  ghost: "bg-fr-sep/50 text-fr-ink hover:bg-fr-sep",
};

const SIZE: Record<FrButtonSize, string> = {
  lg: "min-h-[54px] px-[30px] text-[17px]",
  base: "min-h-[48px] px-6 text-[16px]",
  sm: "min-h-[38px] px-4 text-[14px]",
};

interface StyleProps {
  variant?: FrButtonVariant;
  size?: FrButtonSize;
  fullWidth?: boolean;
  className?: string;
}

function frButtonClass({
  variant = "blue",
  size = "base",
  fullWidth = false,
  className,
}: StyleProps): string {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill",
    "font-semibold tracking-[-0.012em] whitespace-nowrap",
    "transition-[scale,background-color,box-shadow] duration-200 ease-ios",
    "active:scale-[0.965]",
    "focus-visible:outline-none focus-visible:ring-[3.5px] focus-visible:ring-fr-blue/35",
    "disabled:pointer-events-none disabled:opacity-45",
    VARIANT[variant],
    SIZE[size],
    fullWidth && "flex w-full",
    className,
  );
}

export interface FrButtonProps
  extends ComponentPropsWithRef<"button">, StyleProps {}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: FrButtonProps) {
  return (
    <button
      className={frButtonClass({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}

export interface FrButtonLinkProps
  extends ComponentPropsWithRef<typeof Link>, StyleProps {}

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: FrButtonLinkProps) {
  return (
    <Link
      className={frButtonClass({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
