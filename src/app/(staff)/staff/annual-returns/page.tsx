import type { Metadata } from "next";
import {
  EmptyState,
  ScaffoldBanner,
  StaffPage,
} from "@/components/staff/StaffPage";
import { requireStaff } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Annual return information — FoodRaksha Staff",
};

export default async function AnnualReturnInformationPage() {
  await requireStaff();

  // SCAFFOLD: needs the annual-return (Form D1) obligation workflow. Whether
  // Form D1 still applies after the 2026 reform must be confirmed with the
  // client before real logic is built; the schema is unchanged.
  return (
    <StaffPage description="Form D1 annual-return obligations per client — who owes a return and by when.">
      <ScaffoldBanner needs="the Form D1 obligation workflow — and confirmation from the client that D1 still applies post-reform" />
      <EmptyState title="Annual returns — pending client confirmation">
        Manufacturers and importers file Form D1 each year. Whether this
        survives the April 2026 reform needs confirming with the client before
        we wire the real obligation tracking, so this screen is scaffolded, not
        live.
      </EmptyState>
    </StaffPage>
  );
}
