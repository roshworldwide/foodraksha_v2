"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import {
  calculatorSummary,
  CENTRAL,
  computeFssai,
  CRORE,
  FEES_UPDATED_LABEL,
  FEES_UPDATED_LABEL_SHORT,
  findKob,
  formatGovtFee,
  formatTurnover,
  KOB_GROUPS,
  kobsInGroup,
  PROFESSIONAL_FEE_NOTE,
  CENTRAL_THRESHOLD,
  REGISTRATION,
  requiredInputs,
  STAR_RATINGS,
  STATE,
  STATE_THRESHOLD,
  type StarRating,
} from "@/content/fssai-fees";
import { Button } from "./Button";
import { Field, Input } from "./Field";

/**
 * The FSSAI Fee & Licence Calculator — the website's primary lead magnet.
 *
 * Every licence name, fee and rule comes from computeFssai() in
 * @/content/fssai-fees; nothing is hardcoded here. This component owns only the
 * inputs, the presentation and the callback request.
 *
 * Two deliberate layout choices:
 *  · The answer slot always holds something — the three-tier fee reference
 *    before a result, the result itself after. Swapping same-height content
 *    beats revealing it, which would shove the rest of the card down the page.
 *  · No useSearchParams. It would force a Suspense boundary whose fallback is a
 *    different height from the card — a layout shift in the hero. UTMs are read
 *    from the URL at submit time instead, which needs no hook.
 */

type TurnoverUnit = "lakh" | "crore";

const UNITS: { value: TurnoverUnit; label: string; multiplier: number }[] = [
  { value: "lakh", label: "Lakh", multiplier: 100_000 },
  { value: "crore", label: "Crore", multiplier: CRORE },
];

/**
 * The three headline tiers, shown as a reference until there is a real answer.
 * The bands are derived from the engine's thresholds — a card this narrow has
 * room for the number, not a sentence, and the number is the useful part.
 */
const STATE_CR = STATE_THRESHOLD / CRORE;
const CENTRAL_CR = CENTRAL_THRESHOLD / CRORE;

const FEE_REFERENCE = [
  { outcome: REGISTRATION, band: `Up to ₹${STATE_CR} cr` },
  { outcome: STATE, band: `₹${STATE_CR}–${CENTRAL_CR} cr` },
  { outcome: CENTRAL, band: `Over ₹${CENTRAL_CR} cr` },
];

/** The typed amount + unit as rupees, or undefined while it isn't a number. */
function toRupees(amount: string, unit: TurnoverUnit): number | undefined {
  const trimmed = amount.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return undefined;
  const found = UNITS.find((u) => u.value === unit);
  return value * (found?.multiplier ?? 1);
}

interface FieldErrors {
  [key: string]: string;
}

/* ─────────────────────────────────────────── segmented control */

/**
 * An iOS-style segmented picker built on real radios — two or three choices
 * read better as pills than as a dropdown, and stay keyboard-operable.
 */
function Segmented<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  className,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <fieldset className={cn("flex flex-col gap-1.5", className)}>
      <legend className="mb-1.5 text-[13.5px] font-semibold tracking-[-0.006em] text-fr-ink">
        {legend}
      </legend>
      <div className="flex gap-1.5 rounded-[13px] bg-fr-panel p-1">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex flex-1 basis-0 cursor-pointer items-center justify-center rounded-[10px]",
                "min-h-[40px] px-2 text-center text-[14px] font-semibold text-nowrap",
                "transition-[background-color,color,box-shadow] duration-200 ease-ios",
                "has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-fr-blue/35",
                active
                  ? "bg-fr-bg text-fr-ink shadow-fr-soft"
                  : "text-fr-ink-2 hover:text-fr-ink",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={active}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ─────────────────────────────────────────── the calculator */

export interface FssaiCalculatorProps {
  /** Heading — the hero and the standalone page word it differently. */
  title?: string;
  /** Renders the heading as an <h2>. The SEO page owns the <h1> itself. */
  headingLevel?: "h2" | "h3";
  className?: string;
}

