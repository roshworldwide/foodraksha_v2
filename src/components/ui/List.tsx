import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/* ---------------------------------------------------------------- group */

export function ListGroup({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-[26px]", className)} {...props} />;
}

/** The one place ALL CAPS is allowed — 13px uppercase group headers. */
export function ListGroupHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-4 pb-2 text-[13px] font-semibold tracking-[0.05em] text-label-2 uppercase",
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------------------------------------- list */

/** iOS inset grouped list — white surface, 12px radius, hairline separators. */
export function List({
  className,
  ...props
}: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn(
        "overflow-hidden rounded-list bg-surface shadow-1",
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------------------------------------- icon */

export type ListIconTone = "done" | "current" | "pending" | "wait";

const ICON_TONE: Record<ListIconTone, string> = {
  done: "bg-ok",
  current: "bg-graphite",
  pending: "bg-nat-titanium",
  wait: "bg-wait",
};

export function ListIcon({
  tone = "pending",
  className,
  children,
}: {
  tone?: ListIconTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-[30px] shrink-0 items-center justify-center rounded-icon",
        "text-[14px] font-semibold text-white",
        ICON_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ row */

export interface ListRowProps {
  /** 30×30 leading icon slot. */
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Trailing control — toggle, pill, value. */
  trailing?: ReactNode;
  /** Trailing disclosure chevron. Implies the row navigates somewhere. */
  chevron?: boolean;
  /** 15px title instead of 17px — for dense contexts like the slide-over. */
  compact?: boolean;
  href?: string;
  /** Open the href in a new tab — for file downloads that must not replace the page. */
  external?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ListRow({
  icon,
  title,
  subtitle,
  trailing,
  chevron = false,
  compact = false,
  href,
  external = false,
  onClick,
  className,
}: ListRowProps) {
  const interactive = Boolean(href ?? onClick);

  const inner = (
    <>
      {icon}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block font-normal",
            compact
              ? "text-[15px] tracking-[-0.008em]"
              : "text-[17px] tracking-[-0.011em]",
          )}
        >
          {title}
        </span>
        {subtitle && (
          <span className="mt-0.5 block text-[13px] tracking-[-0.004em] text-label-2">
            {subtitle}
          </span>
        )}
      </span>
      {trailing}
      {chevron && (
        <span aria-hidden="true" className="shrink-0 text-[19px] text-label-3">
          ›
        </span>
      )}
    </>
  );

  const rowClass = cn(
    "flex w-full items-center gap-[13px] px-4 py-[13px] text-left min-h-[52px]",
    interactive &&
      "cursor-pointer transition-colors duration-150 hover:bg-row-hover",
    className,
  );

  return (
    <li className="border-b-[0.5px] border-separator last:border-b-0">
      {href && external ? (
        <a href={href} target="_blank" rel="noreferrer" className={rowClass}>
          {inner}
        </a>
      ) : href ? (
        <Link href={href} className={rowClass}>
          {inner}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className={rowClass}>
          {inner}
        </button>
      ) : (
        <div className={rowClass}>{inner}</div>
      )}
    </li>
  );
}
