import Link from "next/link";
import { Card } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[560px] px-6 py-16">
      <Card>
        <h1 className="text-title-2">Page not found</h1>
        <p className="mt-2 mb-5 text-body text-label-2">
          The page you were looking for doesn&rsquo;t exist, or you don&rsquo;t
          have access to it.
        </p>
        <Link href="/dashboard" className="font-semibold text-label underline">
          Go to your dashboard
        </Link>
      </Card>
    </main>
  );
}
