"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Progress, StatusPill } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  DESK_FILTERS,
  FILTER_LABELS,
  SORT_KEYS,
  type DeskFilter,
  type SortDirection,
  type SortKey,
} from "@/lib/staff/desk";
import { CustomerSlideOver } from "./CustomerSlideOver";
import type { DeskRowView } from "./types";

const SEARCH_DEBOUNCE_MS = 300;

export interface StaffDeskProps {
  rows: DeskRowView[];
  counts: Record<DeskFilter, number>;
  total: number;
  page: number;
  pageCount: number;
  search: string;
  filter: DeskFilter;
  sort: SortKey;
  direction: SortDirection;
}

const COLUMNS: { key: SortKey | null; label: string; className?: string }[] = [
  { key: "customer", label: "Customer" },
  { key: "business_type", label: "Business Type" },
  { key: "licence", label: "Licence" },
  { key: null, label: "Progress" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" },
];

export function StaffDesk({
  rows,
  counts,
  total,
  page,
  pageCount,
  search,
  filter,
  sort,
  direction,
}: StaffDeskProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [term, setTerm] = useState(search);
  const [openId, setOpenId] = useState<string | null>(null);
  const debounce = useRef<number | null>(null);

  /**
   * Every list control lives in the URL, and the slide-over does not. Opening
   * and closing a customer therefore cannot disturb the search, the chip, the
   * page, the sort or the scroll position.
   */
  function navigate(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  useEffect(() => {
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, []);

  function onSearchChange(value: string) {
    setTerm(value);
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      navigate({ q: value, page: null });
    }, SEARCH_DEBOUNCE_MS);
  }

  function toggleSort(key: SortKey) {
    const nextDirection: SortDirection =
      sort === key && direction === "desc" ? "asc" : "desc";
    navigate({ sort: key, dir: nextDirection, page: null });
  }

  return (
    <>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-card bg-surface shadow-2">
        {/* ── toolbar */}
        <div className="flex shrink-0 flex-wrap items-center gap-4 px-6 py-3.5">
          <input
            value={term}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, mobile, business or application number"
            aria-label="Search customers"
            className="min-w-[210px] flex-1 rounded-pill border-[0.5px] border-separator bg-white-titanium-lt px-4 py-2.5 text-[15px] outline-none focus:border-nat-titanium-deep"
          />
          <span className="text-footnote text-label-2">
            {total} application{total === 1 ? "" : "s"}
          </span>
        </div>

        {/* ── filter chips, sticky above the header */}
        <div className="sticky top-0 z-20 flex shrink-0 flex-wrap gap-[7px] border-y-[0.5px] border-separator bg-surface px-6 py-2.5">
          {DESK_FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => navigate({ filter: key, page: null })}
              aria-pressed={filter === key}
              className={cn(
                "cursor-pointer rounded-pill border-[0.5px] px-3.5 py-[7px] text-footnote whitespace-nowrap transition-all",
                filter === key
                  ? "border-graphite bg-graphite font-semibold text-white"
                  : "border-separator bg-surface font-medium text-label-2 hover:bg-white-titanium",
              )}
            >
              {FILTER_LABELS[key]}
              <b className="ml-[3px] font-bold">{counts[key]}</b>
            </button>
          ))}
        </div>

        {/* ── the table itself scrolls, so ~15 rows sit under a fixed header */}
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {COLUMNS.map((column) => {
                  const active = column.key && sort === column.key;
                  return (
                    <th
                      key={column.label}
                      scope="col"
                      aria-sort={
                        active
                          ? direction === "asc"
                            ? "ascending"
                            : "descending"
                          : undefined
                      }
                      className="sticky top-0 z-10 border-b-[0.5px] border-separator bg-white-titanium-lt px-6 py-[11px] text-left text-[11px] font-semibold tracking-[0.055em] text-label-2 uppercase"
                    >
                      {column.key ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key as SortKey)}
                          className="cursor-pointer tracking-[0.055em] uppercase hover:text-label"
                        >
                          {column.label}
                          <span aria-hidden="true" className="ml-1">
                            {active ? (direction === "asc" ? "↑" : "↓") : ""}
                          </span>
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.applicationId}
                  onClick={(event) => {
                    // Focus the row first: the slide-over restores focus to
                    // whatever was active when it opened.
                    event.currentTarget.focus();
                    setOpenId(row.applicationId);
                  }}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setOpenId(row.applicationId);
                    }
                  }}
                  aria-label={`Open ${row.customerName}`}
                  className={cn(
                    "h-[56px] cursor-pointer transition-colors",
                    openId === row.applicationId
                      ? "bg-white-titanium"
                      : "hover:bg-white-titanium-lt",
                  )}
                >
                  <td className="border-b-[0.5px] border-separator px-6 py-3 text-[14px] tracking-[-0.006em]">
                    <div className="text-[14px] font-semibold">
                      {row.customerName}
                    </div>
                    <div className="mt-0.5 text-[12px] text-label-2">
                      {row.businessName}
                    </div>
                  </td>
                  <td className="border-b-[0.5px] border-separator px-6 py-3 text-[14px] tracking-[-0.006em] text-label-2">
                    {row.categoryName}
                  </td>
                  <td className="border-b-[0.5px] border-separator px-6 py-3 text-[14px] tracking-[-0.006em] text-label-2">
                    {row.licenceLabel}
                  </td>
                  <td className="border-b-[0.5px] border-separator px-6 py-3">
                    <div className="flex min-w-[112px] items-center gap-2">
                      <Progress
                        value={row.percent}
                        thin
                        label={`${row.applicationNo} progress`}
                        className="h-[5px] flex-1"
                      />
                      <span className="w-[34px] text-right text-[11px] font-semibold text-label-2">
                        {row.percent}%
                      </span>
                    </div>
                  </td>
                  <td className="border-b-[0.5px] border-separator px-6 py-3">
                    <StatusPill tone={row.statusTone}>
                      {row.statusLabel}
                    </StatusPill>
                  </td>
                  <td className="border-b-[0.5px] border-separator px-6 py-3 text-[14px] tracking-[-0.006em] whitespace-nowrap text-label-2">
                    {row.updatedLabel}
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-6 py-14">
                    <p className="text-center text-body text-label-2">
                      Nothing matches that. Clear the search, or pick a
                      different filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── pagination */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-t-[0.5px] border-separator px-6 py-2.5">
          <span className="text-footnote text-label-2">
            Page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              variant="quiet"
              size="sm"
              disabled={page <= 1}
              onClick={() => navigate({ page: String(page - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="quiet"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => navigate({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <CustomerSlideOver
        applicationId={openId}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}

export { SORT_KEYS };
