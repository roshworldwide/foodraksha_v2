"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Toggle } from "@/components/ui";

/**
 * Per-row controls on the Team page: an active/inactive toggle and a
 * password reset. Both are admin-only server-side; the page itself only
 * renders for admins.
 */
export function StaffRowActions({
  userId,
  name,
  isActive,
  isSelf,
}: {
  userId: string;
  name: string;
  isActive: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reset, setReset] = useState<{ password: string } | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  async function setActive(next: boolean) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/staff/team/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(body.error ?? "That change could not be saved.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/staff/team/${userId}/reset-password`,
        { method: "POST" },
      );
      const body = (await response.json().catch(() => ({}))) as {
        password?: string;
        error?: string;
      };
      if (!response.ok || !body.password) {
        setError(body.error ?? "That password could not be reset.");
        return;
      }
      setReset({ password: body.password });
      setConfirmingReset(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-3">
        <Toggle
          checked={isActive}
          disabled={busy || isSelf}
          label={`${name} active`}
          onCheckedChange={(next) => void setActive(next)}
        />
        {reset ? (
          <span className="text-footnote">
            New password:{" "}
            <span className="font-mono font-semibold">{reset.password}</span>
          </span>
        ) : confirmingReset ? (
          <>
            <Button
              size="xs"
              variant="quiet"
              disabled={busy}
              onClick={() => setConfirmingReset(false)}
            >
              Cancel
            </Button>
            <Button
              size="xs"
              disabled={busy}
              onClick={() => void resetPassword()}
            >
              {busy ? "Resetting…" : "Confirm"}
            </Button>
          </>
        ) : (
          <Button
            size="xs"
            variant="quiet"
            disabled={busy || !isActive}
            onClick={() => setConfirmingReset(true)}
          >
            Reset password
          </Button>
        )}
      </div>
      {error && (
        <span role="alert" className="text-footnote text-stop">
          {error}
        </span>
      )}
    </div>
  );
}
