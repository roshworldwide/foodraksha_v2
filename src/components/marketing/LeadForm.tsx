"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  BUSINESS_TYPES,
  formatInr,
  licenceForBand,
  recommend,
  TURNOVER_BANDS,
  type TurnoverBand,
} from "@/lib/marketing/qualifier";
import { Button } from "./Button";
import { Field, Input, Select, Textarea } from "./Field";

interface FieldErrors {
  [key: string]: string;
}

/**
 * The website's lead capture — the qualifier. Pick turnover + business type and
 * see the licence you need, the plan price and the timeline instantly, then
 * leave a number for a callback. Posts to /api/public/lead, landing in the
 * CRM's Website Enquiries inbox. No account, no credentials — the team converts
 * these by hand.
 */
export interface LeadFormProps {
  /** Tags the lead, e.g. "New FSSAI licence". When the qualifier runs, the
   *  recommended licence name overrides this. */
  serviceInterest?: string;
  /** Show the turnover → licence qualifier readout. */
  qualifier?: boolean;
  /** Compact = hero/sidebar variant: single-column name/mobile, no message. */
  compact?: boolean;
  /** Show a "Preferred time" select — the Book Appointment page. */
  preferredTime?: boolean;
  /** Label for the submit button. */
  submitLabel?: string;
  /** Optional heading shown above the fields. */
  title?: string;
  /** Submit button style — the hero uses blue, standalone pages green. */
  submitVariant?: "blue" | "green";
  className?: string;
}

export function LeadForm({
  serviceInterest,
  qualifier = true,
  compact = false,
  preferredTime = false,
  submitLabel = "Get my free callback",
  title,
  submitVariant = "green",
  className,
}: LeadFormProps) {
  const params = useSearchParams();

  const [turnover, setTurnover] = useState<TurnoverBand | "">("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const rec = turnover ? recommend(licenceForBand(turnover)) : null;

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
      // When the qualifier ran, the recommended licence IS the interest.
      serviceInterest: rec ? rec.licence.name : serviceInterest,
      city: String(form.get("city") ?? "") || undefined,
      whatsappOptIn: form.get("whatsapp") === "on",
      preferredTime: String(form.get("preferredTime") ?? "") || undefined,
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
          Thanks — we&rsquo;ve got your details and a Food Raksha adviser will
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
        "rounded-[20px] border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-lift sm:p-7",
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

        <Field
          htmlFor="businessType"
          label="Business type"
          error={errors.businessType}
        >
          <Select id="businessType" name="businessType" defaultValue="">
            <option value="" disabled>
              Select business type…
            </option>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>

        {qualifier && rec && (
          <div
            aria-live="polite"
            className="rounded-input border border-fr-green/25 bg-fr-green-050 px-4 py-3 text-[14px] font-semibold text-fr-green-deep"
          >
            ✓ You need a <span className="text-fr-ink">{rec.licence.name}</span>{" "}
            — from {formatInr(rec.plan.price)} + govt fee · {rec.timeline}
          </div>
        )}

        <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
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
              placeholder="Your 10-digit number"
            />
          </Field>
        </div>

        <Field htmlFor="city" label="City (optional)" error={errors.city}>
          <Input
            id="city"
            name="city"
            autoComplete="address-level2"
            placeholder="City"
          />
        </Field>

        {preferredTime && (
          <Field
            htmlFor="preferredTime"
            label="Preferred callback time (optional)"
          >
            <Select id="preferredTime" name="preferredTime" defaultValue="">
              <option value="">Anytime</option>
              <option value="Morning (9am–12pm)">Morning (9am–12pm)</option>
              <option value="Afternoon (12–4pm)">Afternoon (12–4pm)</option>
              <option value="Evening (4–7pm)">Evening (4–7pm)</option>
            </Select>
          </Field>
        )}

        {!compact && (
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
        )}

        <label className="flex items-center gap-2.5 text-[14px] text-fr-ink-2">
          <input
            type="checkbox"
            name="whatsapp"
            defaultChecked
            className="size-[18px] shrink-0 accent-fr-green"
          />
          <span>Send me updates on WhatsApp</span>
        </label>

        <label className="flex items-start gap-2.5 text-[13px] text-fr-ink-2">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 size-[18px] shrink-0 accent-fr-blue"
          />
          <span>
            I agree to be contacted about my enquiry, and to the{" "}
            <a href="/privacy" className="font-semibold text-fr-blue underline">
              privacy policy
            </a>
            .
          </span>
        </label>
        {errors.consent && (
          <p role="alert" className="text-[13px] font-medium text-fr-blue-deep">
            {errors.consent}
          </p>
        )}

        {formError && (
          <p
            role="alert"
            className="rounded-input bg-fr-blue-050 px-4 py-3 text-[14px] font-medium text-fr-blue-deep"
          >
            {formError}
          </p>
        )}

        <Button
          type="submit"
          variant={submitVariant}
          size="lg"
          fullWidth
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : submitLabel}
        </Button>
        <p className="text-center text-[13px] text-fr-ink-3">
          No payment now. A Food Raksha adviser will call you back.
        </p>
      </div>
    </form>
  );
}
