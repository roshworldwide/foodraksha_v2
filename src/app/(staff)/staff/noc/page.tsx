import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/staff/DataTable";
import { EmptyState, StaffPage } from "@/components/staff/StaffPage";
import { StatusPill } from "@/components/ui";
import { requireStaff } from "@/lib/auth/guards";
import { listNocDocuments, type NocRow } from "@/lib/staff/screens";
import { DOC_STATUS } from "@/lib/status";

export const metadata: Metadata = {
  title: "NOC / address ownership — FoodRaksha Staff",
};

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});

export default async function NocPage() {
  await requireStaff();
  const rows = await listNocDocuments();

  const columns: Column<NocRow>[] = [
    {
      header: "Client",
      cell: (r) => (
        <>
          <div className="font-semibold">{r.customerName}</div>
          <div className="text-footnote text-label-2">{r.applicationNo}</div>
        </>
      ),
    },
    { header: "Document", cell: (r) => r.label },
    { header: "File", cell: (r) => r.fileName, className: "text-label-2" },
    {
      header: "Uploaded",
      cell: (r) => DATE.format(r.uploadedAt),
      className: "text-label-2 whitespace-nowrap",
    },
    {
      header: "Status",
      cell: (r) => (
        <StatusPill tone={DOC_STATUS[r.status].tone}>
          {DOC_STATUS[r.status].label}
        </StatusPill>
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (r) => (
        <a
          href={`/api/staff/documents/${r.documentId}/file`}
          target="_blank"
          rel="noreferrer"
          className="text-footnote font-semibold text-label underline"
        >
          Open
        </a>
      ),
    },
  ];

  return (
    <StaffPage description="Proof-of-premises and owner NOC documents. Approve or reject each from the client's slide-over; this is the review queue.">
      {rows.length === 0 ? (
        <EmptyState title="No premises documents yet">
          Proof of premises and owner NOCs uploaded by customers land here for
          review. None have been uploaded yet.
        </EmptyState>
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.documentId} />
      )}
    </StaffPage>
  );
}
