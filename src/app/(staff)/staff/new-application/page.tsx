import type { Metadata } from "next";
import {
  EmptyState,
  ScaffoldBanner,
  StaffPage,
} from "@/components/staff/StaffPage";
import { ButtonLink } from "@/components/ui";
import { requireStaff } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "New application — FoodRaksha Staff",
};

export default async function NewApplicationPage() {
  await requireStaff();

  return (
    <StaffPage description="Start an application for a walk-in customer.">
      {/* SCAFFOLD: needs a staff-fill wizard that creates the account and walks
          the questionnaire in one flow. Today staff create the account by
          converting a lead (or the customer signs up), then fill the
          questionnaire from the client's file. */}
      <ScaffoldBanner needs="a staff-fill wizard (create account + walk the questionnaire in one flow)" />
      <EmptyState
        title="Create an application for a walk-in"
        action={
          <div className="flex gap-3">
            <ButtonLink href="/staff/enquiries" variant="secondary">
              Convert an enquiry
            </ButtonLink>
            <ButtonLink href="/staff/leads">Work a lead</ButtonLink>
          </div>
        }
      >
        The account-creation logic already exists — the signup endpoint used by
        the website. For now, create the account by converting a lead or website
        enquiry, then fill their questionnaire from the client&rsquo;s file. A
        single staff-fill wizard is the next step.
      </EmptyState>
    </StaffPage>
  );
}
