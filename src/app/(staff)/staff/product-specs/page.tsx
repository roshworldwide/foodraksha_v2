import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/staff/DataTable";
import {
  EmptyState,
  ScaffoldBanner,
  StaffPage,
} from "@/components/staff/StaffPage";
import { requireStaff } from "@/lib/auth/guards";
import { listProductSpecs, type ProductSpecRow } from "@/lib/staff/screens";

export const metadata: Metadata = {
  title: "Product specification — FoodRaksha Staff",
};

export default async function ProductSpecsPage() {
  await requireStaff();
  const rows = await listProductSpecs();

  const columns: Column<ProductSpecRow>[] = [
    {
      header: "Client",
      cell: (r) => (
        <>
          <div className="font-semibold">{r.customerName}</div>
          <div className="text-footnote text-label-2">
            {r.categoryName} · {r.applicationNo}
          </div>
        </>
      ),
    },
    {
      header: "Food categories",
      cell: (r) => (
        <span className="flex flex-wrap gap-1.5">
          {r.foodCategories.map((food) => (
            <span
              key={food}
              className="rounded-pill bg-quiet px-2.5 py-1 text-[12px] text-label-2"
            >
              {food}
            </span>
          ))}
        </span>
      ),
    },
    {
      header: "Installed capacity",
      cell: (r) => r.installedCapacity ?? "—",
      className: "text-label-2",
    },
  ];

  return (
    <StaffPage description="The product and capacity detail captured on each application, read from the questionnaire answers.">
      {/* SCAFFOLD: needs a structured product-specification workflow (per-product
          labels, ingredients, shelf life). Today this is a read-only view of the
          food categories and capacity already in Application.data. */}
      <ScaffoldBanner needs="a structured product-specification model (labels, ingredients, shelf life)" />
      {rows.length === 0 ? (
        <EmptyState title="No product detail captured yet">
          Once applications record their food categories and capacity, they
          appear here. A fuller per-product specification is a later workflow.
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
