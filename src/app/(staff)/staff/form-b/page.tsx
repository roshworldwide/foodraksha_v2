import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, type Column } from "@/components/staff/DataTable";
import { EmptyState, StaffPage } from "@/components/staff/StaffPage";
import { StatusPill } from "@/components/ui";
import { requireStaff } from "@/lib/auth/guards";
import { listForFiling, type LicenceRow } from "@/lib/staff/screens";
import { APP_STATUS } from "@/lib/status";

export const metadata: Metadata = {
  title: "Application Form B — FoodRaksha Staff",
};

export default async function FormBPage() {
  await requireStaff();
  const rows = await listForFiling();

  const columns: Column<LicenceRow>[] = [
    {
      header: "Application",
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
      header: "",
      className: "text-right",
      cell: (r) => (
        <Link
          href={`/staff/applications/${r.applicationId}/filing`}
          className="text-footnote font-semibold text-label underline"
        >
          Open filing workspace →
        </Link>
      ),
    },
  ];

  return (
    <StaffPage description="Applications ready to key into the FoSCoS portal. The filing workspace lays every field out in FoSCoS order with one-click copy, a completeness check and the attachment tray.">
      {rows.length === 0 ? (
        <EmptyState title="Nothing ready to file">
          Applications appear here once they are under review or approved for
          filing. Move one along from the pipeline or a client&rsquo;s
          slide-over.
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
