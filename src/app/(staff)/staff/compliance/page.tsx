import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, type Column } from "@/components/staff/DataTable";
import { EmptyState, StaffPage } from "@/components/staff/StaffPage";
import { StatusPill } from "@/components/ui";
import { requireStaff } from "@/lib/auth/guards";
import { loadCompliance, type ComplianceRow } from "@/lib/staff/screens";
import { APP_STATUS } from "@/lib/status";

export const metadata: Metadata = { title: "Compliance — FoodRaksha Staff" };

export default async function CompliancePage() {
  await requireStaff();
  const rows = await loadCompliance();

  const columns: Column<ComplianceRow>[] = [
    {
      header: "Client",
      cell: (r) => (
        <>
          <div className="font-semibold">{r.customerName}</div>
          <div className="text-footnote text-label-2">
            {r.businessName} · {r.applicationNo}
          </div>
        </>
      ),
    },
    {
      header: "Status",
      cell: (r) => (
        <StatusPill tone={APP_STATUS[r.status].tone}>
          {APP_STATUS[r.status].label}
        </StatusPill>
      ),
    },
    {
      header: "Outstanding",
      cell: (r) => (
        <span className="flex flex-wrap gap-1.5">
          {r.openQueries > 0 && (
            <StatusPill tone="stop">
              {r.openQueries} open query{r.openQueries === 1 ? "" : "ies"}
            </StatusPill>
          )}
          {r.rejectedDocuments > 0 && (
            <StatusPill tone="stop">
              {r.rejectedDocuments} rejected doc
              {r.rejectedDocuments === 1 ? "" : "s"}
            </StatusPill>
          )}
          {r.pendingDocuments > 0 && (
            <StatusPill tone="wait">{r.pendingDocuments} to review</StatusPill>
          )}
        </span>
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (r) => (
        <Link
          href={`/staff/clients?q=${r.applicationNo}`}
          className="text-footnote font-semibold text-label underline"
        >
          Open client →
        </Link>
      ),
    },
  ];

  return (
    <StaffPage description="A read-only roll-up of what is outstanding across live applications — open queries, rejected documents, and documents waiting to be reviewed.">
      {rows.length === 0 ? (
        <EmptyState title="Everything is clear">
          No open queries, rejected documents or pending reviews across any live
          application. Nothing needs chasing right now.
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.applicationId}
        />
      )}
    </StaffPage>
  );
}
