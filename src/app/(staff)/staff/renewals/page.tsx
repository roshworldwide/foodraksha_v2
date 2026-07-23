import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/staff/DataTable";
import { EmptyState, StaffPage } from "@/components/staff/StaffPage";
import { requireStaff } from "@/lib/auth/guards";
import { listLegacyRenewals, type LicenceRow } from "@/lib/staff/screens";

export const metadata: Metadata = {
  title: "Renewals (legacy licences) — FoodRaksha Staff",
};

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export default async function RenewalsPage() {
  await requireStaff();
  const rows = await listLegacyRenewals();

  const columns: Column<LicenceRow>[] = [
    {
      header: "Client",
      cell: (r) => (
        <>
          <div className="font-semibold">{r.customerName}</div>
          <div className="text-footnote text-label-2">{r.businessName}</div>
        </>
      ),
    },
    {
      header: "Licence no.",
      cell: (r) => r.licenceNo ?? "—",
      className: "text-label-2",
    },
    {
      header: "Expires",
      cell: (r) => (r.licenceExpiresAt ? DATE.format(r.licenceExpiresAt) : "—"),
      className: "text-label-2 whitespace-nowrap",
    },
  ];

  return (
    <StaffPage description="Legacy licences that still carry an expiry date.">
      {rows.length === 0 ? (
        <EmptyState title="No renewals — licences are now perpetual">
          On 1 April 2026 FSSAI moved to <strong>perpetual validity</strong>:
          registrations and licences no longer expire, so there are no renewals
          to chase. Only licences issued before that reform, with an expiry
          date, would appear here — there are none.
        </EmptyState>
      ) : (
        <>
          <p className="mb-4 rounded-input bg-white-titanium-lt px-4 py-3 text-footnote text-label-2">
            FSSAI moved to perpetual validity on 1 April 2026. These are legacy
            licences issued earlier that still carry an expiry.
          </p>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.applicationId}
          />
        </>
      )}
    </StaffPage>
  );
}
