import type { Metadata } from "next";
import { ConvertLeadButton } from "@/components/staff/ConvertLeadButton";
import { DataTable, type Column } from "@/components/staff/DataTable";
import { EmptyState, StaffPage } from "@/components/staff/StaffPage";
import { requireStaff } from "@/lib/auth/guards";
import { listLeads, type LeadRow } from "@/lib/staff/screens";

export const metadata: Metadata = {
  title: "Website enquiries — FoodRaksha Staff",
};

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

export default async function EnquiriesPage() {
  await requireStaff();
  // Website enquiries that have not yet been converted.
  const enquiries = await listLeads({ onlyWebsite: true, onlyOpen: true });

  const columns: Column<LeadRow>[] = [
    {
      header: "Enquiry",
      cell: (l) => (
        <>
          <div className="font-semibold">{l.name}</div>
          <div className="text-footnote text-label-2">
            {l.mobile}
            {l.email ? ` · ${l.email}` : ""}
          </div>
        </>
      ),
    },
    {
      header: "Business",
      cell: (l) => l.businessType ?? "—",
      className: "text-label-2",
    },
    { header: "City", cell: (l) => l.city ?? "—", className: "text-label-2" },
    {
      header: "Received",
      cell: (l) => DATE.format(l.createdAt),
      className: "text-label-2 whitespace-nowrap",
    },
    {
      header: "",
      cell: (l) => (
        <ConvertLeadButton leadId={l.id} label="Create account / application" />
      ),
      className: "text-right",
    },
  ];

  return (
    <StaffPage description="Fresh enquiries from the website, newest first. One click creates the customer's account and their draft application, and sends them their login.">
      {enquiries.length === 0 ? (
        <EmptyState title="No new enquiries">
          When someone submits the enquiry form on the website, it lands here
          for you to convert into an account. You are all caught up.
        </EmptyState>
      ) : (
        <DataTable columns={columns} rows={enquiries} rowKey={(l) => l.id} />
      )}
    </StaffPage>
  );
}
