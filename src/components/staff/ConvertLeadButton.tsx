"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

/**
 * Converts a lead to an account + application. On success it shows the issued
 * credentials once (the customer is also emailed/texted them) and refreshes.
 */
export function ConvertLeadButton({
  leadId,
  label = "Create account",
}: {
  leadId: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ applicationNo: string } | null>(null);

  async function convert() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/staff/leads/${leadId}/convert`, {
        method: "POST",
      });
      const body = (await response.json().catch(() => ({}))) as {
        applicationNo?: string;
        error?: string;
      };
      if (!response.ok) {
        setError(body.error ?? "Could not convert this lead.");
        return;
      }
      setDone({ applicationNo: body.applicationNo ?? "" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <span className="text-footnote text-ok">
        Created {done.applicationNo}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <Button
        size="xs"
        variant="secondary"
        disabled={busy}
        onClick={() => void convert()}
      >
        {busy ? "Creating…" : label}
      </Button>
      {error && <span className="text-footnote text-stop">{error}</span>}
    </span>
  );
}
