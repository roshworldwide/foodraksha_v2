"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Field, Input, Textarea } from "./Field";

interface FieldErrors {
  [key: string]: string;
}

/**
 * The "send us a message" form. Posts to /api/public/lead so the message lands
 * in the CRM's Website Enquiries inbox (tagged as a contact enquiry). Composes
 * the shared Field/Input/Textarea/Button — no new primitives. A phone number is
 * collected too: the Lead needs one, and it lets the team call back.
 */
export function ContactForm({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFormError(null);
    setErrors({});

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? "") || undefined,
      mobile: String(form.get("mobile") ?? ""),
      subject: String(form.get("subject") ?? "") || undefined,
      message: String(form.get("message") ?? "") || undefined,
      serviceInterest: "Contact enquiry",
      consent: form.get("consent") === "on",
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
        <h2 className="mt-4 text-title-3 text-fr-ink">Message sent</h2>
        <p className="mx-auto mt-2 max-w-[360px] text-[15px] leading-relaxed text-fr-ink-2">
          Thanks for reaching out — a Food Raksha adviser will get back to you
          shortly.
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

        <Field htmlFor="subject" label="Subject" error={errors.subject}>
          <Input id="subject" name="subject" placeholder="What's this about?" />
        </Field>

        <Field htmlFor="message" label="Message" error={errors.message}>
          <Textarea
            id="message"
            name="message"
            placeholder="How can we help?"
          />
        </Field>

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
          variant="blue"
          size="lg"
          fullWidth
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
