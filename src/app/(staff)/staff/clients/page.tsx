import type { Metadata } from "next";
import { StaffDesk } from "@/components/staff/StaffDesk";
import type { DeskRowView } from "@/components/staff/types";
import { requireStaff } from "@/lib/auth/guards";
import {
  deskCounts,
  listApplications,
  parseDeskQuery,
  type DeskRow,
} from "@/lib/staff/desk";
import { APP_STATUS, LICENCE_TYPE } from "@/lib/status";

export const metadata: Metadata = {
  title: "Clients / FBOs — FoodRaksha Staff",
};

function timeAgo(date: Date): string {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days}d ago` : `${Math.round(days / 30)}mo ago`;
}

function toView(row: DeskRow): DeskRowView {
  // Someone who has never signed in reads as exactly that, whatever the
  // application status says — it is the state staff act on.
  const neverSignedIn = row.lastLoginAt === null;
  const status = APP_STATUS[row.status];

  return {
    applicationId: row.applicationId,
    applicationNo: row.applicationNo,
    customerName: row.customerName,
    businessName: row.businessName,
    categoryName: row.categoryName,
    licenceLabel: LICENCE_TYPE[row.licenceType].replace(
      /\s*(Licence|Registration)$/,
      "",
    ),
    percent:
      row.totalSections > 0
        ? Math.round((row.completedSections / row.totalSections) * 100)
        : 0,
    statusLabel: neverSignedIn ? "Not logged in" : status.label,
    statusTone: neverSignedIn ? "idle" : status.tone,
    updatedLabel: timeAgo(row.updatedAt),
  };
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaff();

  const params = await searchParams;
  const single = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const query = parseDeskQuery({
    q: single("q"),
    filter: single("filter"),
    sort: single("sort"),
    dir: single("dir"),
    page: single("page"),
  });

  const [page, counts] = await Promise.all([
    listApplications(query),
    deskCounts(query.search),
  ]);

  return (
    <main className="mx-auto flex h-[calc(100vh-65px)] max-w-[1440px] flex-col px-6 py-4">
      <StaffDesk
        rows={page.rows.map(toView)}
        counts={counts}
        total={page.total}
        page={page.page}
        pageCount={page.pageCount}
        search={query.search}
        filter={query.filter}
        sort={query.sort}
        direction={query.direction}
      />
    </main>
  );
}
