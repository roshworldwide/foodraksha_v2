"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, Label } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { FieldDef } from "@/lib/fields";
import { formatAnswerLine } from "@/lib/questionnaire/format";
import type { AnswerMap, AnswerValue } from "@/lib/questionnaire/schema";
import { validateField } from "@/lib/questionnaire/validation";
import { FieldControl } from "./FieldControl";

const DEBOUNCE_MS = 800;
const RETRY_MS = 4000;

export interface MirrorInfo {
  sectionKey: string;
  sectionTitle: string;
}

export interface SectionFormProps {
  applicationId: string;
  sectionKey: string;
  /** Which save endpoint to post to — the customer's, or the staff one. */
  endpoint?: string;
  /** "embedded" drops the wizard footer, for the staff slide-over. */
  mode?: "wizard" | "embedded";
  onSaved?: (info: {
    completedSections: string[];
    editedBy: string | null;
  }) => void;
  fields: FieldDef[];
  /** Keyed by field key — set when an earlier section already asked for it. */
  mirrors: Record<string, MirrorInfo>;
  /** Every answer on the application, so mirrored values can be shown. */
  answers: AnswerMap;
  disabled: boolean;
  previousHref: string | null;
  nextHref: string;
  nextLabel: string;
}

type SaveState = "idle" | "saving" | "saved" | "retrying";

/** Two half-width fields share a row; everything else takes the full width. */
function layoutRows(fields: FieldDef[]): FieldDef[][] {
  const rows: FieldDef[][] = [];
  let index = 0;
  while (index < fields.length) {
    const field = fields[index];
    const next = fields[index + 1];
    if (field.width === "half" && next?.width === "half") {
      rows.push([field, next]);
      index += 2;
    } else {
      rows.push([field]);
      index += 1;
    }
  }
  return rows;
}

