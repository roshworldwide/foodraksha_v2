"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

export default function GroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced server-side via instrumentation; this records the client view.
    console.error("[route-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <ErrorState reset={reset} homeHref="/staff" homeLabel="Back to desk" />
  );
}
