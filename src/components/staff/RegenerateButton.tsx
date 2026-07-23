"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

/** Regenerate an application's annexures (Form IX included). */
export function RegenerateButton({
  applicationId,
  label = "Generate",
}: {
  applicationId: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/staff/applications/${applicationId}/annexures`,
        { method: "POST" },
      );
      if (!response.ok) {
        const b = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(b.error ?? "Could not generate.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex items-center gap-2">
      <Button
        size="xs"
        variant="quiet"
        disabled={busy}
        onClick={() => void run()}
      >
        {busy ? "Generating…" : label}
      </Button>
      {error && <span className="text-footnote text-stop">{error}</span>}
    </span>
  );
}
