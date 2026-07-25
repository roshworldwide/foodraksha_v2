"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button, ButtonLink } from "./Button";
import { Field, Input, Select } from "./Field";

interface FieldErrors {
  [key: string]: string;
}

interface Success {
  username: string;
  password: string;
  applicationNo: string;
  delivery?: {
    sms?: { status: string };
    email?: { status: string };
  };
}

/**
 * The express lane: create a real account instantly via /api/public/signup and
 * show the one-time credentials. Distinct from the LeadForm — this is for
 * someone who already knows what they want. Lead capture stays the primary CTA.
 */
export function GetStartedForm({
  categories,
  className,
}: {
  categories: { code: string; name: string }[];
  className?: string;
}) {
  const params = useSearchParams();
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [account, setAccount] = useState<Success | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFormError(null);
    setErrors({});

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      mobile: String(form.get("mobile") ?? ""),
      businessType: String(form.get("businessType") ?? ""),
      city: String(form.get("city") ?? ""),
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
      const response = await fetch("/api/public/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as Success & {
        error?: string;
        fieldErrors?: FieldErrors;
      };
      if (!response.ok) {
        setErrors(body.fieldErrors ?? {});
        setFormError(body.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setAccount(body);
    } catch {
      setFormError("We couldn't reach the server. Please try again.");
      setStatus("idle");
    }
  }

  if (account) {
    const smsSent = account.delivery?.sms?.status === "sent";
    const emailSent = account.delivery?.email?.status === "sent";
    return (
      <div
        className={cn(
          "rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg p-7 shadow-fr-lift",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-fr-green text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="size-5"
            >
              <path
                d="M5 12.5 10 17.5 19 7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h2 className="text-title-3 text-fr-ink">Your account is ready</h2>
            <p className="text-[14px] text-fr-ink-2">
              Application {account.applicationNo}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-input border border-fr-blue/25 bg-fr-blue-050 p-4">
          <p className="text-[13px] font-semibold tracking-[0.02em] text-fr-blue-deep uppercase">
            Your sign-in details
          </p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
            <dt className="text-fr-ink-2">Username</dt>
            <dd className="font-mono font-semibold text-fr-ink">
              {account.username}
            </dd>
            <dt className="text-fr-ink-2">Password</dt>
            <dd className="font-mono font-semibold text-fr-ink">
              {account.password}
            </dd>
          </dl>
        </div>

        <p className="mt-3 text-[13px] text-fr-ink-2">
          Save your password now — for your security it won&rsquo;t be shown
          again.
          {(smsSent || emailSent) && (
            <>
              {" "}
              We&rsquo;ve also sent it
              {smsSent ? " by SMS" : ""}
              {smsSent && emailSent ? " and" : ""}
              {emailSent ? " by email" : ""}.
            </>
          )}
        </p>

        <div className="mt-5">
          <ButtonLink href="/login" variant="blue" size="lg" fullWidth>
            Sign in to your dashboard
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn(
        "rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg p-6 shadow-fr-lift sm:p-7",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
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
              placeholder="Your 10-digit number"
            />
          </Field>
        </div>

        <Field htmlFor="email" label="Email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            htmlFor="businessType"
            label="Business type"
            error={errors.businessType}
          >
            <Select id="businessType" name="businessType" defaultValue="">
              <option value="" disabled>
                Select business type…
              </option>
              {categories.map((category) => (
                <option key={category.code} value={category.code}>
                  {category.name}
                </option>
              ))}
            </Select>
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

        <label className="flex items-start gap-2.5 text-[13px] text-fr-ink-2">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 size-[18px] shrink-0 accent-fr-blue"
          />
          <span>
            I agree to the{" "}
            <a href="/privacy" className="font-semibold text-fr-blue underline">
              privacy policy
            </a>{" "}
            and to Food Raksha processing my details to prepare my application.
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
          variant="blue"
          size="lg"
          fullWidth
          disabled={status === "submitting"}
        >
          {status === "submitting"
            ? "Creating your account…"
            : "Create my account"}
        </Button>
        <p className="text-center text-[13px] text-fr-ink-3">
          Free to start. You&rsquo;ll get your login instantly.
        </p>
      </div>
    </form>
  );
}
