import type { DocStatus } from "@prisma/client";
import type { FieldDef } from "@/lib/fields";
import { prisma } from "@/lib/prisma";
import type { ResolvedSection } from "@/lib/questionnaire/application";

/**
 * Every file the customer owes us is declared as a `file` or `signature` field
 * on a FormSection, so the required list follows the same category rules as
 * the questions — a manufacturer is asked for a layout plan, a retailer is not.
 */

export type SlotKind = "file" | "photo" | "signature";

export interface DocumentSlot {
  /** Matches Document.docType and the field key. */
  key: string;
  label: string;
  helpText?: string;
  required: boolean;
  kind: SlotKind;
  sectionKey: string;
  sectionTitle: string;
}

export interface DocumentSummary {
  id: string;
  docType: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: DocStatus;
  rejectionReason: string | null;
  uploadedAt: Date;
}

/** Photographs need the crop tool; signatures need the pad. */
function kindFor(field: FieldDef): SlotKind {
  if (field.type === "signature") return "signature";
  return field.key === "applicant.photo" ? "photo" : "file";
}

export function documentSlots(sections: ResolvedSection[]): DocumentSlot[] {
  const slots: DocumentSlot[] = [];
  const seen = new Set<string>();

  for (const section of sections) {
    for (const field of section.fields) {
      if (field.type !== "file" && field.type !== "signature") continue;
      // Asked once, like every other field.
      if (seen.has(field.key)) continue;
      seen.add(field.key);

      slots.push({
        key: field.key,
        label: field.label,
        helpText: field.helpText,
        required: field.required,
        kind: kindFor(field),
        sectionKey: section.key,
        sectionTitle: section.title,
      });
    }
  }

  return slots;
}

export async function listDocuments(
  applicationId: string,
): Promise<DocumentSummary[]> {
  return prisma.document.findMany({
    where: { applicationId },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      docType: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      status: true,
      rejectionReason: true,
      uploadedAt: true,
    },
  });
}

/** Latest upload per slot — a replacement supersedes what came before. */
export function documentsByType(
  documents: DocumentSummary[],
): Map<string, DocumentSummary> {
  const latest = new Map<string, DocumentSummary>();
  for (const document of documents) {
    if (!latest.has(document.docType)) latest.set(document.docType, document);
  }
  return latest;
}

/**
 * Slots the customer has satisfied. A rejected document does not count: they
 * have to send us a readable one.
 */
export function satisfiedSlots(
  documents: DocumentSummary[],
): ReadonlySet<string> {
  const satisfied = new Set<string>();
  for (const [docType, document] of documentsByType(documents)) {
    if (document.status !== "REJECTED") satisfied.add(docType);
  }
  return satisfied;
}
