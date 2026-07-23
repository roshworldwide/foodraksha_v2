"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, StatusPill } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { CheckIssue } from "@/lib/filing/completeness";
import type { FilingSection } from "@/lib/filing/foscos-layout";
import type { AttachmentItem, FilingWorkspace } from "@/lib/filing/workspace";
import { copyText, useCopyFlash } from "./useClipboard";

export interface FilingWorkspaceProps {
  workspace: FilingWorkspace;
}

/**
 * The filing workspace. Designed to sit on one half of the screen with FoSCoS
 * open on the other: fields run in the portal's own order, every value is one
 * click to copy, and copied fields tick off so staff can see their place if
 * they are interrupted.
 */
export function FilingWorkspaceView({ workspace }: FilingWorkspaceProps) {
  const { copiedId, flash } = useCopyFlash();
  const [copied, setCopied] = useState<Set<string>>(new Set());

  const totalFields = useMemo(
    () =>
      workspace.sections.reduce(
        (sum, section) =>
          sum + section.fields.filter((f) => f.value !== null).length,
        0,
      ),
    [workspace.sections],
  );

  function markCopied(id: string, text: string) {
    void copyText(text).then((ok) => {
      if (!ok) return;
      flash(id);
      setCopied((current) => {
        const next = new Set(current);
        next.add(id);
        return next;
      });
    });
  }

  const copiedCount = copied.size;

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-5 px-5 py-6">
      <header>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-title-2">{workspace.customer.name}</h1>
            <p className="text-subhead text-label-2">
              {workspace.customer.businessName} ·{" "}
              {workspace.application.applicationNo}
            </p>
          </div>
          <span className="shrink-0 text-footnote text-label-2">
            {copiedCount} / {totalFields} copied
          </span>
        </div>
      </header>

      {workspace.alreadyFiled ? (
        <FiledBanner workspace={workspace} />
      ) : (
        <Completeness issues={workspace.completeness.issues} />
      )}

      <Attachments attachments={workspace.attachments} />

      {workspace.sections.map((section) => (
        <SectionBlock
          key={section.title}
          section={section}
          copiedId={copiedId}
          copiedSet={copied}
          onCopy={markCopied}
        />
      ))}

      {!workspace.alreadyFiled && (
        <FilingRecord
          applicationId={workspace.application.id}
          blocked={!workspace.completeness.ready}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── section */

function SectionBlock({
  section,
  copiedId,
  copiedSet,
  onCopy,
}: {
  section: FilingSection;
  copiedId: string | null;
  copiedSet: Set<string>;
  onCopy: (id: string, text: string) => void;
}) {
  const answered = section.fields.filter((f) => f.value !== null);
  const done = answered.every((f) => copiedSet.has(f.id));

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between gap-3 border-b-[0.5px] border-separator px-4 py-3">
        <h2 className="text-headline">
          <span className="mr-2 text-label-3">{section.step}.</span>
          {section.title}
          {done && answered.length > 0 && (
            <span aria-hidden="true" className="ml-2 text-ok">
              ✓
            </span>
          )}
        </h2>
        {section.block && (
          <Button
            size="xs"
            variant="secondary"
            onClick={() =>
              onCopy(`${section.title}:block`, section.block ?? "")
            }
          >
            {copiedId === `${section.title}:block` ? "Copied" : "Copy block"}
          </Button>
        )}
      </div>

      <ul>
        {section.fields.map((f) => (
          <FieldRow
            key={f.id}
            id={f.id}
            label={f.label}
            value={f.value}
            hint={f.hint}
            copied={copiedSet.has(f.id)}
            flashed={copiedId === f.id}
            onCopy={onCopy}
          />
        ))}
      </ul>
    </Card>
  );
}

/* ───────────────────────────────────────────────────────── field */

function FieldRow({
  id,
  label,
  value,
  hint,
  copied,
  flashed,
  onCopy,
}: {
  id: string;
  label: string;
  value: string | null;
  hint?: string;
  copied: boolean;
  flashed: boolean;
  onCopy: (id: string, text: string) => void;
}) {
  const missing = value === null;

  return (
    <li className="border-b-[0.5px] border-separator last:border-b-0">
      <button
        type="button"
        disabled={missing}
        onClick={() => value !== null && onCopy(id, value)}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2.5 text-left",
          "transition-colors focus-visible:bg-white-titanium",
          missing ? "cursor-not-allowed" : "cursor-pointer hover:bg-row-hover",
          copied && "bg-ok-bg/40",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border text-[11px]",
            copied
              ? "border-ok bg-ok text-white"
              : "border-separator text-transparent",
          )}
        >
          ✓
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-footnote text-label-2">{label}</span>
          <span
            className={cn(
              "block text-[15px] tracking-[-0.008em] break-words",
              missing && "text-label-3 italic",
            )}
          >
            {missing ? "Not answered" : value}
          </span>
          {hint && !missing && (
            <span className="mt-0.5 block text-[12px] text-label-3">
              {hint}
            </span>
          )}
        </span>

        <span
          aria-hidden={!flashed}
          className={cn(
            "shrink-0 text-footnote font-semibold",
            flashed ? "text-ok" : "text-label-3",
          )}
        >
          {flashed ? "Copied" : missing ? "" : "Copy"}
        </span>
      </button>
    </li>
  );
}

