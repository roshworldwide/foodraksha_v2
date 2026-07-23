"use client";

import { Button, Card } from "@/components/ui";

/**
 * A route error boundary's UI. Says what happened in plain language and offers
 * the one useful action — try again — plus a way out. No stack traces, no
 * apologies, no jargon.
 */
export function ErrorState({
  reset,
  title = "Something went wrong",
  detail = "This part of the page didn't load. It's usually temporary.",
  homeHref = "/dashboard",
  homeLabel = "Go to dashboard",
}: {
  reset: () => void;
  title?: string;
  detail?: string;
  homeHref?: string;
  homeLabel?: string;
}) {
  return (
    <main className="mx-auto max-w-[560px] px-6 py-16">
      <Card className="border-l-[3px] border-stop">
        <h1 className="text-title-2">{title}</h1>
        <p className="mt-2 mb-5 text-body text-label-2">{detail}</p>
        <div className="flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <a href={homeHref}>
            <span className="inline-flex min-h-[50px] items-center rounded-pill bg-quiet px-[26px] text-[17px] font-semibold">
              {homeLabel}
            </span>
          </a>
        </div>
      </Card>
    </main>
  );
}
