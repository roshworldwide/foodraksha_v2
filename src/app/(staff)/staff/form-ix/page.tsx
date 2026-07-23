import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/staff/DataTable";
import { EmptyState, StaffPage } from "@/components/staff/StaffPage";
import { RegenerateButton } from "@/components/staff/RegenerateButton";
import { StatusPill } from "@/components/ui";
import { requireStaff } from "@/lib/auth/guards";
import { listFormIx, type FormIxRow } from "@/lib/staff/screens";

export const metadata: Metadata = { title: "Form IX — FoodRaksha Staff" };

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});

export default async function FormIxPage() {
  await requireStaff();
  const rows = await listFormIx();

  const columns: Column<FormIxRow>[] = [
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
      header: "Constitution",
      cell: (r) => r.constitution ?? "—",
      className: "text-label-2",
    },
    {
      header: "Form IX",
      cell: (r) =>
        !r.eligible ? (
          <StatusPill tone="idle">Not applicable</StatusPill>
        ) : r.generatedAt ? (
          <StatusPill tone="ok">
            Generated {DATE.format(r.generatedAt)}
          </StatusPill>
        ) : (
          <StatusPill tone="wait">Not generated</StatusPill>
        ),
    },
    {
      header: "",
      className: "text-right",
      cell: (r) =>
        !r.eligible ? (
          <span className="text-footnote text-label-3">
            Proprietor — exempt
          </span>
        ) : (
          <span className="flex items-center justify-end gap-3">
            {r.generatedPdfId && (
              <a
                href={`/api/staff/annexures/${r.generatedPdfId}/file`}
                target="_blank"
                rel="noreferrer"
                className="text-footnote font-semibold text-label underline"
              >
                View
              </a>
            )}
            <RegenerateButton
              applicationId={r.applicationId}
              label={r.generatedAt ? "Regenerate" : "Generate"}
            />
          </span>
        ),
    },
  ];

  return (
    <StaffPage description="Form IX — Nomination of Persons under rule 2.5.1. Generated from the application data. It does not apply to a sole proprietor, so those rows are marked exempt.">
      {rows.length === 0 ? (
        <EmptyState title="No applications yet">
          Form IX is generated per application. Once there are applications,
          they appear here to generate, view and regenerate.
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
