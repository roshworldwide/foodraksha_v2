"use client";

/**
 * Browser upload: authorise, PUT straight to storage, then hand the key back
 * for inspection. The file never passes through the application server on the
 * way in, and nothing is recorded until the server has read the bytes.
 */

export interface UploadedDocument {
  id: string;
  docType: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: "AWAITING" | "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  uploadedAt: string;
}

export class UploadFailure extends Error {
  constructor(
    message: string,
    /** Retrying a network failure is worth offering; a rejected file is not. */
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

async function errorMessage(response: Response, fallback: string) {
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  return body.error ?? fallback;
}

function put(
  url: string,
  file: Blob,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url, true);
    request.setRequestHeader("Content-Type", file.type);

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else
        reject(
          new UploadFailure(
            `Storage refused the upload (${request.status}).`,
            true,
          ),
        );
    });
    request.addEventListener("error", () =>
      reject(new UploadFailure("The upload was interrupted.", true)),
    );
    request.addEventListener("abort", () =>
      reject(new UploadFailure("The upload was cancelled.", true)),
    );

    request.send(file);
  });
}

export async function uploadDocument(options: {
  docType: string;
  file: Blob;
  fileName: string;
  onProgress?: (percent: number) => void;
}): Promise<UploadedDocument> {
  const { docType, file, fileName } = options;
  const onProgress = options.onProgress ?? (() => undefined);

  onProgress(0);

  const presign = await fetch("/api/customer/documents/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docType, contentType: file.type, size: file.size }),
  });

  if (!presign.ok) {
    throw new UploadFailure(
      await errorMessage(presign, "We could not start that upload."),
      presign.status >= 500,
    );
  }

  const { uploadUrl, key } = (await presign.json()) as {
    uploadUrl: string;
    key: string;
  };

  await put(uploadUrl, file, onProgress);

  const finalize = await fetch("/api/customer/documents/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docType, key, fileName }),
  });

  if (!finalize.ok) {
    throw new UploadFailure(
      await errorMessage(finalize, "We could not save that file."),
      finalize.status >= 500,
    );
  }

  onProgress(100);
  const body = (await finalize.json()) as { document: UploadedDocument };
  return body.document;
}
