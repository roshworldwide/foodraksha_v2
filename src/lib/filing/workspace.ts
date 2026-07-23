import type { AppStatus } from "@prisma/client";
import { listAnnexures } from "@/lib/annexures/generate";
import { documentSlots, documentsByType } from "@/lib/documents";
import { loadQuestionnaireById } from "@/lib/questionnaire/application";
import {
  checkCompleteness,
  type CompletenessResult,
  type DocumentForCheck,
} from "./completeness";
import { buildFilingLayout, type FilingSection } from "./foscos-layout";

/**
 * Everything the filing workspace needs, in one place. Staff work by
 * application; access is flat, so there is no ownership check here.
 */

export interface AttachmentItem {
  /** Route to a signed, expiring download URL. */
  href: string;
  label: string;
  kind: "uploaded" | "annexure";
  /** Uploaded documents carry a review status; annexures are always ready. */
  status: "APPROVED" | "PENDING" | "REJECTED" | "AWAITING" | "GENERATED";
  fileName: string | null;
  /** True when this document may safely be attached in the portal. */
  attachable: boolean;
}

export interface FilingWorkspace {
  application: {
    id: string;
    applicationNo: string;
    status: AppStatus;
    categoryName: string;
    filedAt: string | null;
    licenceNo: string | null;
  };
  customer: { name: string; businessName: string };
  sections: FilingSection[];
  completeness: CompletenessResult;
  attachments: AttachmentItem[];
  /** Editing is done — this application is with the authority or beyond. */
  alreadyFiled: boolean;
}

const FILED_ONWARD: AppStatus[] = [
  "FILED",
  "FSSAI_QUERY",
  "ISSUED",
  "REJECTED",
  "CLOSED",
];

export async function loadFilingWorkspace(
  applicationId: string,
): Promise<FilingWorkspace | null> {
  const context = await loadQuestionnaireById(applicationId);
  if (!context) return null;

  const [record, annexures] = await Promise.all([
    loadRecord(applicationId),
    listAnnexures(applicationId),
  ]);
  if (!record) return null;

  const slots = documentSlots(context.sections);
  const byType = documentsByType(context.documents);

  // For the completeness check: which documents are required, and where they
  // stand. A slot with no upload counts as AWAITING.
  const documentsForCheck: DocumentForCheck[] = slots.map((slot) => ({
    label: slot.label,
    required: slot.required,
    status: byType.get(slot.key)?.status ?? "AWAITING",
  }));

  const completeness = checkCompleteness(context.answers, documentsForCheck);

  // The attachment tray: uploaded documents first, then generated annexures.
  const uploaded: AttachmentItem[] = context.documents.map((document) => ({
    href: `/api/staff/documents/${document.id}/file`,
    label:
      slots.find((slot) => slot.key === document.docType)?.label ??
      document.docType,
    kind: "uploaded",
    status: document.status,
    fileName: document.fileName,
    // Never let staff attach a rejected document in the portal.
    attachable: document.status !== "REJECTED",
  }));

  const generated: AttachmentItem[] = annexures.map((annexure) => ({
    href: `/api/staff/annexures/${annexure.id}/file`,
    label: annexure.title,
    kind: "annexure",
    status: "GENERATED",
    fileName: annexure.fileName,
    attachable: true,
  }));

  return {
    application: {
      id: context.application.id,
      applicationNo: context.application.applicationNo,
      status: context.application.status,
      categoryName: context.application.categoryName,
      filedAt: record.filedAt?.toISOString() ?? null,
      licenceNo: record.licenceNo,
    },
    customer: {
      name: record.customerName,
      businessName: record.businessName,
    },
    sections: buildFilingLayout(context.answers),
    completeness,
    attachments: [...uploaded, ...generated],
    alreadyFiled: FILED_ONWARD.includes(context.application.status),
  };
}

async function loadRecord(applicationId: string) {
  const { prisma } = await import("@/lib/prisma");
  const row = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      filedAt: true,
      licenceNo: true,
      customer: {
        select: {
          businessName: true,
          user: { select: { name: true } },
        },
      },
    },
  });
  if (!row) return null;
  return {
    filedAt: row.filedAt,
    licenceNo: row.licenceNo,
    customerName: row.customer.user.name,
    businessName: row.customer.businessName,
  };
}
