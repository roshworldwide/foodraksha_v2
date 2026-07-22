import { DocumentRow } from "@/components/documents/DocumentRow";
import { PhotoCapture } from "@/components/documents/PhotoCapture";
import { SignaturePad } from "@/components/documents/SignaturePad";
import type { UploadedDocument } from "@/components/documents/upload";
import { Card, List, ListGroupHeader } from "@/components/ui";
import {
  documentSlots,
  documentsByType,
  type DocumentSummary,
} from "@/lib/documents";
import type { ResolvedSection } from "@/lib/questionnaire/application";
import { isStorageConfigured } from "@/lib/storage";

/**
 * A section made entirely of file and signature fields is a document
 * checklist, not a questionnaire page. That is decided from the field
 * definitions, so a new document section staff add behaves correctly without
 * anyone touching this file.
 */
export function isDocumentSection(section: ResolvedSection): boolean {
  return (
    section.fields.length > 0 &&
    section.fields.every(
      (field) => field.type === "file" || field.type === "signature",
    )
  );
}

function toDto(document: DocumentSummary | undefined): UploadedDocument | null {
  if (!document) return null;
  return {
    id: document.id,
    docType: document.docType,
    fileName: document.fileName,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
    status: document.status,
    rejectionReason: document.rejectionReason,
    uploadedAt: document.uploadedAt.toISOString(),
  };
}

export function DocumentSection({
  section,
  sections,
  documents,
  editable,
}: {
  section: ResolvedSection;
  sections: ResolvedSection[];
  documents: DocumentSummary[];
  editable: boolean;
}) {
  const byType = documentsByType(documents);
  const slots = documentSlots(sections).filter(
    (slot) => slot.sectionKey === section.key,
  );
  const disabled = !editable || !isStorageConfigured();

  const files = slots.filter((slot) => slot.kind === "file");
  const captures = slots.filter((slot) => slot.kind !== "file");

  return (
    <div>
      {!isStorageConfigured() && (
        <Card className="mb-6">
          <h2 className="text-title-3">Uploads are not switched on yet</h2>
          <p className="mt-1.5 text-body text-label-2">
            Object storage has not been configured for this environment. Your
            FoodRaksha agent can collect these from you directly in the
            meantime.
          </p>
        </Card>
      )}

      {files.length > 0 && (
        <div className="mb-6">
          <ListGroupHeader>Required for your business type</ListGroupHeader>
          <List>
            {files.map((slot) => (
              <DocumentRow
                key={slot.key}
                slot={slot}
                document={toDto(byType.get(slot.key))}
                disabled={disabled}
              />
            ))}
          </List>
        </div>
      )}

      {captures.map((slot) => (
        <div key={slot.key} className="mb-6 last:mb-0">
          <ListGroupHeader>{slot.label}</ListGroupHeader>
          {slot.kind === "photo" ? (
            <PhotoCapture
              docType={slot.key}
              existing={toDto(byType.get(slot.key))}
              disabled={disabled}
            />
          ) : (
            <SignaturePad
              docType={slot.key}
              existing={toDto(byType.get(slot.key))}
              disabled={disabled}
            />
          )}
        </div>
      ))}
    </div>
  );
}
