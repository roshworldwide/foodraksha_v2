import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Content wrapper for every staff screen. The page title lives in the AppShell
 * top bar; this holds an optional description, actions, and the body.
 */
export function StaffPage({
  description,
  actions,
  wide,
  children,
}: {
  description?: ReactNode;
  actions?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto px-6 py-6",
        wide ? "max-w-[1440px]" : "max-w-[1180px]",
      )}
    >
      {(description || actions) && (
        <div className="mb-6 flex items-start justify-between gap-4">
          {description ? (
            <p className="max-w-[640px] text-body text-label-2">
              {description}
            </p>
          ) : (
            <span />
          )}
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/** An honest empty state: what this screen is for, and what to do next. */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-card border-[0.5px] border-separator bg-surface px-6 py-12 text-center shadow-1">
      <h2 className="text-title-3">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-[440px] text-body text-label-2">
        {children}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/**
 * A clearly-marked scaffold banner. Screens without a dedicated data source yet
 * carry one so nobody mistakes the layout for a finished, wired feature.
 */
export function ScaffoldBanner({ needs }: { needs: string }) {
  return (
    <div className="mb-6 rounded-input border-l-[3px] border-wait bg-wait-bg px-4 py-3 text-footnote text-wait">
      <span className="font-semibold">Scaffold.</span> The layout is real; the
      workflow behind it is not built yet — needs {needs}. No data is invented
      and the schema is unchanged.
    </div>
  );
}
