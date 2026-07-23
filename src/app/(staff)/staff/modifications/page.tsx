import type { Metadata } from "next";
import {
  EmptyState,
  ScaffoldBanner,
  StaffPage,
} from "@/components/staff/StaffPage";
import { requireStaff } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Modifications — FoodRaksha Staff",
};

export default async function ModificationsPage() {
  await requireStaff();

  // SCAFFOLD: needs a "modification" flag on Application (or a Modification
  // model) to mark and track licence-modification cases. The schema is
  // deliberately unchanged, so there is nothing to list yet.
  return (
    <StaffPage description="Licence modification requests — changes to an issued licence (address, category, capacity).">
      <ScaffoldBanner needs="a modification flag on Application (or a Modification model) and a change workflow" />
      <EmptyState title="No modification cases">
        A modification is a change to an already-issued licence. Tracking these
        needs a way to flag an application as a modification, which the schema
        does not have yet — so nothing is listed here rather than inventing it.
      </EmptyState>
    </StaffPage>
  );
}
