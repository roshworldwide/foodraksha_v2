import Link from "next/link";
import { Button, Card } from "@/components/ui";

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
        <Link href="/design-system">
          <Button variant="primary">Open design system</Button>
        </Link>
      </Card>
    </main>
  );
}
