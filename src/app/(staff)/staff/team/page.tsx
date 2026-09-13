import type { Metadata } from "next";
import { AddStaffForm } from "@/components/staff/AddStaffForm";
import { DataTable, type Column } from "@/components/staff/DataTable";
import { StaffPage } from "@/components/staff/StaffPage";
import { StaffRowActions } from "@/components/staff/StaffRowActions";
import { StatusPill } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { listStaff, type StaffRow } from "@/lib/staff/team";

export const metadata: Metadata = { title: "Team — FoodRaksha Staff" };

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/** Admin-only: who can sign in to the CRM, and adding or removing people. */
export default async function TeamPage() {
  const session = await requireAdmin();
  const staff = await listStaff();

  const columns: Column<StaffRow>[] = [
    {
      header: "Name",
      cell: (u) => (
        <>
          <div className="font-semibold">
            {u.name}
            {u.id === session.user.id && (
              <span className="ml-1.5 text-footnote font-normal text-label-2">
                (you)
              </span>
            )}
          </div>
          <div className="text-footnote text-label-2">{u.email ?? u.mobile}</div>
        </>
      ),
    },
    { header: "Mobile", cell: (u) => u.mobile, className: "text-label-2" },
    {
      header: "Role",
      cell: (u) => (u.role === "ADMIN" ? "Administrator" : "Staff"),
      className: "text-label-2",
    },
    {
      header: "Last sign-in",
      cell: (u) => (u.lastLoginAt ? DATE.format(u.lastLoginAt) : "Never"),
      className: "text-label-2 whitespace-nowrap",
    },
    {
      header: "Status",
      cell: (u) =>
        u.isActive ? (
          <StatusPill tone="ok">Active</StatusPill>
        ) : (
          <StatusPill tone="idle">Deactivated</StatusPill>
        ),
    },
    {
      header: "",
      cell: (u) => (
        <StaffRowActions
          userId={u.id}
          name={u.name}
          isActive={u.isActive}
          isSelf={u.id === session.user.id}
        />
      ),
      className: "text-right",
    },
  ];

  return (
    <StaffPage description="Everyone who can sign in to the CRM. Deactivating someone signs them out everywhere immediately; their history stays on every file they touched.">
      <div className="mb-6">
        <AddStaffForm />
      </div>
      <DataTable columns={columns} rows={staff} rowKey={(u) => u.id} />
    </StaffPage>
  );
}
