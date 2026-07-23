"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AppStatus } from "@prisma/client";
import { StatusPill } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PipelineCard } from "@/lib/staff/screens";
import { APP_STATUS } from "@/lib/status";

/**
 * The licensing pipeline as a board. Drag a card to another column to change
 * its status; the move calls the status endpoint, which validates the
 * transition through the state machine and writes a StatusEvent. An illegal
 * move (e.g. Draft → Issued) is refused and the card snaps back.
 */
export function PipelineBoard({
  order,
  board,
}: {
  order: AppStatus[];
  board: Record<AppStatus, PipelineCard[]>;
}) {
  const router = useRouter();
  const [columns, setColumns] = useState(board);
  const [dragOver, setDragOver] = useState<AppStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function move(card: PipelineCard, to: AppStatus) {
    if (card.status === to || busy) return;
    setBusy(true);
    setError(null);

    // Optimistic move.
    const from = card.status;
    setColumns((prev) => {
      const next = { ...prev };
      next[from] = next[from].filter(
        (c) => c.applicationId !== card.applicationId,
      );
      next[to] = [{ ...card, status: to }, ...next[to]];
      return next;
    });

    try {
      const response = await fetch(
        `/api/staff/applications/${card.applicationId}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, note: "Moved on the pipeline board." }),
        },
      );
      if (!response.ok) {
        const b = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(b.error ?? "That move is not allowed.");
      }
    } finally {
      setBusy(false);
      // Re-sync with server truth either way (confirms or reverts the move).
      router.refresh();
    }
  }

  return (
    <div>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-input bg-stop-bg px-4 py-3 text-footnote font-medium text-stop"
        >
          {error}
        </p>
      )}

      <div className="flex gap-3 overflow-x-auto pb-3">
        {order.map((status) => {
          const s = APP_STATUS[status];
          const cards = columns[status] ?? [];
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(status);
              }}
              onDragLeave={() =>
                setDragOver((cur) => (cur === status ? null : cur))
              }
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const raw = e.dataTransfer.getData("application/json");
                if (!raw) return;
                const card = JSON.parse(raw) as PipelineCard;
                void move(card, status);
              }}
              className={cn(
                "flex w-[220px] shrink-0 flex-col rounded-card border-[0.5px] bg-white-titanium-lt transition-colors",
                dragOver === status
                  ? "border-nat-titanium-deep bg-white-titanium"
                  : "border-separator",
              )}
            >
              <div className="flex items-center justify-between gap-2 border-b-[0.5px] border-separator px-3 py-2.5">
                <StatusPill tone={s.tone}>{s.label}</StatusPill>
                <span className="text-footnote font-semibold tabular-nums text-label-2">
                  {cards.length}
                </span>
              </div>
              <div className="flex min-h-[80px] flex-col gap-2 p-2">
                {cards.map((card) => (
                  <div
                    key={card.applicationId}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify(card),
                      )
                    }
                    className="cursor-grab rounded-[10px] border-[0.5px] border-separator bg-surface p-3 shadow-1 active:cursor-grabbing"
                  >
                    <Link
                      href={`/staff/clients?q=${card.applicationNo}`}
                      className="block"
                    >
                      <p className="truncate text-[14px] font-semibold">
                        {card.customerName}
                      </p>
                      <p className="truncate text-footnote text-label-2">
                        {card.businessName}
                      </p>
                      <p className="mt-1 text-[12px] text-label-3">
                        {card.applicationNo}
                      </p>
                    </Link>
                  </div>
                ))}
                {cards.length === 0 && (
                  <p className="px-1 py-4 text-center text-footnote text-label-3">
                    Nothing here
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
