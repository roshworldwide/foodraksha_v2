import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

/**
 * A dense staff table in the design-system style: sticky header, 0.5px
 * separators, hover, optional row link. Kept deliberately simple — the
 * feature-rich desk lives in StaffDesk; this is for the lighter list screens.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowHref,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowHref?: (row: T) => string | undefined;
}) {
  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-1">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={cn(
                    "border-b-[0.5px] border-separator bg-white-titanium-lt px-5 py-[11px] text-left text-[11px] font-semibold tracking-[0.055em] text-label-2 uppercase whitespace-nowrap",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const href = rowHref?.(row);
              const cells = columns.map((column, index) => (
                <td
                  key={index}
                  className={cn(
                    "border-b-[0.5px] border-separator px-5 py-3 text-[14px] tracking-[-0.006em] align-middle",
                    column.className,
                  )}
                >
                  {column.cell(row)}
                </td>
              ));
              return href ? (
                <tr
                  key={rowKey(row)}
                  className="cursor-pointer transition-colors hover:bg-white-titanium-lt"
                >
                  {columns.map((column, index) => (
                    <td
                      key={index}
                      className={cn(
                        "border-b-[0.5px] border-separator p-0 align-middle",
                        column.className,
                      )}
                    >
                      <Link
                        href={href}
                        className="block px-5 py-3 text-[14px] tracking-[-0.006em]"
                      >
                        {column.cell(row)}
                      </Link>
                    </td>
                  ))}
                </tr>
              ) : (
                <tr key={rowKey(row)} className="hover:bg-white-titanium-lt">
                  {cells}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
