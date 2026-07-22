import { ButtonLink, Card } from "@/components/ui";

export default function Home() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-14">
      <h1 className="text-large-title">FoodRaksha</h1>
      <p className="mt-2 text-body text-label-2">
        FSSAI licensing platform. The CRM is under construction.
      </p>

      <Card className="mt-8">
        <h2 className="text-title-3">Design system</h2>
        <p className="mt-1.5 mb-5 text-subhead text-label-2">
          Every primitive in every state, to compare against the approved
          prototype.
        </p>
        <ButtonLink href="/design-system">Open design system</ButtonLink>
      </Card>

      <Card className="mt-[18px]">
        <h2 className="text-title-3">Create an account</h2>
        <p className="mt-1.5 mb-5 text-subhead text-label-2">
          Temporary internal caller for POST /api/public/signup. The marketing
          website replaces this page in phase 2.
        </p>
        <ButtonLink href="/get-started" variant="secondary">
          Open get started
        </ButtonLink>
      </Card>
    </main>
  );
}
