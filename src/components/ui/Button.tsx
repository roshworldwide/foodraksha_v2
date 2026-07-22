import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "quiet";
export type ButtonSize = "lg" | "sm" | "xs";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-graphite text-white hover:opacity-[0.86]",
  secondary: "bg-nat-titanium text-label hover:bg-nat-titanium-mid",
  quiet: "bg-quiet text-label hover:bg-quiet-hover",
};

const SIZE: Record<ButtonSize, string> = {
  lg: "min-h-[50px] px-[26px] text-[17px]",
  sm: "min-h-[36px] px-4 text-[14px]",
  xs: "min-h-[30px] px-[13px] text-[13px]",
};

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the width of the container. */
  fullWidth?: boolean;
}

/**
 * Capsule button — 980px radius, scale(.965) on press.
 * One primary button per screen; everything else is secondary or quiet.
 */
export function Button({
  variant = "primary",
  size = "lg",
  fullWidth = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill",
        "font-semibold tracking-[-0.012em] whitespace-nowrap",
        // Tailwind's scale utility sets the `scale` property, not `transform`.
        "transition-[scale,opacity,background-color] duration-200 ease-ios",
        "active:scale-[0.965]",
        "disabled:pointer-events-none disabled:opacity-40",
        VARIANT[variant],
        SIZE[size],
        fullWidth && "flex w-full",
        className,
      )}
      {...props}
    />
  );
}
