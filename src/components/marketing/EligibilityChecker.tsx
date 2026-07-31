"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  CRORE,
  formatGovtFee,
  formatTurnover,
  standardOutcome,
  STATE_THRESHOLD,
  CENTRAL_THRESHOLD,
  type FeeOutcome,
} from "@/content/fssai-fees";

/**
 * The hero's Eligibility Checker, ported from
 * docs/client-design/components/EligibilityChecker.tsx.
 *
 * Their version hardcoded the PRE-REFORM ladder — ₹12 lakh and ₹20 crore — which
 * is wrong on today's rules. This one calls standardOutcome() from the tested fee
 * engine, so the thresholds (₹1.5 crore / ₹50 crore) and the government fees come
 * from the single source the whole site uses.
 *
 * Turnover alone only settles the STANDARD ladder. A caterer, an importer or a
 * 5-star hotel is decided by what it does, not what it earns, so the result says
 * so and links to the full calculator rather than pretending one number is the
 * whole answer.
 *
 * After a result, it captures a mobile number straight to /api/public/lead with
 * the computed outcome in the note.
 */

interface FieldErrors {
  [key: string]: string;
}

export function EligibilityChecker({ className }: { className?: string }) {
  const [turnover, setTurnover] = useState("");
  const [outcome, setOutcome] = useState<FeeOutcome | null>(null);
  const [rupees, setRupees] = useState<number | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  function check() {
    const raw = turnover.replace(/[^0-9.]/g, "");
    const value = Number.parseFloat(raw);
    if (!raw || !Number.isFinite(value) || value <= 0) {
      setInputError("Enter your annual turnover in ₹.");
      setOutcome(null);
      setRupees(null);
      return;
    }
    setInputError(null);
    setRupees(value);
    setOutcome(standardOutcome(value));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFormError(null);
    setErrors({});

    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams(window.location.search);
    const payload = {
      name: String(form.get("name") ?? ""),
      mobile: String(form.get("mobile") ?? ""),
      serviceInterest: outcome?.licence,
      calculatorNote:
        outcome && rupees !== null
          ? `Eligibility checker · ${formatTurnover(rupees)} · ${outcome.licence} · govt fee ${formatGovtFee(outcome.govtFee)}`
          : undefined,
      consent: form.get("consent") === "on",
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
      referrer: window.location.pathname,
    };

    try {
      const response = await fetch("/api/public/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: FieldErrors;
      };
      if (!response.ok) {
        setErrors(body.fieldErrors ?? {});
        setFormError(body.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setFormError("We couldn't reach the server. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div
      className={cn(
        "max-w-xl rounded-2xl border border-fr-sep bg-fr-bg p-5 shadow-fr-lift sm:p-7",
        className,
      )}
      id="eligibility-checker"
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full bg-fr-blue-050 text-fr-blue"
        >
          <Calculator className="size-5" />
        </span>
        <div>
          <h2 className="text-[14px] font-bold text-fr-ink">
            Free Eligibility Checker
          </h2>
          <p className="text-[12.5px] text-fr-ink-2">
            Find your FSSAI licence type in seconds
          </p>
        </div>
      </div>

      <label
        htmlFor="hero-turnover"
        className="mb-2 block text-[11.5px] font-bold tracking-[0.1em] text-fr-ink uppercase"
      >
        Enter your annual turnover (₹)
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 font-bold text-fr-ink-2"
          >
            ₹
          </span>
          <input
            id="hero-turnover"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={turnover}
            onChange={(event) => setTurnover(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                check();
              }
            }}
            placeholder="e.g., 25,00,000"
            aria-invalid={inputError ? true : undefined}
            className={cn(
              "w-full rounded-xl border border-fr-sep bg-fr-panel py-3.5 pr-4 pl-10",
              "text-[15px] font-medium text-fr-ink outline-none placeholder:text-fr-ink-3",
              "transition focus:ring-2 focus:ring-fr-blue/30",
            )}
          />
        </div>
        <button
          type="button"
          onClick={check}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl bg-fr-blue px-6 py-3.5",
            "text-[14px] font-bold whitespace-nowrap text-white shadow-fr-blue",
            "transition-colors hover:bg-fr-blue-deep",
            "focus-visible:ring-[3px] focus-visible:ring-fr-blue/35 focus-visible:outline-none",
          )}
        >
          Check Eligibility
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div aria-live="polite">
        {inputError && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-fr-rose/25 bg-fr-rose-050 p-4 text-[13.5px] font-semibold text-fr-rose-deep">
            <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
            {inputError}
          </p>
        )}

        {outcome && rupees !== null && (
          <div className="animate-fr-rise mt-3 rounded-xl border border-fr-green/25 bg-fr-green-050 p-4">
            <p className="flex items-start gap-2 text-[14px] font-semibold text-fr-ink">
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-fr-green-deep"
              />
              <span>
                On {formatTurnover(rupees)} a year you need a{" "}
                <strong className="font-extrabold">{outcome.licence}</strong> —
                government fee{" "}
                <strong className="font-extrabold">
                  {formatGovtFee(outcome.govtFee)}
                </strong>
                .
              </span>
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-fr-ink-2">
              Based on turnover alone. Some kinds of business are decided by
              what they do — importers, e-commerce and 5-star hotels are Central
              whatever they earn, and caterers start at State.
            </p>

            {status === "done" ? (
              <p className="mt-3 rounded-lg bg-fr-blue-050 px-3.5 py-3 text-[13.5px] font-semibold text-fr-ink">
                A specialist will call you back.
              </p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="mt-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="Your name"
                    aria-label="Your name"
                    className="min-h-[44px] rounded-lg border border-fr-sep bg-fr-bg px-3.5 text-[14px] text-fr-ink outline-none focus:ring-2 focus:ring-fr-blue/30"
                  />
                  <input
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="10-digit mobile"
                    aria-label="Mobile number"
                    className="min-h-[44px] rounded-lg border border-fr-sep bg-fr-bg px-3.5 text-[14px] text-fr-ink outline-none focus:ring-2 focus:ring-fr-blue/30"
                  />
                </div>
                {(errors.name || errors.mobile || errors.consent) && (
                  <p
                    role="alert"
                    className="mt-2 text-[12px] font-semibold text-fr-rose-deep"
                  >
                    {errors.name ?? errors.mobile ?? errors.consent}
                  </p>
                )}
                <label className="mt-2.5 flex items-start gap-2 text-[12px] leading-relaxed text-fr-ink-2">
                  <input
                    type="checkbox"
                    name="consent"
                    className="mt-px size-4 shrink-0 accent-fr-blue"
                  />
                  <span>
                    I agree to be contacted, and to the{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold text-fr-blue underline"
                    >
                      privacy policy
                    </Link>
                    .
                  </span>
                </label>
                {formError && (
                  <p
                    role="alert"
                    className="mt-2 text-[12.5px] font-medium text-fr-rose-deep"
                  >
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-2.5 w-full rounded-lg bg-fr-blue px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-fr-blue-deep disabled:opacity-50"
                >
                  {status === "submitting"
                    ? "Sending…"
                    : "Get my exact quote & free callback"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-[12.5px] font-medium text-fr-ink-2">
        <span className="flex items-center gap-1.5 font-semibold text-fr-green-deep">
          <CheckCircle2 aria-hidden="true" className="size-4" /> 100%
          Confidential
        </span>
        <span aria-hidden="true" className="text-fr-ink-3">
          •
        </span>
        <span>Instant Result</span>
        <span aria-hidden="true" className="text-fr-ink-3">
          •
        </span>
        <span>No Obligation</span>
      </div>

      <Link
        href="/fssai-calculator"
        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-fr-blue transition-[gap] hover:gap-2.5"
      >
        Need the full breakdown? Open the calculator
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </div>
  );
}

/** Thresholds, exported for the copy above so they never drift. */
export const LADDER = {
  state: STATE_THRESHOLD / CRORE,
  central: CENTRAL_THRESHOLD / CRORE,
};