export function FssaiCalculator({
  title = "FSSAI Fee Calculator",
  headingLevel = "h2",
  className,
}: FssaiCalculatorProps) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [kobId, setKobId] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<TurnoverUnit>("lakh");
  const [stars, setStars] = useState<StarRating | "">("");
  const [milling, setMilling] = useState<"yes" | "no" | "">("");

  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const kob = kobId ? findKob(kobId) : undefined;
  const needs = kob ? requiredInputs(kob.rule) : null;
  const turnover = toRupees(amount, unit);

  // Recomputed on every render — the read-out is always live.
  const answers = {
    kob: kobId,
    turnover: needs?.turnover ? turnover : undefined,
    stars: needs?.stars ? stars || undefined : undefined,
    milling: needs?.milling ? milling === "yes" : undefined,
  };
  const result = computeFssai(answers);
  const hasStepTwo = Boolean(needs?.stars || needs?.milling || needs?.turnover);

  const Heading = headingLevel;

  function reset() {
    setKobId("");
    setAmount("");
    setStars("");
    setMilling("");
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
      businessType: kob?.label,
      serviceInterest: result.resolved ? result.licence : undefined,
      calculatorNote: calculatorSummary(answers) ?? undefined,
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
        ok?: boolean;
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
        "overflow-hidden rounded-[26px] border-[0.5px] border-fr-sep bg-fr-bg shadow-fr-lift",
        className,
      )}
    >
      {/* ── Header. One row: the card lives in a hero, so every row it doesn't
             need is height it doesn't waste. The title carries the explanation,
             so there is no strapline. */}
      <div className="flex items-center gap-3 border-b-[0.5px] border-fr-sep bg-gradient-to-b from-fr-blue-050 to-fr-bg px-5 py-4 sm:px-6">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-fr-blue text-[16px] font-bold text-white shadow-fr-blue"
        >
          ₹
        </span>
        <Heading className="min-w-0 flex-1 text-[16px] leading-[1.25] font-bold tracking-[-0.018em] text-fr-ink sm:text-[17px]">
          {title}
        </Heading>
        {/* A phone-width card cannot fit icon + title + the full label on one
            row, and the title matters more — so the label abbreviates rather
            than pushing the title onto a second line. */}
        <span className="shrink-0 rounded-pill bg-fr-green-050 px-1.5 py-0.5 text-[10.5px] font-bold tracking-[0.01em] text-fr-green-deep sm:px-2 sm:text-[11px]">
          <span className="sm:hidden">{FEES_UPDATED_LABEL_SHORT}</span>
          <span className="hidden sm:inline">{FEES_UPDATED_LABEL}</span>
        </span>
      </div>

      <div className="flex flex-col gap-3 px-5 py-4 sm:px-6">
        {/* ── Step 1 · one grouped dropdown, all 48 kinds of business */}
        <Field htmlFor={id("kob")} label="What's your business?">
          <div className="relative">
            <select
              id={id("kob")}
              name="kob"
              value={kobId}
              onChange={(event) => {
                setKobId(event.target.value);
                setStars("");
                setMilling("");
              }}
              className={cn(
                "w-full appearance-none rounded-input border-[0.5px] bg-fr-bg pr-10 pl-3.5",
                "min-h-[46px] text-[15.5px] font-medium text-fr-ink outline-none",
                "transition-shadow duration-150",
                "focus:border-fr-blue focus:ring-[3.5px] focus:ring-fr-blue/25",
                kobId ? "border-fr-blue/40" : "border-fr-sep",
              )}
            >
              <option value="">Choose your kind of business…</option>
              {KOB_GROUPS.map((group) => (
                <optgroup key={group} label={group}>
                  {kobsInGroup(group).map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                      {entry.detail ? ` — ${entry.detail}` : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-fr-ink-3"
            >
              ▾
            </span>
          </div>
        </Field>

        {/* ── Step 2 · only what this kind of business actually needs */}
        {hasStepTwo && (
          <div className="animate-fr-rise flex flex-col gap-3 rounded-fr-card bg-fr-panel/70 px-4 py-3.5">
            {needs?.stars && (
              <Segmented
                name={id("stars")}
                legend="Star rating"
                options={STAR_RATINGS.map((r) => ({
                  value: r.value,
                  label: r.label,
                }))}
                value={stars}
                onChange={setStars}
              />
            )}

            {needs?.milling && (
              <Segmented
                name={id("milling")}
                legend="Do you mill grains, cereals or pulses?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                value={milling}
                onChange={setMilling}
              />
            )}

            {needs?.turnover && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={id("turnover")}
                  className="text-[13.5px] font-semibold tracking-[-0.006em] text-fr-ink"
                >
                  Annual turnover
                </label>
                <div className="flex items-stretch gap-1.5">
                  <div className="relative flex-1">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[16px] font-medium text-fr-ink-3"
                    >
                      ₹
                    </span>
                    <Input
                      id={id("turnover")}
                      name="turnover"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="80"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      aria-describedby={`${id("turnover")}-hint`}
                      className="min-h-[48px] bg-fr-bg pl-8"
                    />
                  </div>
                  <div
                    role="radiogroup"
                    aria-label="Turnover unit"
                    className="flex shrink-0 gap-1 rounded-[13px] bg-fr-bg p-1 ring-[0.5px] ring-fr-sep"
                  >
                    {UNITS.map((option) => {
                      const active = unit === option.value;
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            "flex cursor-pointer items-center justify-center rounded-[10px] px-3",
                            "text-[13.5px] font-semibold transition-colors duration-200",
                            "has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-fr-blue/35",
                            active
                              ? "bg-fr-blue text-white"
                              : "text-fr-ink-2 hover:text-fr-ink",
                          )}
                        >
                          <input
                            type="radio"
                            name={id("unit")}
                            value={option.value}
                            checked={active}
                            onChange={() => setUnit(option.value)}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <p
                  id={`${id("turnover")}-hint`}
                  className="text-[12.5px] text-fr-ink-2"
                >
                  {turnover !== undefined
                    ? `That's ${formatTurnover(turnover)} a year.`
                    : "Your best estimate is fine."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── The answer slot. Holds the fee reference until there is a real
             result, then the result — a swap, not a reveal, so nothing below
             it jumps. Announced politely once it resolves. */}
        <div aria-live="polite">
          {result.resolved ? (
            <div
              key={`${result.licence}-${result.govtFee}`}
              className="animate-fr-rise rounded-fr-card bg-fr-green-050 px-4 py-3.5 ring-[0.5px] ring-fr-green/30"
            >
              {/* Licence and fee share a baseline — the two facts people came
                  for, on one line instead of three stacked rows. */}
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="flex size-4 items-center justify-center rounded-full bg-fr-green text-white"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="size-2.5">
                        <path
                          d="M5 12.5 10 17.5 19 7"
                          stroke="currentColor"
                          strokeWidth="3.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <p className="text-[10.5px] font-bold tracking-[0.06em] text-fr-green-deep uppercase">
                      You need a
                    </p>
                  </div>
                  <p className="mt-1 text-[22px] leading-[1.12] font-bold tracking-[-0.024em] text-fr-ink">
                    {result.licence}
                  </p>
                </div>
                <p className="shrink-0 text-right text-[17px] leading-[1.2] font-bold tracking-[-0.018em] text-fr-green-deep">
                  {formatGovtFee(result.govtFee)}
                </p>
              </div>

              <p className="mt-2 border-t-[0.5px] border-fr-green/25 pt-2 text-[12px] leading-[1.45] text-fr-ink-2">
                {result.note}{" "}
                <button
                  type="button"
                  onClick={reset}
                  className="cursor-pointer font-semibold text-fr-blue underline decoration-fr-blue/30 underline-offset-2 hover:decoration-fr-blue"
                >
                  Start over
                </button>
              </p>
            </div>
          ) : (
            <div className="rounded-fr-card bg-fr-panel/70 px-4 py-3">
              <p className="text-[10.5px] font-bold tracking-[0.06em] text-fr-ink-2 uppercase">
                The three FSSAI tiers
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {FEE_REFERENCE.map(({ outcome, band }) => (
                  <li
                    key={outcome.licence}
                    className="flex items-baseline gap-2.5"
                  >
                    <span className="shrink-0 text-[13px] font-semibold text-fr-ink">
                      {outcome.licence}
                    </span>
                    <span className="shrink-0 rounded-pill bg-fr-bg px-1.5 py-0.5 text-[10.5px] font-medium text-fr-ink-2 tabular-nums">
                      {band}
                    </span>
                    <span className="ml-auto shrink-0 text-[13px] font-bold text-fr-ink tabular-nums">
                      {formatGovtFee(outcome.govtFee)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 border-t-[0.5px] border-fr-sep pt-2 text-[12px] leading-[1.45] text-fr-ink-2">
                {result.note}
              </p>
            </div>
          )}
        </div>

        {/* ── Lead magnet */}
        {status === "done" ? (
          <div className="animate-fr-rise flex items-center gap-3 rounded-fr-card bg-fr-blue-050 px-4 py-3.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fr-blue text-white">
              <svg viewBox="0 0 24 24" fill="none" className="size-4">
                <path
                  d="M5 12.5 10 17.5 19 7"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[14.5px] font-bold text-fr-ink">
                A specialist will call you back.
              </p>
              <p className="mt-0.5 text-[12px] leading-[1.45] text-fr-ink-2">
                We&rsquo;ve got your number and your calculated result.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            className="flex flex-col gap-2.5"
          >
            {/* Two across at every width — this card is never narrow enough to
                need them stacked, and stacking costs a whole field of height. */}
            <div className="grid grid-cols-2 gap-2.5">
              <Field htmlFor={id("name")} label="Your name" error={errors.name}>
                <Input
                  id={id("name")}
                  name="name"
                  autoComplete="name"
                  placeholder="Full name"
                  className="min-h-[44px] px-3.5 text-[15px]"
                />
              </Field>
              <Field
                htmlFor={id("mobile")}
                label="Mobile"
                error={errors.mobile}
              >
                <Input
                  id={id("mobile")}
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit"
                  className="min-h-[44px] px-3.5 text-[15px]"
                />
              </Field>
            </div>

            <label className="flex items-start gap-2 text-[12px] leading-[1.45] text-fr-ink-2">
              <input
                type="checkbox"
                name="consent"
                className="mt-px size-[16px] shrink-0 accent-fr-blue"
              />
              <span>
                I agree to be contacted, and to the{" "}
                <a
                  href="/privacy"
                  className="font-semibold text-fr-blue underline decoration-fr-blue/30 underline-offset-2"
                >
                  privacy policy
                </a>
                .
              </span>
            </label>
            {errors.consent && (
              <p
                role="alert"
                className="text-[12px] font-semibold text-fr-blue-deep"
              >
                {errors.consent}
              </p>
            )}

            {formError && (
              <p
                role="alert"
                className="rounded-input bg-fr-blue-050 px-3.5 py-2.5 text-[12.5px] font-medium text-fr-blue-deep"
              >
                {formError}
              </p>
            )}

            <Button
              type="submit"
              variant="blue"
              size="base"
              fullWidth
              disabled={status === "submitting"}
              className="shadow-fr-blue"
            >
              {status === "submitting"
                ? "Sending…"
                : result.resolved
                  ? "Get my exact quote & free callback"
                  : "Get a free callback"}
            </Button>
          </form>
        )}

        {/* Both footnotes on one line, once, at the foot of the card — rather
            than repeated inside the result panel. */}
        <p className="text-[11.5px] leading-[1.45] text-fr-ink-2">
          {PROFESSIONAL_FEE_NOTE} No payment now — or{" "}
          <a
            href="/get-started"
            className="font-semibold text-fr-blue underline decoration-fr-blue/30 underline-offset-2"
          >
            start your application
          </a>
          .
        </p>
      </div>
    </div>
  );
}
