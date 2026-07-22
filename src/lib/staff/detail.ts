import type { AppStatus, DocStatus, LicenceType } from "@prisma/client";
import { lastSectionEdits } from "@/lib/audit";
import { documentSlots, documentsByType } from "@/lib/documents";
import type { FieldDef } from "@/lib/fields";
import { prisma } from "@/lib/prisma";
import {
  buildMirrorMap,
  loadQuestionnaireById,
  sectionStates,
} from "@/lib/questionnaire/application";
import type { AnswerMap } from "@/lib/questionnaire/schema";

/**
 * Everything the slide-over shows, in one round of queries. Staff access is
 * flat: any staff user may open any application, so there is no ownership
 * check here by design.
 */

export interface StaffSection {
  key: string;
  title: string;
  isComplete: boolean;
  fields: FieldDef[];
  /** Field keys this section mirrors from an earlier one. */
  mirrors: Record<string, { sectionKey: string; sectionTitle: string }>;
  lastEdit: { by: string; at: string } | null;
}

export interface StaffDocument {
  id: string;
  docType: string;
  label: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: DocStatus;
  rejectionReason: string | null;
  uploadedAt: string;
  required: boolean;
}

export interface StaffDetail {
  application: {
    id: string;
    applicationNo: string;
    status: AppStatus;
    licenceType: LicenceType;
    categoryName: string;
    submittedAt: string | null;
    updatedAt: string;
  };
  customer: {
    name: string;
    mobile: string;
    email: string | null;
    businessName: string;
    city: string | null;
    state: string | null;
    lastLoginAt: string | null;
  };
  progress: { complete: number; total: number; percent: number };
  sections: StaffSection[];
  answers: AnswerMap;
  documents: StaffDocument[];
  openQueries: { id: string; message: string; raisedAt: string }[];
}

export async function loadStaffDetail(
  applicationId: string,
): Promise<StaffDetail | null> {
  const context = await loadQuestionnaireById(applicationId);
  if (!context) return null;

  const [record, edits] = await Promise.all([
    prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        submittedAt: true,
        updatedAt: true,
        customer: {
          select: {
            businessName: true,
            city: true,
            state: true,
            user: {
              select: {
                name: true,
                mobile: true,
                email: true,
                lastLoginAt: true,
              },
            },
          },
        },
        queries: {
          where: { resolvedAt: null },
          orderBy: { raisedAt: "desc" },
          select: { id: true, message: true, raisedAt: true },
        },
      },
    }),
    lastSectionEdits(applicationId),
  ]);

  if (!record) return null;

  const states = sectionStates(
    context.sections,
    context.answers,
    context.uploaded,
  );
  const mirrorMap = buildMirrorMap(context.sections);
  const byType = documentsByType(context.documents);
  const slots = documentSlots(context.sections);

  const sections: StaffSection[] = context.sections.map((section, index) => {
    const mirrors: StaffSection["mirrors"] = {};
    for (const field of section.fields) {
      const mirror = mirrorMap.get(`${section.key}:${field.key}`);
      if (mirror) mirrors[field.key] = mirror;
    }
    const edit = edits.get(section.key);

    return {
      key: section.key,
      title: section.title,
      isComplete: states[index].isComplete,
      fields: section.fields,
      mirrors,
      lastEdit: edit ? { by: edit.by.name, at: edit.at.toISOString() } : null,
    };
  });

  const documents: StaffDocument[] = slots.flatMap((slot) => {
    const document = byType.get(slot.key);
    if (!document) return [];
    return [
      {
        id: document.id,
        docType: document.docType,
        label: slot.label,
        fileName: document.fileName,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        status: document.status,
        rejectionReason: document.rejectionReason,
        uploadedAt: document.uploadedAt.toISOString(),
        required: slot.required,
      },
    ];
  });

  const complete = states.filter((state) => state.isComplete).length;

  return {
    application: {
      id: context.application.id,
      applicationNo: context.application.applicationNo,
      status: context.application.status,
      licenceType: context.application.licenceType,
      categoryName: context.application.categoryName,
      submittedAt: record.submittedAt?.toISOString() ?? null,
      updatedAt: record.updatedAt.toISOString(),
    },
    customer: {
      name: record.customer.user.name,
      mobile: record.customer.user.mobile,
      email: record.customer.user.email,
      businessName: record.customer.businessName,
      city: record.customer.city,
      state: record.customer.state,
      lastLoginAt: record.customer.user.lastLoginAt?.toISOString() ?? null,
    },
    progress: {
      complete,
      total: states.length,
      percent: states.length ? Math.round((complete / states.length) * 100) : 0,
    },
    sections,
    answers: context.answers,
    documents,
    openQueries: record.queries.map((query) => ({
      id: query.id,
      message: query.message,
      raisedAt: query.raisedAt.toISOString(),
    })),
  };
}
