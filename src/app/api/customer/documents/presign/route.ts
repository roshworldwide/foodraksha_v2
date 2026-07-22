import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { documentSlots } from "@/lib/documents";
import {
  ACCEPTED_TYPES,
  MAX_UPLOAD_BYTES,
  isAcceptedType,
} from "@/lib/files/inspect";
import { loadQuestionnaire } from "@/lib/questionnaire/application";
import {
  isStorageConfigured,
  presignUpload,
  quarantineKey,
} from "@/lib/storage";

/**
 * Step one of an upload: authorise the browser to PUT one object into
 * quarantine. The declared type and size are only a courtesy check — the bytes
 * are inspected in /finalize before anything is kept.
 */

const bodySchema = z.object({
  docType: z.string().min(1).max(120),
  contentType: z.string().min(1).max(120),
  size: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      {
        error:
          "File storage is not switched on yet. Your FoodRaksha agent can collect this from you directly.",
      },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }
  const { docType, contentType, size } = parsed.data;

  if (size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "That file is larger than 10 MB. Please send a smaller one." },
      { status: 413 },
    );
  }

  if (!isAcceptedType(contentType)) {
    return NextResponse.json(
      { error: `Upload a PDF, JPG or PNG (${ACCEPTED_TYPES.join(", ")}).` },
      { status: 415 },
    );
  }

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

  // Only slots this customer's category actually asks for.
  const slot = documentSlots(context.sections).find(
    (entry) => entry.key === docType,
  );
  if (!slot) {
    return NextResponse.json(
      { error: "That document is not part of your application." },
      { status: 404 },
    );
  }

  const key = quarantineKey(context.application.id);
  const { url, expiresInSeconds } = await presignUpload(key, contentType);

  return NextResponse.json({ uploadUrl: url, key, expiresInSeconds });
}
