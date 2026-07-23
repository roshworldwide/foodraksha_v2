import type { Metadata } from "next";
import {
  EmptyState,
  ScaffoldBanner,
  StaffPage,
} from "@/components/staff/StaffPage";
import { requireStaff } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Annual return submission — FoodRaksha Staff",
};

export default async function AnnualReturnSubmissionPage() {
  await requireStaff();

  // SCAFFOLD: needs a Return/Submission model to track filed vs pending annual
  // returns. Gated behind the same client confirmation as the information view.
  return (
    <StaffPage description="Track filed and pending annual returns per client.">
      <ScaffoldBanner needs="a return-submission record (filed / pending) — same client confirmation as the information view" />
      <EmptyState title="No annual-return submissions tracked">
        Once the annual-return workflow is confirmed and built, filed and
        pending returns are tracked here. Nothing is recorded yet.
      </EmptyState>
    </StaffPage>
  );
}
