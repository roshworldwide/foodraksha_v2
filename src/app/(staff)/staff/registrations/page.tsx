import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/staff/DataTable";
import { EmptyState, StaffPage } from "@/components/staff/StaffPage";
import { StatusPill } from "@/components/ui";
import { requireStaff } from "@/lib/auth/guards";
import { listBasicRegistrations, type LicenceRow } from "@/lib/staff/screens";
import { APP_STATUS } from "@/lib/status";

export const metadata: Metadata = {
  title: "FBO registration — FoodRaksha Staff",
};

export default async function RegistrationsPage() {
  await requireStaff();
  const rows = await listBasicRegistrations();

  const columns: Column<LicenceRow>[] = [
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
      header: "Registration no.",
      cell: (r) => r.licenceNo ?? "—",
      className: "text-label-2",
    },
  ];

  return (
    <StaffPage description="Basic Registration cases — turnover up to ₹1.5 crore. Since the 2026 reform these get instant registration with no pre-inspection.">
      {rows.length === 0 ? (
        <EmptyState title="No Basic Registration cases">
          Applications on the Basic Registration track appear here. None are on
          that track yet.
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.applicationId}
          rowHref={(r) => `/staff/applications/${r.applicationId}`}
        />
      )}
    </StaffPage>
  );
}
