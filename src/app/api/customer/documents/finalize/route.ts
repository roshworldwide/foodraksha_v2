import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { documentSlots, type SlotKind } from "@/lib/documents";
import { MAX_UPLOAD_BYTES, detectType } from "@/lib/files/inspect";
import {
  processPhoto,
  processSignature,
  sanitizeDocument,
  type ProcessedFile,
} from "@/lib/files/process";
import { prisma } from "@/lib/prisma";
import { loadQuestionnaire } from "@/lib/questionnaire/application";
import {
  deleteObject,
  documentKey,
  getObject,
  isStorageConfigured,
  putObject,
} from "@/lib/storage";

/**
 * Step two: the server reads the quarantined bytes, decides what they really
 * are, strips metadata, and only then writes a document the customer can see.
 * Nothing the browser said about the file is trusted here.
 */

const bodySchema = z.object({
  docType: z.string().min(1).max(120),
  key: z.string().min(1).max(300),
  fileName: z.string().min(1).max(255),
});

async function processFor(
  kind: SlotKind,
  buffer: Buffer,
  detected: NonNullable<ReturnType<typeof detectType>>,
): Promise<ProcessedFile> {
  if (kind === "photo") {
    if (detected === "application/pdf") {
      throw new UploadError("A photograph has to be a JPG or PNG, not a PDF.");
    }
    return processPhoto(buffer);
  }

  if (kind === "signature") {
    if (detected === "application/pdf") {
      throw new UploadError("A signature has to be a JPG or PNG, not a PDF.");
    }
    return processSignature(buffer);
  }

  return sanitizeDocument(buffer, detected);
}

class UploadError extends Error {}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "File storage is not switched on yet." },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }
  const { docType, key, fileName } = parsed.data;

  const context = await loadQuestionnaire(session.user.id);
  if (!context) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );
  }
  if (!context.isEditable) {
    return NextResponse.json(
      {
        error: "This application is with our team and can no longer be edited.",
      },
      { status: 409 },
    );
  }

  // The key must be one this application was given, not one it guessed.
  if (!key.startsWith(`quarantine/${context.application.id}/`)) {
    return NextResponse.json({ error: "Unknown upload" }, { status: 400 });
  }

  const slot = documentSlots(context.sections).find(
    (entry) => entry.key === docType,
  );
  if (!slot) {
    return NextResponse.json(
      { error: "That document is not part of your application." },
      { status: 404 },
    );
  }

  try {
    const raw = await getObject(key);

    if (raw.byteLength > MAX_UPLOAD_BYTES) {
      throw new UploadError("That file is larger than 10 MB.");
    }

    const detected = detectType(raw);
    if (!detected) {
      throw new UploadError(
        "That file is not a PDF, JPG or PNG. Please upload one of those.",
      );
    }

    const processed = await processFor(slot.kind, raw, detected);
    const finalKey = documentKey(
      context.application.id,
      docType,
      processed.extension,
    );
    await putObject(finalKey, processed.body, processed.contentType);

    // Replacing supersedes whatever was there, including a rejection.
    const previous = await prisma.document.findFirst({
      where: { applicationId: context.application.id, docType },
      orderBy: { uploadedAt: "desc" },
      select: { id: true, fileKey: true },
    });

    const document = previous
      ? await prisma.document.update({
          where: { id: previous.id },
          data: {
            fileKey: finalKey,
            fileName,
            mimeType: processed.contentType,
            sizeBytes: processed.body.byteLength,
            status: "PENDING",
            rejectionReason: null,
            reviewedAt: null,
            reviewedById: null,
            uploadedAt: new Date(),
          },
        })
      : await prisma.document.create({
          data: {
            applicationId: context.application.id,
            docType,
            fileKey: finalKey,
            fileName,
            mimeType: processed.contentType,
            sizeBytes: processed.body.byteLength,
            status: "PENDING",
          },
        });

    // Best effort: a leftover quarantine object costs pennies, a failed
    // upload after a successful save costs the customer their work.
    await deleteObject(key).catch(() => undefined);
    if (previous?.fileKey) {
      await deleteObject(previous.fileKey).catch(() => undefined);
    }

    return NextResponse.json({
      document: {
        id: document.id,
        docType: document.docType,
        fileName: document.fileName,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        status: document.status,
        rejectionReason: document.rejectionReason,
        uploadedAt: document.uploadedAt.toISOString(),
      },
    });
  } catch (error) {
    // Never leave a rejected file sitting in the bucket.
    await deleteObject(key).catch(() => undefined);

    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    console.error("[documents] finalize failed:", error);
    return NextResponse.json(
      { error: "We could not save that file. Please try again." },
      { status: 500 },
    );
  }
}
