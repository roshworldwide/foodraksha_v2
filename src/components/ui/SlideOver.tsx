"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Header content under the title — status pills, IDs. */
  meta?: ReactNode;
  /** Pinned action bar. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Right-anchored panel, 560px. The list underneath stays mounted, so its
 * scroll position and filter state survive open/close.
 */
export function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  meta,
  footer,
  children,
}: SlideOverProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  // Capture the trigger on open, hand focus back to it on close.
  useEffect(() => {
    if (open && !wasOpen.current) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      closeRef.current?.focus();
    } else if (!open && wasOpen.current) {
      triggerRef.current?.focus();
      triggerRef.current = null;
    }
    wasOpen.current = open;
  }, [open]);

  // Lock page scroll without unmounting the list beneath.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[200] bg-black/[0.26] backdrop-blur-[3px]",
          "transition-opacity duration-350",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open}
        onKeyDown={onKeyDown}
        className={cn(
          "fixed inset-y-0 right-0 z-[201] flex w-[min(560px,94vw)] flex-col",
          "bg-white-titanium shadow-over",
          "transition-transform duration-450 ease-ios",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="border-b-[0.5px] border-separator bg-surface px-6 pt-5 pb-4">
          <div
            aria-hidden="true"
            className="mx-auto mb-[14px] h-[5px] w-9 rounded-[3px] bg-label-3"
          />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-title-2">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-[3px] text-subhead text-label-2">{subtitle}</p>
              )}
            </div>
            <Button ref={closeRef} variant="quiet" size="xs" onClick={onClose}>
              Close
            </Button>
          </div>
          {meta && <div className="mt-[14px] flex flex-wrap gap-2">{meta}</div>}
        </header>

        <div className="flex-1 overflow-y-auto px-6 pt-[22px] pb-10">
          {children}
        </div>

        {footer && (
          <footer className="flex gap-[10px] border-t-[0.5px] border-separator bg-surface px-6 py-4">
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
}
