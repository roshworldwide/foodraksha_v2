"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import {
  documentCounts,
  documentsForKob,
  type DocumentRequirement,
} from "@/content/fssai-documents";
import {
  findKob,
  KOB_GROUPS,
  kobsInGroup,
} from "@/content/fssai-fees";
import { Button } from "./Button";
import { Field, Input } from "./Field";

/**
 * The document requirements checker. Pick your kind of business, get the exact
 * checklist, with every item marked "we prepare" or "you upload".
 *
 * Reuses the calculator's KINDS_OF_BUSINESS data for the picker, and
 * @/content/fssai-documents for the lists — no requirement is written here.
 *
 * The default (unselected) view deliberately renders the core checklist as real
 * content rather than an empty prompt: it is what the page ranks for, so it must
 * be in the HTML for a crawler that never touches the select.
 */

interface FieldErrors {
  [key: string]: string;
}

export function DocumentChecker({ className }: { className?: string }) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [kobId, setKobId] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const kob = kobId ? findKob(kobId) : undefined;
  // With nothing picked, show the universal core list — a real checklist, not a
  // placeholder. `documentsForKob` returns [] for an unknown id, so fall back.
  const sections = kobId
    ? documentsForKob(kobId)
    : documentsForKob("restaurants").slice(0, 1);
  const counts = documentCounts(sections);

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
      serviceInterest: "Document preparation & filing",
      // Puts the chosen business type in the CRM note as well as its own column.
      subject: kob
        ? `Document checklist — ${kob.label}`
        : "Document checklist — business type not chosen",
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
    <div className={cn("grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:gap-12", className)}>
      {/* ── Left: the picker and the tally */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Field
          htmlFor={id("kob")}
          label="Your kind of business"
          hint="All 48 FSSAI categories, grouped as FoSCoS lists them."
        >
          <div className="relative">
            <select
              id={id("kob")}
              name="kob"
              value={kobId}
              onChange={(event) => setKobId(event.target.value)}
              aria-describedby={`${id("kob")}-hint`}
              className={cn(
                "w-full appearance-none rounded-input border-[0.5px] bg-fr-bg pr-10 pl-3.5",
                "min-h-[48px] text-[15.5px] font-medium text-fr-ink outline-none",
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

        {/* The tally is the argument: most of the paperwork is ours, not yours. */}
        <div
          aria-live="polite"
          className="mt-5 rounded-fr-card bg-gradient-to-b from-fr-green-050 to-fr-bg p-5 ring-[0.5px] ring-fr-green/30"
        >
          <p className="text-[11.5px] font-bold tracking-[0.055em] text-fr-green-deep uppercase">
            {kob ? kob.label : "Every application"}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-fr-ink">
            <span className="text-[26px] font-bold tracking-[-0.026em]">
              {counts.total}
            </span>{" "}
            documents in total —{" "}
            <strong className="font-semibold text-fr-green-deep">
              we prepare {counts.preparedByUs}
            </strong>{" "}
            of them from your answers. You obtain the other {counts.youUpload}.
          </p>
          {!kobId && (
            <p className="mt-2 text-[13px] leading-relaxed text-fr-ink-2">
              Choose your kind of business for the full tailored list.
            </p>
          )}
        </div>

        {/* ── Lead magnet */}
        {status === "done" ? (
          <div className="animate-fr-rise mt-5 rounded-fr-card bg-fr-blue-050 px-4 py-4">
            <p className="text-[15px] font-bold text-fr-ink">
              A specialist will call you back.
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-fr-ink-2">
              We&rsquo;ve noted your business type and your document list.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-5 flex flex-col gap-2.5">
            <p className="text-[14px] leading-relaxed text-fr-ink-2">
              We prepare and file all of these for you — leave your number for a
              free callback.
            </p>
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
              <p role="alert" className="text-[12px] font-semibold text-fr-blue-deep">
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
                : "Book a free callback"}
            </Button>
          </form>
        )}
      </div>

      {/* ── Right: the checklist itself */}
      <div className="flex flex-col gap-7">
        {sections.map((section) => (
          <section key={section.title}>
            <h3 className="text-[17px] font-semibold tracking-[-0.014em] text-fr-ink">
              {section.title}
            </h3>
            {section.note && (
              <p className="mt-1 text-[13.5px] leading-relaxed text-fr-ink-2">
                {section.note}
              </p>
            )}
            <ul className="mt-3.5 flex flex-col gap-2.5">
              {section.documents.map((requirement) => (
                <DocumentRow key={requirement.id} requirement={requirement} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/** `requirement`, not `document` — a prop by that name shadows the DOM global. */
function DocumentRow({ requirement }: { requirement: DocumentRequirement }) {
  const prepared = requirement.preparedByUs === true;

  return (
    <li className="flex gap-3 rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg p-3.5 shadow-fr-soft">
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
          prepared
            ? "bg-fr-green-050 text-fr-green-deep"
            : "bg-fr-blue-050 text-fr-blue",
        )}
      >
        {prepared ? "✓" : "↑"}
      </span>
      <div className="min-w-0">
        <p className="text-[14.5px] leading-[1.45] text-fr-ink">
          {requirement.label}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className={cn(
              "rounded-pill px-2 py-0.5 text-[11px] font-bold tracking-[0.01em]",
              prepared
                ? "bg-fr-green-050 text-fr-green-deep"
                : "bg-fr-blue-050 text-fr-blue-deep",
            )}
          >
            {prepared ? "We prepare for you" : "You upload"}
          </span>
          {requirement.appliesWhen && (
            <span className="text-[12.5px] text-fr-ink-2">
              {requirement.appliesWhen}
            </span>
          )}
          {requirement.sampleUrl && (
            <a
              href={requirement.sampleUrl}
              target="_blank"
              rel="noopener"
              className="text-[12.5px] font-semibold text-fr-blue underline decoration-fr-blue/30 underline-offset-2 hover:decoration-fr-blue"
            >
              View sample
              <span aria-hidden="true"> ↗</span>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
