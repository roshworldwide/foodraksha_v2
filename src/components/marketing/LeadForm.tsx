"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  formatPriceFrom,
  licenceForBand,
  licenceInfo,
  TURNOVER_BANDS,
  type TurnoverBand,
} from "@/lib/marketing/qualifier";
import { Button } from "./Button";
import { Field, Input, Select, Textarea } from "./Field";

interface FieldErrors {
  [key: string]: string;
}

/**
 * The website's lead capture — the qualifier. Pick a turnover band and see the
 * likely licence + price instantly, then leave a mobile number for a callback.
 * Posts to /api/public/lead, which drops the enquiry into the CRM's Website
 * Enquiries inbox. No account, no credentials — the team converts these by hand.
 */
export function LeadForm({
  /** Tags the lead, e.g. "New FSSAI licence" or "Renewal". */
  serviceInterest,
  /** Show the turnover → licence qualifier readout. */
  qualifier = true,
  /** Optional heading shown above the fields. */
  title,
  className,
}: {
  serviceInterest?: string;
  qualifier?: boolean;
  title?: string;
  className?: string;
}) {
  const params = useSearchParams();

  const [turnover, setTurnover] = useState<TurnoverBand | "">("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const licence = turnover ? licenceInfo(licenceForBand(turnover)) : null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFormError(null);
    setErrors({});

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      mobile: String(form.get("mobile") ?? ""),
      businessType: String(form.get("businessType") ?? ""),
      turnover: turnover || undefined,
      serviceInterest,
      city: String(form.get("city") ?? "") || undefined,
      message: String(form.get("message") ?? "") || undefined,
      consent: form.get("consent") === "on",
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
      referrer:
        typeof document !== "undefined"
          ? document.referrer || undefined
          : undefined,
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

  if (status === "done") {
    return (
      <div
        className={cn(
          "rounded-fr-card border-[0.5px] border-fr-sep bg-fr-green-050 p-8 text-center",
          className,
        )}
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-fr-green text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="size-6"
          >
            <path
              d="M5 12.5 10 17.5 19 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-title-3 text-fr-ink">You&rsquo;re all set</h3>
        <p className="mx-auto mt-2 max-w-[360px] text-[15px] leading-relaxed text-fr-ink-2">
          Thanks — we&rsquo;ve got your details and a FoodRaksha adviser will
          call you back shortly to take it from here.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn(
        "rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-soft sm:p-7",
        className,
      )}
    >
      {title && <h3 className="mb-5 text-title-3 text-fr-ink">{title}</h3>}

      <div className="flex flex-col gap-4">
        {qualifier && (
          <Field
            htmlFor="turnover"
            label="Annual turnover"
            hint="So we can tell you which licence you need."
          >
            <Select
              id="turnover"
              name="turnover"
              value={turnover}
              onChange={(e) => setTurnover(e.target.value as TurnoverBand | "")}
              aria-describedby="turnover-hint"
            >
              <option value="">Select turnover…</option>
              {TURNOVER_BANDS.map((band) => (
                <option key={band.value} value={band.value}>
                  {band.label}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {qualifier && licence && (
          <div
            aria-live="polite"
            className="rounded-input border-[0.5px] border-fr-blue/25 bg-fr-blue-050 px-4 py-3.5"
          >
            <p className="text-[13px] font-semibold tracking-[0.02em] text-fr-blue-deep uppercase">
              You&rsquo;ll likely need
            </p>
            <p className="mt-1 text-[17px] font-semibold text-fr-ink">
              {licence.name}{" "}
              <span className="font-normal text-fr-ink-2">
                · {formatPriceFrom(licence.kind)} · {licence.timeline}
              </span>
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field htmlFor="name" label="Your name" error={errors.name}>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Full name"
            />
          </Field>
          <Field htmlFor="mobile" label="Mobile number" error={errors.mobile}>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98450 21764"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            htmlFor="businessType"
            label="Kind of business"
            error={errors.businessType}
          >
            <Input
              id="businessType"
              name="businessType"
              placeholder="Restaurant, bakery, trader…"
            />
          </Field>
          <Field htmlFor="city" label="City" error={errors.city}>
            <Input
              id="city"
              name="city"
              autoComplete="address-level2"
              placeholder="City"
            />
          </Field>
        </div>

        <Field
          htmlFor="message"
          label="Anything else? (optional)"
          error={errors.message}
        >
          <Textarea
            id="message"
            name="message"
            placeholder="Tell us briefly about your business or what you need."
          />
        </Field>

        <label className="flex items-start gap-2.5 text-[14px] text-fr-ink-2">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 size-[18px] shrink-0 accent-fr-blue"
          />
          <span>
            I agree to be contacted by FoodRaksha about my enquiry, and to the{" "}
            <a href="/privacy" className="font-semibold text-fr-blue underline">
              privacy policy
            </a>
            .
          </span>
        </label>
        {errors.consent && (
          <p
            role="alert"
            className="text-[13px] font-medium text-fr-green-deep"
          >
            {errors.consent}
          </p>
        )}

        {formError && (
          <p
            role="alert"
            className="rounded-input bg-fr-green-050 px-4 py-3 text-[14px] font-medium text-fr-green-deep"
          >
            {formError}
          </p>
        )}

        <Button
          type="submit"
          variant="green"
          size="lg"
          fullWidth
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Request a callback"}
        </Button>
        <p className="text-center text-[13px] text-fr-ink-3">
          No payment now. A FoodRaksha adviser will call you back.
        </p>
      </div>
    </form>
  );
}
