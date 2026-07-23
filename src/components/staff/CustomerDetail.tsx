"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SectionForm } from "@/components/questionnaire/SectionForm";
import {
  Button,
  ButtonLink,
  Card,
  Field,
  Input,
  List,
  ListGroup,
  ListGroupHeader,
  ListIcon,
  ListRow,
  Progress,
  StatusPill,
  Textarea,
} from "@/components/ui";
import { DOC_STATUS, APP_STATUS, LICENCE_TYPE } from "@/lib/status";
import type { StaffDetail } from "@/lib/staff/detail";
import { nextStatuses } from "@/lib/status-machine";

type View =
  | { mode: "overview" }
  | { mode: "section"; key: string }
  | { mode: "query" }
  | { mode: "annexures" };

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/**
 * A client's whole file, on its own page. Clicking a row on the desk brings a
 * staff member here — every section they filled in, every document, the status
 * history and the actions (raise a query, generate the forms, issue the
 * licence) all in one place, with room to work rather than a cramped panel.
 */
export function CustomerDetail({ applicationId }: { applicationId: string }) {
  const [detail, setDetail] = useState<StaffDetail | null>(null);
  const [view, setView] = useState<View>({ mode: "overview" });
  const [notFound, setNotFound] = useState(false);

  const loaded = detail?.application.id === applicationId;

  const reload = useCallback((id: string) => {
    return fetch(`/api/staff/applications/${id}`, { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 404) {
          setNotFound(true);
          return null;
        }
        return response.ok ? ((await response.json()) as StaffDetail) : null;
      })
      .then((next) => {
        if (next) setDetail(next);
      })
      .catch(() => setNotFound(true));
  }, []);

  useEffect(() => {
    void reload(applicationId);
  }, [applicationId, reload]);

  const onChanged = useCallback(() => {
    void reload(applicationId);
  }, [applicationId, reload]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-[1180px] px-6 py-16 text-center">
        <h1 className="text-title-2">This client file could not be found.</h1>
        <p className="mt-2 text-body text-label-2">It may have been deleted.</p>
        <ButtonLink href="/staff/clients" variant="secondary" className="mt-6">
          Back to clients
        </ButtonLink>
      </div>
    );
  }

  const section =
    view.mode === "section"
      ? detail?.sections.find((entry) => entry.key === view.key)
      : undefined;

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-6">
      {/* ── Breadcrumb + header */}
      <Link
        href="/staff/clients"
        className="text-footnote font-semibold text-label-2 hover:text-label"
      >
        ‹ All clients
      </Link>

      {!loaded ? (
        <p className="mt-6 text-body text-label-2">Loading…</p>
      ) : (
        <>
          <header className="mt-3 flex flex-wrap items-start justify-between gap-4 border-b-[0.5px] border-separator pb-6">
            <div className="min-w-0">
              <h1 className="text-large-title">{detail.customer.name}</h1>
              <p className="mt-1 text-body text-label-2">
                {detail.customer.businessName} ·{" "}
                {detail.application.categoryName}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusPill tone={APP_STATUS[detail.application.status].tone}>
                  {APP_STATUS[detail.application.status].label}
                </StatusPill>
                <StatusPill tone="idle">
                  {detail.application.applicationNo}
                </StatusPill>
                {detail.customer.lastLoginAt === null && (
                  <StatusPill tone="idle">Never signed in</StatusPill>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <ButtonLink
                href={`/staff/applications/${detail.application.id}/filing`}
                variant="secondary"
                size="sm"
              >
                Filing workspace
              </ButtonLink>
              <Button
                variant="quiet"
                size="sm"
                onClick={() => setView({ mode: "query" })}
              >
                Raise query
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setView({ mode: "annexures" })}
              >
                Generate PDFs
              </Button>
            </div>
          </header>

          <div className="mt-6">
            {view.mode === "overview" && (
              <Overview
                detail={detail}
                onOpenSection={(key) => setView({ mode: "section", key })}
                onChanged={onChanged}
              />
            )}

            {view.mode === "section" && section && (
              <div className="mx-auto max-w-[720px]">
                <BackLink onClick={() => setView({ mode: "overview" })} />
                <h2 className="text-title-2">{section.title}</h2>
                {section.lastEdit && (
                  <p className="mt-1 mb-5 text-footnote text-label-2">
                    Last edited by {section.lastEdit.by},{" "}
                    {timeAgo(section.lastEdit.at)}
                  </p>
                )}
                <SectionForm
                  key={section.key}
                  applicationId={detail.application.id}
                  sectionKey={section.key}
                  endpoint={`/api/staff/applications/${detail.application.id}/section`}
                  mode="embedded"
                  fields={section.fields}
                  mirrors={section.mirrors}
                  answers={detail.answers}
                  disabled={false}
                  previousHref={null}
                  nextHref="#"
                  nextLabel="Save"
                  onSaved={() => onChanged()}
                />
              </div>
            )}

            {view.mode === "annexures" && (
              <div className="mx-auto max-w-[720px]">
                <BackLink onClick={() => setView({ mode: "overview" })} />
                <Annexures
                  applicationId={detail.application.id}
                  onGenerated={onChanged}
                />
              </div>
            )}

            {view.mode === "query" && (
              <div className="mx-auto max-w-[720px]">
                <BackLink onClick={() => setView({ mode: "overview" })} />
                <RaiseQuery
                  applicationId={detail.application.id}
                  onCancel={() => setView({ mode: "overview" })}
                  onRaised={() => {
                    setView({ mode: "overview" });
                    onChanged();
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 cursor-pointer text-subhead text-label-2 hover:text-label"
    >
      ‹ Back to client file
    </button>
  );
}

/* ──────────────────────────────────────────────────────── overview */

function Overview({
  detail,
  onOpenSection,
  onChanged,
}: {
  detail: StaffDetail;
  onOpenSection: (key: string) => void;
  onChanged: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* ── Main column: the forms and materials */}
      <div className="min-w-0">
        <ListGroup>
          <ListGroupHeader>Sections — click to view or edit</ListGroupHeader>
          <List>
            {detail.sections.map((section, index) => (
              <ListRow
                key={section.key}
                compact
                chevron
                onClick={() => onOpenSection(section.key)}
                icon={
                  <ListIcon tone={section.isComplete ? "done" : "pending"}>
                    {section.isComplete ? "✓" : index + 1}
                  </ListIcon>
                }
                title={section.title}
                subtitle={
                  section.lastEdit
                    ? `Last edited by ${section.lastEdit.by}, ${timeAgo(section.lastEdit.at)}`
                    : section.isComplete
                      ? "Complete"
                      : "Incomplete"
                }
              />
            ))}
          </List>
        </ListGroup>

        <ListGroup className="mb-0">
          <ListGroupHeader>Documents</ListGroupHeader>
          {detail.documents.length === 0 ? (
            <Card>
              <p className="text-subhead text-label-2">Nothing uploaded yet.</p>
            </Card>
          ) : (
            <List>
              {detail.documents.map((document) => (
                <DocumentReviewRow
                  key={document.id}
                  document={document}
                  onChanged={onChanged}
                />
              ))}
            </List>
          )}
        </ListGroup>
      </div>

      {/* ── Side column: state and contact */}
      <div className="min-w-0">
        <ListGroup>
          <ListGroupHeader>Progress</ListGroupHeader>
          <Card>
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-subhead text-label-2">
                Sections complete
              </span>
              <span className="text-title-3">{detail.progress.percent}%</span>
            </div>
            <Progress
              value={detail.progress.percent}
              label="Sections complete"
            />
            <p className="mt-2.5 text-footnote text-label-2">
              {detail.progress.complete} of {detail.progress.total} ·{" "}
              {LICENCE_TYPE[detail.application.licenceType]}
            </p>
          </Card>
        </ListGroup>

        <ListGroup>
          <ListGroupHeader>Status</ListGroupHeader>
          <StatusControl
            applicationId={detail.application.id}
            status={detail.application.status}
            onChanged={onChanged}
          />
        </ListGroup>

        {detail.openQueries.length > 0 && (
          <ListGroup>
            <ListGroupHeader>Open queries</ListGroupHeader>
            <List>
              {detail.openQueries.map((query) => (
                <QueryRow key={query.id} query={query} onResolved={onChanged} />
              ))}
            </List>
          </ListGroup>
        )}

        <ListGroup className="mb-0">
          <ListGroupHeader>Contact</ListGroupHeader>
          <List>
            <ListRow compact subtitle="Mobile" title={detail.customer.mobile} />
            <ListRow
              compact
              subtitle="Email"
              title={detail.customer.email ?? "—"}
            />
            <ListRow
              compact
              subtitle="Location"
              title={
                [detail.customer.city, detail.customer.state]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
            <ListRow
              compact
              subtitle="Last signed in"
              title={
                detail.customer.lastLoginAt
                  ? timeAgo(detail.customer.lastLoginAt)
                  : "Never"
              }
            />
          </List>
        </ListGroup>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── document review */

function DocumentReviewRow({
  document,
  onChanged,
}: {
  document: StaffDetail["documents"][number];
  onChanged: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function review(action: "approve" | "reject") {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/staff/documents/${document.id}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            action === "approve" ? { action } : { action, reason },
          ),
        },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error ?? "That did not save.");
        return;
      }
      setRejecting(false);
      setReason("");
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const status = DOC_STATUS[document.status];

  return (
    <li className="border-b-[0.5px] border-separator p-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <ListIcon
          tone={
            document.status === "APPROVED"
              ? "done"
              : document.status === "REJECTED"
                ? "wait"
                : "current"
          }
        >
          {document.status === "APPROVED"
            ? "✓"
            : document.status === "REJECTED"
              ? "!"
              : "•"}
        </ListIcon>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] tracking-[-0.008em]">{document.label}</p>
          <p className="mt-0.5 text-footnote text-label-2">
            <a
              href={`/api/staff/documents/${document.id}/file`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-label underline"
            >
              {document.fileName}
            </a>{" "}
            · uploaded {timeAgo(document.uploadedAt)}
          </p>
          {document.rejectionReason && (
            <p className="mt-1 text-footnote text-stop">
              {document.rejectionReason}
            </p>
          )}
        </div>

        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </div>

      {rejecting ? (
        <div className="mt-3">
          <Field
            htmlFor={`reason-${document.id}`}
            label="Reason the customer will see"
            error={error ?? undefined}
          >
            <Textarea
              id={`reason-${document.id}`}
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. The bottom of the card is cut off — please send the whole document."
            />
          </Field>
          <div className="flex gap-2">
            <Button
              variant="quiet"
              size="sm"
              disabled={busy}
              onClick={() => setRejecting(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy || reason.trim().length < 10}
              onClick={() => void review("reject")}
            >
              Send rejection
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy || document.status === "APPROVED"}
            onClick={() => void review("approve")}
          >
            Approve
          </Button>
          <Button
            variant="quiet"
            size="sm"
            disabled={busy}
            onClick={() => setRejecting(true)}
          >
            Reject
          </Button>
          {error && (
            <span role="alert" className="self-center text-footnote text-stop">
              {error}
            </span>
          )}
        </div>
      )}
    </li>
  );
}

/* ────────────────────────────────────────────────────── raise query */

function RaiseQuery({
  applicationId,
  onCancel,
  onRaised,
}: {
  applicationId: string;
  onCancel: () => void;
  onRaised: () => void;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/staff/applications/${applicationId}/query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error ?? "That did not send.");
        return;
      }
      onRaised();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="text-title-2">Raise a query</h2>
      <p className="mt-1 mb-4 text-subhead text-label-2">
        The application goes back to the customer to edit, and they are told
        what you need.
      </p>

      <Field
        htmlFor="query-message"
        label="What do you need from them?"
        error={error ?? undefined}
      >
        <Textarea
          id="query-message"
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="e.g. The water test report is from 2023. Please upload one from the last twelve months."
        />
      </Field>

      <div className="flex gap-2">
        <Button variant="quiet" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          onClick={() => void submit()}
          disabled={busy || message.trim().length < 10}
        >
          {busy ? "Sending…" : "Send query"}
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── annexures */

interface AnnexureRow {
  id: string;
  key: string;
  title: string;
  fileName: string;
  generatedAt: string;
  generatedBy: string | null;
}

interface Outcome {
  key: string;
  title: string;
  status: "generated" | "failed";
  error?: string;
}

/**
 * The supporting annexures. FoSCoS produces Form A and Form B itself, so what
 * gets generated here is what a staff member attaches alongside them.
 */
function Annexures({
  applicationId,
  onGenerated,
}: {
  applicationId: string;
  onGenerated: () => void;
}) {
  const [rows, setRows] = useState<AnnexureRow[] | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    return fetch(`/api/staff/applications/${applicationId}/annexures`, {
      cache: "no-store",
    })
      .then(async (response) =>
        response.ok
          ? ((await response.json()) as { annexures: AnnexureRow[] })
          : { annexures: [] },
      )
      .then((body) => setRows(body.annexures))
      .catch(() => setRows([]));
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/staff/applications/${applicationId}/annexures`,
        { method: "POST" },
      );
      const body = (await response.json()) as {
        outcomes?: Outcome[];
        annexures?: AnnexureRow[];
        error?: string;
      };
      if (!response.ok) {
        setError(body.error ?? "The annexures could not be generated.");
        return;
      }
      setOutcomes(body.outcomes ?? []);
      setRows(body.annexures ?? []);
      onGenerated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Letterhead applicationId={applicationId} onSaved={onGenerated} />

      <h2 className="text-title-2">Annexures</h2>
      <p className="mt-1 mb-4 text-subhead text-label-2">
        The supporting documents that get attached to the FoSCoS application.
        Which ones appear depends on the constitution and the kind of business.
      </p>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-input bg-stop-bg px-4 py-3 text-footnote font-medium text-stop"
        >
          {error}
        </p>
      )}

      {outcomes.length > 0 && (
        <List className="mb-4">
          {outcomes.map((outcome) => (
            <ListRow
              key={outcome.key}
              compact
              icon={
                <ListIcon
                  tone={outcome.status === "generated" ? "done" : "wait"}
                >
                  {outcome.status === "generated" ? "✓" : "!"}
                </ListIcon>
              }
              title={outcome.title}
              subtitle={
                outcome.status === "generated"
                  ? "Generated"
                  : (outcome.error ?? "Could not be produced")
              }
            />
          ))}
        </List>
      )}

      {rows && rows.length > 0 && (
        <ListGroup>
          <ListGroupHeader>Ready to download</ListGroupHeader>
          <List>
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-3 border-b-[0.5px] border-separator px-4 py-[13px] last:border-b-0"
              >
                <ListIcon tone="done">↓</ListIcon>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] tracking-[-0.008em]">{row.title}</p>
                  <p className="mt-0.5 text-footnote text-label-2">
                    {row.generatedBy
                      ? `By ${row.generatedBy}, ${timeAgo(row.generatedAt)}`
                      : timeAgo(row.generatedAt)}
                  </p>
                </div>
                <a
                  href={`/api/staff/annexures/${row.id}/file`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-footnote font-semibold text-label underline"
                >
                  Open PDF
                </a>
              </li>
            ))}
          </List>
        </ListGroup>
      )}

      {rows && rows.length === 0 && outcomes.length === 0 && (
        <Card className="mb-4">
          <p className="text-subhead text-label-2">Nothing generated yet.</p>
        </Card>
      )}

      <Button onClick={() => void generate()} disabled={busy} fullWidth>
        {busy
          ? "Generating…"
          : rows && rows.length > 0
            ? "Regenerate annexures"
            : "Generate annexures"}
      </Button>
      <p className="mt-3 text-center text-footnote text-label-2">
        Regenerating replaces the previous copies. The same answers always
        produce the same document.
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────── letterhead */

/**
 * The letterhead every generated annexure is printed on. FSSAI guidance wants
 * name, address, contact details and CIN, and it is the client's letterhead —
 * so it is configured here per client rather than hardcoded anywhere. The logo
 * is uploaded as the "Business logo" document.
 */
function Letterhead({
  applicationId,
  onSaved,
}: {
  applicationId: string;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    return fetch(`/api/staff/applications/${applicationId}`, {
      cache: "no-store",
    })
      .then(async (response) => (response.ok ? await response.json() : null))
      .then((detail: StaffDetail | null) => {
        const answers = detail?.answers ?? {};
        const read = (key: string) =>
          typeof answers[key] === "string" ? (answers[key] as string) : "";
        setValues({
          name: read("letterhead.name"),
          address: read("letterhead.address"),
          contact: read("letterhead.contact"),
          cin: read("letterhead.cin"),
        });
      })
      .catch(() => setValues({ name: "", address: "", contact: "", cin: "" }));
  }, [applicationId]);

  useEffect(() => {
    if (open && !values) void load();
  }, [open, values, load]);

  async function save() {
    if (!values) return;
    setBusy(true);
    setSaved(false);
    try {
      const response = await fetch(
        `/api/staff/applications/${applicationId}/letterhead`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      if (response.ok) {
        setSaved(true);
        onSaved();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="cursor-pointer text-footnote font-semibold text-label underline"
      >
        {open ? "Hide letterhead settings" : "Letterhead settings"}
      </button>

      {open && values && (
        <Card className="mt-3">
          <p className="mb-4 text-footnote text-label-2">
            Printed at the top of every annexure. Blank fields fall back to the
            business and premises answers.
          </p>

          {(
            [
              ["name", "Business name"],
              ["address", "Address"],
              ["contact", "Contact details"],
              ["cin", "CIN"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} htmlFor={`lh-${key}`} label={label}>
              <Input
                id={`lh-${key}`}
                value={values[key]}
                onChange={(event) =>
                  setValues({ ...values, [key]: event.target.value })
                }
              />
            </Field>
          ))}

          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => void save()} disabled={busy}>
              {busy ? "Saving…" : "Save letterhead"}
            </Button>
            {saved && (
              <span className="text-footnote text-label-2">
                Saved — regenerate to apply
              </span>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── status control */

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Awaiting review",
  UNDER_REVIEW: "Under review",
  QUERY_RAISED: "Query raised",
  READY_TO_FILE: "Ready to file",
  FILED: "Filed with FSSAI",
  FSSAI_QUERY: "FSSAI query",
  ISSUED: "Licence issued",
  REJECTED: "Rejected",
  CLOSED: "Closed",
};

/**
 * The status control. Shows the current status and only the transitions the
 * machine allows from here — never an illegal move. Filing and licence issue
 * have their own richer flows, so they are pointed at rather than done inline.
 */
function StatusControl({
  applicationId,
  status,
  onChanged,
}: {
  applicationId: string;
  status: StaffDetail["application"]["status"];
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const allowed = nextStatuses(status);

  async function change(to: string) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/staff/applications/${applicationId}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to, note: note.trim() || undefined }),
        },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error ?? "That change was not allowed.");
        return;
      }
      setNote("");
      setPending(null);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <StatusPill tone={APP_STATUS[status].tone}>
          {APP_STATUS[status].label}
        </StatusPill>
      </div>

      {allowed.length === 0 ? (
        <p className="text-footnote text-label-2">
          This is a final status — nothing moves from here.
        </p>
      ) : (
        <>
          {status === "FILED" && (
            <p className="mb-3 text-footnote text-label-2">
              To issue the licence, use “Issue licence” below.
            </p>
          )}

          <label
            htmlFor="status-note"
            className="mb-1.5 block text-footnote font-semibold text-label-2"
          >
            Note (optional)
          </label>
          <Textarea
            id="status-note"
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Recorded on the status change and shown in the history."
            className="mb-3"
          />

          {error && (
            <p
              role="alert"
              className="mb-3 text-footnote font-medium text-stop"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {allowed.map((to) =>
              pending === to ? (
                <span key={to} className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="quiet"
                    disabled={busy}
                    onClick={() => setPending(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => void change(to)}
                  >
                    Confirm {STATUS_LABEL[to]}
                  </Button>
                </span>
              ) : (
                <Button
                  key={to}
                  size="sm"
                  variant={to === "REJECTED" ? "quiet" : "secondary"}
                  disabled={busy}
                  onClick={() => setPending(to)}
                >
                  {STATUS_LABEL[to]}
                </Button>
              ),
            )}
          </div>
        </>
      )}

      {status === "FILED" && (
        <div className="mt-4 border-t-[0.5px] border-separator pt-4">
          <IssueLicence applicationId={applicationId} onIssued={onChanged} />
        </div>
      )}
    </Card>
  );
}

/* ──────────────────────────────────────────────────── issue licence */

function IssueLicence({
  applicationId,
  onIssued,
}: {
  applicationId: string;
  onIssued: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [licenceNo, setLicenceNo] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!file) {
      setError("Attach the licence PDF from FSSAI.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("licenceNo", licenceNo.trim());
      form.set("expiresAt", expiresAt);
      form.set("file", file);
      const response = await fetch(
        `/api/staff/applications/${applicationId}/licence`,
        { method: "POST", body: form },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error ?? "That did not save.");
        return;
      }
      onIssued();
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
        Issue licence
      </Button>
    );
  }

  return (
    <div>
      <h4 className="mb-3 text-headline">Issue the licence</h4>
      <Field htmlFor="lic-no" label="Licence number">
        <Input
          id="lic-no"
          value={licenceNo}
          onChange={(event) => setLicenceNo(event.target.value)}
          placeholder="e.g. 10826002000123"
        />
      </Field>
      <Field htmlFor="lic-exp" label="Valid until">
        <Input
          id="lic-exp"
          type="date"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
        />
      </Field>
      <Field htmlFor="lic-file" label="Licence PDF from FSSAI">
        <input
          id="lic-file"
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="text-footnote"
        />
      </Field>

      {error && (
        <p role="alert" className="mb-3 text-footnote font-medium text-stop">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="quiet"
          disabled={busy}
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={busy || licenceNo.trim().length < 3 || !expiresAt || !file}
          onClick={() => void submit()}
        >
          {busy ? "Issuing…" : "Confirm issued"}
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── query row */

function QueryRow({
  query,
  onResolved,
}: {
  query: { id: string; message: string; raisedAt: string };
  onResolved: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function resolve() {
    setBusy(true);
    try {
      const response = await fetch(`/api/staff/queries/${query.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (response.ok) onResolved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="border-b-[0.5px] border-separator p-4 last:border-b-0">
      <p className="text-[15px] tracking-[-0.008em]">{query.message}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-footnote text-label-2">
          Raised {timeAgo(query.raisedAt)}
        </span>
        <Button
          size="xs"
          variant="secondary"
          disabled={busy}
          onClick={() => void resolve()}
        >
          {busy ? "…" : "Mark resolved"}
        </Button>
      </div>
    </li>
  );
}
