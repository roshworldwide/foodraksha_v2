"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ListIcon, Progress, StatusPill } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { DocumentSlot } from "@/lib/documents";
import { DOC_STATUS } from "@/lib/status";
import { UploadFailure, uploadDocument, type UploadedDocument } from "./upload";

const ACCEPT = "application/pdf,image/jpeg,image/png";
const MAX_BYTES = 10 * 1024 * 1024;

export interface DocumentRowProps {
  slot: DocumentSlot;
  document: UploadedDocument | null;
  disabled: boolean;
}

function readableSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** One row of the inset grouped list: what we need, and what we have. */
export function DocumentRow({ slot, document, disabled }: DocumentRowProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const status = document ? DOC_STATUS[document.status] : DOC_STATUS.AWAITING;
  const busy = progress !== null;

  async function send(file: File) {
    setError(null);
    setLastFile(file);

    if (file.size > MAX_BYTES) {
      setError("That file is larger than 10 MB. Please send a smaller one.");
      setRetryable(false);
      return;
    }

    setProgress(0);
    try {
      await uploadDocument({
        docType: slot.key,
        file,
        fileName: file.name,
        onProgress: setProgress,
      });
      router.refresh();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Something went wrong with that upload.",
      );
      setRetryable(failure instanceof UploadFailure ? failure.retryable : true);
    } finally {
      setProgress(null);
    }
  }

  return (
    <li
      className="border-b-[0.5px] border-separator last:border-b-0"
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (disabled) return;
        const file = event.dataTransfer.files[0];
        if (file) void send(file);
      }}
    >
      <div
        className={cn(
          "flex items-center gap-[13px] px-4 py-[13px] transition-colors",
          dragging && "bg-white-titanium",
        )}
      >
        {document && document.mimeType.startsWith("image/") ? (
          // The src is a route that redirects to a signed, expiring URL.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/customer/documents/${document.id}/file`}
            alt=""
            className="size-[30px] shrink-0 rounded-icon object-cover"
          />
        ) : (
          <ListIcon
            tone={
              document?.status === "APPROVED"
                ? "done"
                : document?.status === "REJECTED"
                  ? "wait"
                  : document
                    ? "current"
                    : "pending"
            }
          >
            {document?.status === "APPROVED"
              ? "✓"
              : document?.status === "REJECTED"
                ? "!"
                : document
                  ? "•"
                  : "·"}
          </ListIcon>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[15px] tracking-[-0.008em]">
            {slot.label}
            {!slot.required && (
              <span className="ml-1.5 text-footnote text-label-3">
                optional
              </span>
            )}
          </p>

          {busy ? (
            <div className="mt-1.5 flex items-center gap-2">
              <Progress
                value={progress ?? 0}
                thin
                label={`Uploading ${slot.label}`}
                className="max-w-[180px]"
              />
              <span className="text-footnote text-label-2">{progress}%</span>
            </div>
          ) : document ? (
            <p className="mt-0.5 text-footnote text-label-2">
              {document.fileName} · {readableSize(document.sizeBytes)}
            </p>
          ) : (
            <p className="mt-0.5 text-footnote text-label-2">
              {slot.helpText ?? "Drag a file here, or browse. PDF, JPG or PNG."}
            </p>
          )}

          {document?.status === "REJECTED" && document.rejectionReason && (
            <p className="mt-1.5 text-footnote font-medium text-stop">
              {document.rejectionReason}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-1.5 text-footnote font-medium text-stop"
            >
              {error}
              {retryable && lastFile && (
                <button
                  type="button"
                  onClick={() => void send(lastFile)}
                  className="ml-2 cursor-pointer font-semibold text-label underline"
                >
                  Try again
                </button>
              )}
            </p>
          )}
        </div>

        <StatusPill tone={status.tone}>{status.label}</StatusPill>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          disabled={disabled || busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void send(file);
            event.target.value = "";
          }}
        />
        <Button
          variant={document ? "quiet" : "secondary"}
          size="sm"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          {document ? "Replace" : "Upload"}
        </Button>
      </div>
    </li>
  );
}
