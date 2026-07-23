import type { ComponentPropsWithRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "onDark";
export type ButtonSize = "lg" | "sm" | "xs";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-graphite text-white hover:opacity-[0.86]",
  secondary: "bg-nat-titanium text-label hover:bg-nat-titanium-mid",
  quiet: "bg-quiet text-label hover:bg-quiet-hover",
  // The white button that sits on the dark progress card. A dedicated variant,
  // not a className override — cn() does not tailwind-merge, so overriding a
  // variant's colour leaves both classes on the element and the wrong one wins.
  onDark: "bg-white text-graphite hover:opacity-90",
};

const SIZE: Record<ButtonSize, string> = {
  lg: "min-h-[50px] px-[26px] text-[17px]",
  sm: "min-h-[36px] px-4 text-[14px]",
  xs: "min-h-[30px] px-[13px] text-[13px]",
};

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the width of the container. */
  fullWidth?: boolean;
}

/** Shared by Button and ButtonLink so the two can never drift apart. */
export function buttonClass({
  variant = "primary",
  size = "lg",
  fullWidth = false,
  className,
}: ButtonStyleProps & { className?: string }): string {
  return cn(
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
  );
}

export interface ButtonProps
  extends ComponentPropsWithRef<"button">, ButtonStyleProps {}

/**
 * Capsule button — 980px radius, scale(.965) on press.
 * One primary button per screen; everything else is secondary or quiet.
 */
export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}

export interface ButtonLinkProps
  extends ComponentPropsWithRef<typeof Link>, ButtonStyleProps {}

/** A link that looks like a button. Never nest a Button inside a Link. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClass({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
