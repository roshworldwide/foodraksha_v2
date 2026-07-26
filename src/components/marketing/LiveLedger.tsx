"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import {
  LEDGER_EVENTS,
  LEDGER_IS_SIMULATED,
  type LedgerEvent,
} from "@/content/home-sections";

/**
 * The FSSAI Operations Ledger from FR-003 / their LiveLedger component: a navy
 * header band with a LIVE pill, then a row of timestamped filings that advances
 * on its own.
 *
 * The feed is SIMULATED, at the client's instruction. It says so on screen — a
 * ticker of invented filings presented as live client activity would mislead
 * every visitor who reads it, and the fix costs one line of caption. The events
 * carry no client names for the same reason.
 *
 * To make it real: swap LEDGER_EVENTS for a query over Application /
 * StatusEvent, set LEDGER_IS_SIMULATED to false, and nothing here changes.
 */

const TONE: Record<string, string> = {
  blue: "bg-fr-blue-050 text-fr-blue",
  green: "bg-fr-green-050 text-fr-green-deep",
  orange: "bg-fr-orange-050 text-fr-orange-deep",
  violet: "bg-fr-violet-050 text-fr-violet-deep",
};

const VISIBLE = 4;
const ROTATE_MS = 3800;

export function LiveLedger() {
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setOffset((current) => (current + 1) % LEDGER_EVENTS.length),
      ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, [paused]);

  // A rotating window over the list, so the row always looks full.
  const shown: LedgerEvent[] = Array.from(
    { length: VISIBLE },
    (_, i) => LEDGER_EVENTS[(offset + i) % LEDGER_EVENTS.length],
  );

  return (
    <section className="scroll-mt-20 py-16 lg:py-20">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="overflow-hidden rounded-[22px] border-[0.5px] border-fr-sep shadow-fr-lift">
          {/* Navy header band */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 bg-fr-royal px-5 py-4 sm:px-7">
            <span className="flex items-center gap-2 rounded-pill bg-white/15 px-3 py-1 text-[12px] font-bold tracking-[0.08em] text-white uppercase">
              <span
                aria-hidden="true"
                className="size-2 animate-pulse rounded-full bg-fr-green"
              />
              Live
            </span>
            <h2 className="text-[19px] font-extrabold tracking-[-0.018em] text-white">
              FSSAI Operations Ledger
            </h2>
            <p className="hidden border-l border-white/25 pl-4 text-[13.5px] text-white/80 lg:block">
              Filings moving through our compliance desk
            </p>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="ml-auto rounded-pill bg-white/12 px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/20 focus-visible:ring-[3px] focus-visible:ring-white/40 focus-visible:outline-none"
            >
              {paused ? "Resume" : "Pause"}
            </button>
          </div>

          {/* The rotating row */}
          <ul
            aria-live="off"
            className="grid gap-px bg-fr-sep sm:grid-cols-2 lg:grid-cols-4"
          >
            {shown.map((event, index) => (
              <li
                key={`${event.title}-${index}`}
                className="animate-fr-rise bg-fr-bg p-5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold",
                      TONE[event.tone] ?? TONE.blue,
                    )}
                  >
                    ✓
                  </span>
                  <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-fr-green-deep">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-fr-green"
                    />
                    {event.minutesAgo} min ago
                  </span>
                </div>
                <p className="mt-3 text-[14.5px] leading-snug font-bold text-fr-ink">
                  {event.title}
                </p>
                <p className="mt-1.5 text-[13px] text-fr-ink-2">
                  {event.location}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-center text-[13px] text-fr-ink-2">
          {LEDGER_IS_SIMULATED
            ? "Illustrative activity — sample filings shown to demonstrate the feed, not live client records."
            : "Anonymised: no client names or licence numbers are shown."}
        </p>
      </div>
    </section>
  );
}
