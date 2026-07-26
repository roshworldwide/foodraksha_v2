"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

/**
 * The hero's single-input entry point, per FR-001: type a turnover, press Check
 * Eligibility.
 *
 * It deliberately does NOT answer the licence question here. Turnover alone is
 * wrong for a good number of categories — an importer, a 5-star hotel and a
 * caterer are decided by what they do, not what they earn — and a hero that
 * implied otherwise is the contradiction we removed from this site once already.
 * So this carries the figure to the full calculator, which asks for the kind of
 * business and applies the official matrix.
 */
export function TurnoverQuickEntry({ className }: { className?: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = amount.replace(/[^\d.]/g, "");
    const query = digits ? `?turnover=${encodeURIComponent(digits)}` : "";
    router.push(`/fssai-calculator${query}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "rounded-[18px] border-[0.5px] border-fr-sep bg-fr-bg p-5 shadow-fr-lift sm:p-6",
        className,
      )}
    >
      <label
        htmlFor="hero-turnover"
        className="block text-[14.5px] font-semibold text-fr-ink"
      >
        Enter your annual turnover (₹)
      </label>
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
        <input
          id="hero-turnover"
          name="turnover"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g., 25,00,000"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className={cn(
            "min-h-[50px] flex-1 rounded-input border-[0.5px] border-fr-sep bg-fr-bg px-4",
            "text-[16px] text-fr-ink outline-none placeholder:text-fr-ink-3",
            "transition-shadow duration-150",
            "focus:border-fr-blue focus:ring-[3.5px] focus:ring-fr-blue/25",
          )}
        />
        <Button
          type="submit"
          variant="blue"
          size="base"
          className="shrink-0 shadow-fr-blue"
        >
          Check Eligibility
          <span aria-hidden="true">→</span>
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t-[0.5px] border-fr-sep pt-3.5 text-[13px]">
        <span className="flex items-center gap-1.5 font-semibold text-fr-green-deep">
          <span aria-hidden="true">✓</span> 100% Confidential
        </span>
        <span className="text-fr-ink-2">· Instant Result</span>
        <span className="text-fr-ink-2">· No Obligation</span>
      </div>
    </form>
  );
}
