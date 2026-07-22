"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionForm } from "@/components/questionnaire/SectionForm";
import {
  Button,
  Card,
  Field,
  List,
  ListGroup,
  ListGroupHeader,
  ListIcon,
  ListRow,
  Progress,
  SlideOver,
  StatusPill,
  Textarea,
} from "@/components/ui";
import { DOC_STATUS, APP_STATUS, LICENCE_TYPE } from "@/lib/status";
import type { StaffDetail } from "@/lib/staff/detail";

type View =
  { mode: "overview" } | { mode: "section"; key: string } | { mode: "query" };

export interface CustomerSlideOverProps {
  applicationId: string | null;
  onClose: () => void;
}

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/**
 * Opening a customer fetches their detail; it never navigates. That is what
 * keeps the list underneath exactly where staff left it — scroll position,
 * filter chip, search term, sort and page all survive untouched.
 */
export function CustomerSlideOver({
  applicationId,
  onClose,
}: CustomerSlideOverProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<StaffDetail | null>(null);
  // View and "something changed" are held against the customer they belong to,
  // so opening a different row starts clean without an effect resetting state.
  const [viewState, setViewState] = useState<{ id: string | null; view: View }>(
    { id: null, view: { mode: "overview" } },
  );
  const [changedFor, setChangedFor] = useState<string | null>(null);

  const loaded = detail?.application.id === applicationId;
  const view: View =
    viewState.id === applicationId ? viewState.view : { mode: "overview" };
  const changed = changedFor !== null && changedFor === applicationId;

  function setView(next: View) {
    setViewState({ id: applicationId, view: next });
  }

  const reload = useCallback((id: string) => {
    return fetch(`/api/staff/applications/${id}`, { cache: "no-store" })
      .then(async (response) =>
        response.ok ? ((await response.json()) as StaffDetail) : null,
      )
      .then((next) => setDetail(next))
      .catch(() => setDetail(null));
  }, []);

  useEffect(() => {
    if (!applicationId) return;
    // Every state update happens in the promise continuation, not in the
    // effect body — one render when the data lands, not a cascade.
    void reload(applicationId);
  }, [applicationId, reload]);

  function handleClose() {
    onClose();
    // Only once the panel is closed, and only if something actually moved.
    if (changed) router.refresh();
  }

  const section =
    view.mode === "section"
      ? detail?.sections.find((entry) => entry.key === view.key)
      : undefined;

  return (
    <SlideOver
      open={applicationId !== null}
      onClose={handleClose}
      title={loaded ? (detail?.customer.name ?? "") : "Loading…"}
      subtitle={
        detail && loaded
          ? `${detail.customer.businessName} · ${detail.application.categoryName}`
          : undefined
      }
      meta={
        detail && loaded ? (
          <>
            <StatusPill tone={APP_STATUS[detail.application.status].tone}>
              {APP_STATUS[detail.application.status].label}
            </StatusPill>
            <StatusPill tone="idle">
              {detail.application.applicationNo}
            </StatusPill>
            {detail.customer.lastLoginAt === null && (
              <StatusPill tone="idle">Never signed in</StatusPill>
            )}
          </>
        ) : undefined
      }
      footer={
        detail && loaded && view.mode === "overview" ? (
          <>
            <Button
              variant="quiet"
              className="flex-1"
              onClick={() => setView({ mode: "query" })}
            >
              Raise Query
            </Button>
            <Button
              variant="primary"
              className="flex-[1.4]"
              disabled
              title="Arrives with the PDF engine"
            >
              Generate PDFs
            </Button>
          </>
        ) : undefined
      }
    >
      {!loaded && <p className="text-body text-label-2">Loading…</p>}

      {detail && loaded && view.mode === "overview" && (
        <Overview
          detail={detail}
          onOpenSection={(key) => setView({ mode: "section", key })}
          onChanged={() => {
            setChangedFor(applicationId);
            if (applicationId) void reload(applicationId);
          }}
        />
      )}

      {detail && loaded && view.mode === "section" && section && (
        <div>
          <button
            type="button"
            onClick={() => setView({ mode: "overview" })}
            className="mb-4 cursor-pointer text-subhead text-label-2 hover:text-label"
          >
            ‹ Back to customer
          </button>

          <h3 className="text-title-3">{section.title}</h3>
          {section.lastEdit && (
            <p className="mt-1 mb-4 text-footnote text-label-2">
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
            onSaved={(info) => {
              if (info.editedBy) setChangedFor(applicationId);
            }}
          />
        </div>
      )}

      {detail && loaded && view.mode === "query" && (
        <RaiseQuery
          applicationId={detail.application.id}
          onCancel={() => setView({ mode: "overview" })}
          onRaised={() => {
            setChangedFor(applicationId);
            setView({ mode: "overview" });
            void reload(detail.application.id);
          }}
        />
      )}
    </SlideOver>
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
    <>
      <ListGroup>
        <ListGroupHeader>Progress</ListGroupHeader>
        <Card>
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-subhead text-label-2">Sections complete</span>
            <span className="text-title-3">{detail.progress.percent}%</span>
          </div>
          <Progress value={detail.progress.percent} label="Sections complete" />
          <p className="mt-2.5 text-footnote text-label-2">
            {detail.progress.complete} of {detail.progress.total} ·{" "}
            {LICENCE_TYPE[detail.application.licenceType]}
          </p>
        </Card>
      </ListGroup>

      {detail.openQueries.length > 0 && (
        <ListGroup>
          <ListGroupHeader>Open queries</ListGroupHeader>
          <List>
            {detail.openQueries.map((query) => (
              <ListRow
                key={query.id}
                compact
                title={query.message}
                subtitle={`Raised ${timeAgo(query.raisedAt)}`}
              />
            ))}
          </List>
        </ListGroup>
      )}

      <ListGroup>
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
    </>
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
      <button
        type="button"
        onClick={onCancel}
        className="mb-4 cursor-pointer text-subhead text-label-2 hover:text-label"
      >
        ‹ Back to customer
      </button>

      <h3 className="text-title-3">Raise a query</h3>
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
