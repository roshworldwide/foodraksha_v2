import type { Metadata } from "next";
import { ConvertLeadButton } from "@/components/staff/ConvertLeadButton";
import { DataTable, type Column } from "@/components/staff/DataTable";
import { EmptyState, StaffPage } from "@/components/staff/StaffPage";
import { StatusPill } from "@/components/ui";
import { requireStaff } from "@/lib/auth/guards";
import { listLeads, type LeadRow } from "@/lib/staff/screens";

export const metadata: Metadata = { title: "Leads — FoodRaksha Staff" };

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});

export default async function LeadsPage() {
  await requireStaff();
  const leads = await listLeads();

  const columns: Column<LeadRow>[] = [
    {
      header: "Name",
      cell: (l) => (
        <>
          <div className="font-semibold">{l.name}</div>
          <div className="text-footnote text-label-2">{l.mobile}</div>
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
      header: "Source",
      cell: (l) => (
        <span className="capitalize text-label-2">{l.source ?? "—"}</span>
      ),
    },
    {
      header: "Added",
      cell: (l) => DATE.format(l.createdAt),
      className: "text-label-2 whitespace-nowrap",
    },
    {
      header: "Status",
      cell: (l) =>
        l.converted ? (
          <StatusPill tone="ok">Converted</StatusPill>
        ) : (
          <ConvertLeadButton leadId={l.id} />
        ),
    },
  ];

  return (
    <StaffPage description="Everyone who has raised their hand. Convert a lead to create their account and a draft application.">
      {leads.length === 0 ? (
        <EmptyState title="No leads yet">
          Leads arrive from the website enquiry form and from staff adding them
          manually. When one comes in, it appears here to be worked.
        </EmptyState>
      ) : (
        <DataTable columns={columns} rows={leads} rowKey={(l) => l.id} />
      )}
    </StaffPage>
  );
}