/* ─────────────────────────────────────────────── completeness */

function Completeness({ issues }: { issues: CheckIssue[] }) {
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  if (issues.length === 0) {
    return (
      <Card className="border-l-[3px] border-ok">
        <div className="flex items-center gap-2">
          <StatusPill tone="ok">Ready to file</StatusPill>
          <span className="text-subhead text-label-2">Every check passed.</span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-l-[3px]",
        errors.length > 0 ? "border-stop" : "border-wait",
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {errors.length > 0 && (
          <StatusPill tone="stop">
            {errors.length} to fix before filing
          </StatusPill>
        )}
        {warnings.length > 0 && (
          <StatusPill tone="wait">{warnings.length} to check</StatusPill>
        )}
      </div>
      <ul className="flex flex-col gap-1.5">
        {issues.map((issue, index) => (
          <li key={index} className="text-footnote">
            <span
              className={cn(
                "font-semibold",
                issue.severity === "error" ? "text-stop" : "text-wait",
              )}
            >
              {issue.label}
            </span>{" "}
            <span className="text-label-2">{issue.detail}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ────────────────────────────────────────────────── attachments */

function Attachments({ attachments }: { attachments: AttachmentItem[] }) {
  if (attachments.length === 0) {
    return (
      <Card>
        <h2 className="text-headline">Attachments</h2>
        <p className="mt-1 text-subhead text-label-2">
          No documents uploaded and no annexures generated yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <h2 className="border-b-[0.5px] border-separator px-4 py-3 text-headline">
        Attachments
      </h2>
      <ul>
        {attachments.map((item) => (
          <li
            key={item.href}
            className="flex items-center gap-3 border-b-[0.5px] border-separator px-4 py-2.5 last:border-b-0"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] tracking-[-0.008em]">
                {item.label}
                <span className="ml-2 text-[11px] text-label-3 uppercase">
                  {item.kind === "annexure" ? "generated" : "uploaded"}
                </span>
              </span>
              {item.fileName && (
                <span className="block text-footnote text-label-2">
                  {item.fileName}
                </span>
              )}
            </span>

            {item.attachable ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-footnote font-semibold text-label underline"
              >
                Open
              </a>
            ) : (
              <StatusPill tone="stop">Rejected — do not attach</StatusPill>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ──────────────────────────────────────────────── filing record */

function FilingRecord({
  applicationId,
  blocked,
}: {
  applicationId: string;
  blocked: boolean;
}) {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const referenceRef = useRef<HTMLInputElement>(null);

  async function record() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/staff/applications/${applicationId}/filing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referenceNo: reference.trim() }),
        },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error ?? "That did not save.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="text-headline">Record the filing</h2>
      <p className="mt-1 mb-4 text-subhead text-label-2">
        Once you have submitted in FoSCoS, enter the reference number it gives
        you. This marks the application filed and tells the customer.
      </p>

      {blocked && (
        <p className="mb-4 rounded-input bg-wait-bg px-4 py-3 text-footnote text-wait">
          The completeness check still has errors. You can file anyway, but fix
          them first if you can.
        </p>
      )}

      <Field
        htmlFor="filing-ref"
        label="FoSCoS reference number"
        error={error ?? undefined}
      >
        <Input
          id="filing-ref"
          ref={referenceRef}
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="e.g. 10826002000123"
          autoComplete="off"
        />
      </Field>

      {confirming ? (
        <div className="flex items-center gap-3">
          <span className="text-footnote text-label-2">
            Mark as filed with FSSAI?
          </span>
          <Button
            variant="quiet"
            size="sm"
            disabled={busy}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
          <Button size="sm" disabled={busy} onClick={() => void record()}>
            {busy ? "Recording…" : "Confirm filed"}
          </Button>
        </div>
      ) : (
        <Button
          disabled={reference.trim().length < 3}
          onClick={() => setConfirming(true)}
        >
          Mark as filed
        </Button>
      )}
    </Card>
  );
}

function FiledBanner({ workspace }: { workspace: FilingWorkspace }) {
  const filedDate = workspace.application.filedAt
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeZone: "Asia/Kolkata",
      }).format(new Date(workspace.application.filedAt))
    : null;

  return (
    <Card className="border-l-[3px] border-ok">
      <div className="flex items-center gap-2">
        <StatusPill tone="ok">Filed</StatusPill>
        {filedDate && (
          <span className="text-subhead text-label-2">on {filedDate}</span>
        )}
      </div>
      <p className="mt-2 text-footnote text-label-2">
        This application has already been lodged with FSSAI. Fields remain
        available to copy for any follow-up, but it cannot be filed again.
      </p>
    </Card>
  );
}