export function SectionForm({
  applicationId,
  sectionKey,
  endpoint = "/api/customer/application/section",
  mode = "wizard",
  onSaved,
  fields,
  mirrors,
  answers,
  disabled,
  previousHref,
  nextHref,
  nextLabel,
}: SectionFormProps) {
  const router = useRouter();

  const [values, setValues] = useState<AnswerMap>(answers);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [blocking, setBlocking] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [conflict, setConflict] = useState<string | null>(null);

  // Refs carry the live values into callbacks that outlive a render.
  const valuesRef = useRef(values);
  const revisionRef = useRef(0);
  const savedRevisionRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const completedRef = useRef<string>("");

  const isDirty = () => revisionRef.current !== savedRevisionRef.current;

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const askedFields = fields.filter((field) => !mirrors[field.key]);

  // Holds the current save implementation so that timers and listeners
  // registered on an earlier render still call the latest one.
  const saveRef = useRef<
    (validate: boolean) => Promise<Record<string, string>>
  >(async () => ({}));

  /** Saves run one at a time, in order — never two writes in flight. */
  const enqueue = useCallback(
    (validate: boolean): Promise<Record<string, string>> => {
      const run = chainRef.current.then(() => saveRef.current(validate));
      chainRef.current = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
    [],
  );

  /** Each request carries the whole section, so a retry loses nothing. */
  const save = async (validate: boolean): Promise<Record<string, string>> => {
    const revision = revisionRef.current;
    const payload = Object.fromEntries(
      askedFields.map((field) => [
        field.key,
        valuesRef.current[field.key] ?? null,
      ]),
    );

    setSaveState("saving");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          applicationId,
          sectionKey,
          values: payload,
          revision,
          validate,
        }),
      });

      if (response.status === 409) {
        const body = (await response.json()) as { error?: string };
        setConflict(body.error ?? "This application can no longer be edited.");
        setSaveState("idle");
        return {};
      }

      if (!response.ok) throw new Error(`save failed: ${response.status}`);

      const body = (await response.json()) as {
        revision: number;
        completedSections: string[];
        errors: Record<string, string>;
        editedBy?: string | null;
      };

      // Ignore a response that lost the race with a newer one.
      if (body.revision >= savedRevisionRef.current) {
        savedRevisionRef.current = body.revision;
      }
      setSaveState(isDirty() ? "saving" : "saved");

      onSaved?.({
        completedSections: body.completedSections,
        editedBy: body.editedBy ?? null,
      });

      // Refresh the sidebar only when completion actually moved. The staff
      // slide-over refreshes nothing: the list underneath must not move.
      const signature = body.completedSections.slice().sort().join(",");
      if (signature !== completedRef.current) {
        completedRef.current = signature;
        if (mode === "wizard") router.refresh();
      }

      return body.errors ?? {};
    } catch {
      // Nothing is lost: the answers are still in state and the next
      // attempt sends the whole section again.
      setSaveState("retrying");
      window.setTimeout(() => {
        if (isDirty()) void enqueue(false);
      }, RETRY_MS);
      return {};
    }
  };

  useEffect(() => {
    saveRef.current = save;
  });

  /** Send everything outstanding before leaving this section. */
  const flush = useCallback(async () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await enqueue(false).catch(() => ({}));
  }, [enqueue]);

  function setValue(field: FieldDef, next: AnswerValue) {
    revisionRef.current += 1;
    setValues((current) => ({ ...current, [field.key]: next }));
    setBlocking((current) => {
      if (!current[field.key]) return current;
      const rest = { ...current };
      delete rest[field.key];
      return rest;
    });

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      void enqueue(false);
    }, DEBOUNCE_MS);
  }

  // Unsaved work must survive a closed tab or a rapid click away.
  useEffect(() => {
    function handleUnload(event: BeforeUnloadEvent) {
      if (isDirty()) event.preventDefault();
    }
    function handleHide() {
      if (isDirty()) void enqueue(false);
    }
    function handleOnline() {
      if (isDirty()) void enqueue(false);
    }
    function handleVisibility() {
      if (document.visibilityState === "hidden") handleHide();
    }

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleHide);
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleHide);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enqueue]);

  async function handleContinue() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const errors = await enqueue(true);
    if (Object.keys(errors).length > 0) {
      setBlocking(errors);
      const first = askedFields.find((field) => errors[field.key]);
      if (first) {
        document.getElementById(first.key)?.focus();
        document
          .getElementById(`field-${first.key}`)
          ?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      return;
    }
    if (mode === "embedded") return;
    router.push(nextHref);
  }

  async function handleBack() {
    if (!previousHref) return;
    await flush();
    router.push(previousHref);
  }

  const rows = layoutRows(fields);

  return (
    <div>
      {conflict && (
        <p
          role="alert"
          className="mb-5 rounded-input bg-wait-bg px-4 py-3 text-footnote font-medium text-wait"
        >
          {conflict}
        </p>
      )}

      {rows.map((row) => (
        <div
          key={row.map((field) => field.key).join("|")}
          className={cn(
            row.length === 2 &&
              "grid gap-x-5 [grid-template-columns:repeat(2,minmax(0,1fr))]",
          )}
        >
          {row.map((field) => {
            const mirror = mirrors[field.key];
            const value = values[field.key];
            const warning =
              touched[field.key] && !blocking[field.key]
                ? validateField(field, value)
                : null;
            const message = blocking[field.key] ?? warning;

            if (mirror) {
              return (
                <MirroredField
                  key={field.key}
                  field={field}
                  value={value}
                  mirror={mirror}
                />
              );
            }

            return (
              <div
                key={field.key}
                id={`field-${field.key}`}
                className="mb-[18px]"
                // Warnings appear once a field has been visited, not while
                // the customer is still on their way to filling it in.
                onBlur={() =>
                  setTouched((current) =>
                    current[field.key]
                      ? current
                      : { ...current, [field.key]: true },
                  )
                }
              >
                <Label
                  htmlFor={field.key}
                  id={`${field.key}-label`}
                  className="mb-[7px]"
                >
                  {field.label}
                  {!field.required && (
                    <span className="ml-1.5 font-normal text-label-3">
                      optional
                    </span>
                  )}
                </Label>

                <FieldControl
                  field={field}
                  value={value}
                  onChange={(next) => setValue(field, next)}
                  invalid={Boolean(message)}
                  disabled={disabled}
                  describedBy={
                    message
                      ? `${field.key}-message`
                      : field.helpText
                        ? `${field.key}-help`
                        : undefined
                  }
                />

                {message ? (
                  <p
                    id={`${field.key}-message`}
                    role={blocking[field.key] ? "alert" : undefined}
                    className="mt-[7px] pl-0.5 text-footnote font-medium text-stop"
                  >
                    {message}
                  </p>
                ) : (
                  field.helpText && (
                    <p
                      id={`${field.key}-help`}
                      className="mt-[7px] pl-0.5 text-footnote text-label-2"
                    >
                      {field.helpText}
                    </p>
                  )
                )}
              </div>
            );
          })}
        </div>
      ))}

      {mode === "embedded" ? (
        <div className="mt-6 flex items-center gap-3 border-t-[0.5px] border-separator pt-5">
          <Button size="sm" onClick={handleContinue} disabled={disabled}>
            Save section
          </Button>
          <SaveIndicator state={saveState} />
        </div>
      ) : (
        <div className="mt-8 flex items-center gap-3 border-t-[0.5px] border-separator pt-6">
          {previousHref ? (
            <Button variant="quiet" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <ButtonLink href="/dashboard" variant="quiet">
              Dashboard
            </ButtonLink>
          )}

          <Button onClick={handleContinue} disabled={disabled}>
            {nextLabel}
          </Button>

          <SaveIndicator state={saveState} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── sub-views */

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;

  const copy =
    state === "saving"
      ? "Saving…"
      : state === "saved"
        ? "Saved"
        : "Not saved — retrying";

  return (
    <span
      aria-live="polite"
      className={cn(
        "ml-auto text-footnote",
        state === "retrying" ? "text-stop" : "text-label-2",
      )}
    >
      {copy}
    </span>
  );
}

/** Asked once, shown wherever else it is needed. Never typed twice. */
function MirroredField({
  field,
  value,
  mirror,
}: {
  field: FieldDef;
  value: AnswerValue | undefined;
  mirror: MirrorInfo;
}) {
  return (
    <div className="mb-[18px]">
      <Label className="mb-[7px]">{field.label}</Label>
      <div className="rounded-input border-[0.5px] border-separator bg-white-titanium-lt px-4 py-[14px]">
        <p className="text-[17px] tracking-[-0.011em]">
          {formatAnswerLine(field, value)}
        </p>
        <p className="mt-1 text-footnote text-label-2">
          Answered in {mirror.sectionTitle} —{" "}
          <a
            href={`/application/${mirror.sectionKey}`}
            className="font-semibold text-label underline"
          >
            edit there
          </a>
        </p>
      </div>
    </div>
  );
}
