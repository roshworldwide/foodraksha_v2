import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  List,
  ListGroup,
  ListGroupHeader,
  ListRow,
} from "@/components/ui";
import { requireCustomer } from "@/lib/auth/guards";
import { ChangePassword } from "./ChangePassword";
import { DeleteAccount } from "./DeleteAccount";

export const metadata: Metadata = {
  title: "Your profile — FoodRaksha",
};

export default async function ProfilePage() {
  const session = await requireCustomer();
  const { name, mobile, email } = session.user;

  return (
    <main className="mx-auto max-w-[720px] px-6 py-10">
      <h1 className="text-large-title">Your profile</h1>
      <p className="mt-2 mb-8 text-body text-label-2">
        Signed in as {email ?? mobile}.
      </p>

      {/* ── Contact details */}
      <ListGroup>
        <ListGroupHeader>Contact details</ListGroupHeader>
        <List>
          <ListRow title="Name" trailing={<Value>{name}</Value>} />
          <ListRow title="Mobile" trailing={<Value>{mobile}</Value>} />
          <ListRow
            title="Email"
            trailing={<Value>{email ?? "Not added"}</Value>}
          />
        </List>
        <p className="mt-2 px-4 text-footnote text-label-2">
          Need to correct a detail? Email{" "}
          <a
            href="mailto:support@foodraksha.in"
            className="font-semibold text-label underline"
          >
            support@foodraksha.in
          </a>{" "}
          — your agent will update it for you.
        </p>
      </ListGroup>

      {/* ── Change password */}
      <ListGroup>
        <ListGroupHeader>Security</ListGroupHeader>
        <ChangePassword />
      </ListGroup>

      {/* ── DPDP data & deletion */}
      <ListGroup className="mb-0">
        <ListGroupHeader>Your data</ListGroupHeader>
        <Card className="mb-6">
          <p className="text-body text-label-2">
            We hold the details you gave us only to prepare and file your FSSAI
            application. Read how we handle it in our{" "}
            <Link
              href="/privacy"
              className="font-semibold text-label underline"
            >
              privacy policy
            </Link>
            .
          </p>
        </Card>

        <Card className="border-l-[3px] border-stop">
          <h2 className="text-title-3">Delete your account</h2>
          <p className="mt-1.5 mb-5 text-body text-label-2">
            Under the DPDP Act 2023 you can ask us to erase your personal data.
            We will remove your account, your application and every document you
            uploaded. This cannot be undone.
          </p>
          <DeleteAccount />
        </Card>
      </ListGroup>
    </main>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return <span className="text-body text-label-2">{children}</span>;
}
