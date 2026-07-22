import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { EquipmentList } from "@/components/pdf/EquipmentList";
import { FormIX } from "@/components/pdf/FormIX";
import { PeopleList } from "@/components/pdf/PeopleList";
import { ProprietorDeclaration } from "@/components/pdf/ProprietorDeclaration";
import { RecallPlan } from "@/components/pdf/RecallPlan";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { loadQuestionnaireById } from "@/lib/questionnaire/application";
import { isStorageConfigured, putObject } from "@/lib/storage";
import {
  ANNEXURE_TITLES,
  applicableAnnexures,
  type AnnexureKey,
} from "./applicability";
import { buildAnnexureContext, type AnnexureContext } from "./data";

/**
 * Render the annexures an application needs, store them privately, and record
 * a GeneratedPdf row for each.
 *
 * One template failing is not allowed to cost the others: every render is
 * isolated, and the batch reports what worked and what did not.
 */

type PdfDocument = ReactElement<DocumentProps>;

const TEMPLATES: Record<AnnexureKey, (data: AnnexureContext) => PdfDocument> = {
  form_ix: (data) => FormIX({ data }),
  people_list: (data) => PeopleList({ data }),
  proprietor_declaration: (data) => ProprietorDeclaration({ data }),
  equipment_list: (data) => EquipmentList({ data }),
  recall_plan: (data) => RecallPlan({ data }),
};

export interface AnnexureOutcome {
  key: AnnexureKey;
  title: string;
  status: "generated" | "failed";
  generatedPdfId?: string;
  error?: string;
}

/**
 * The PDF spec wants a six-letter tag on every subset font, and the writer
 * picks it at random. Rewriting it to a fixed value per font removes one
 * source of pointless difference between two renders of the same data. The
 * replacement is the same length, so byte offsets inside the file hold.
 */
export function normaliseFontSubsetTags(pdf: Buffer): Buffer {
  // Keyed by the font it labels, so the same font always gets the same tag.
  const stableTags: Record<string, string> = {
    "Inter-Regular": "FRREGU",
    "Inter-Bold": "FRBOLD",
  };

  let out = pdf.toString("latin1");
  for (const [font, stable] of Object.entries(stableTags)) {
    out = out.replace(
      new RegExp(`[A-Z]{6}\\+${font}`, "g"),
      `${stable}+${font}`,
    );
  }

  return Buffer.from(out, "latin1");
}

/**
 * Run one job per annexure, keeping failures to themselves. A template that
 * throws costs its own document and nothing else — the rest of the batch is
 * still generated, stored and reported.
 */
export async function runIsolated<T extends string>(
  keys: T[],
  title: (key: T) => string,
  run: (key: T) => Promise<{ generatedPdfId?: string }>,
): Promise<AnnexureOutcome[]> {
  const outcomes: AnnexureOutcome[] = [];

  for (const key of keys) {
    try {
      const result = await run(key);
      outcomes.push({
        key: key as AnnexureKey,
        title: title(key),
        status: "generated",
        generatedPdfId: result.generatedPdfId,
      });
    } catch (error) {
      console.error(`[annexures] ${key} failed:`, error);
      outcomes.push({
        key: key as AnnexureKey,
        title: title(key),
        status: "failed",
        error:
          error instanceof Error
            ? error.message
            : "That document could not be produced.",
      });
    }
  }

  return outcomes;
}

function fileName(key: AnnexureKey, applicationNo: string): string {
  return `${applicationNo}-${key}.pdf`;
}

/**
 * Template rows exist so GeneratedPdf has something to point at. These
 * annexures are rendered from data rather than filled onto a blank government
 * form, so the key records that rather than a storage object.
 */
async function templateIdFor(
  key: AnnexureKey,
): Promise<{ id: string; version: number }> {
  const existing = await prisma.pdfTemplate.findFirst({
    where: { key, isActive: true },
    orderBy: { version: "desc" },
    select: { id: true, version: true },
  });
  if (existing) return existing;

  return prisma.pdfTemplate.create({
    data: {
      key,
      name: ANNEXURE_TITLES[key],
      version: 1,
      fileKey: `generated://${key}`,
      pageCount: 1,
      isCore: false,
    },
    select: { id: true, version: true },
  });
}

export async function generateAnnexures(options: {
  applicationId: string;
  staffUserId: string;
  ipAddress: string | null;
}): Promise<{ outcomes: AnnexureOutcome[] }> {
  if (!isStorageConfigured()) {
    throw new Error("Object storage is not configured");
  }

  const context = await loadQuestionnaireById(options.applicationId);
  if (!context) throw new Error("Application not found");

  const application = await prisma.application.findUniqueOrThrow({
    where: { id: options.applicationId },
    select: { submittedAt: true, category: { select: { code: true } } },
  });

  const data = await buildAnnexureContext(context, {
    categoryCode: application.category.code,
    submittedAt: application.submittedAt,
  });

  const keys = applicableAnnexures({
    constitution: data.constitution,
    categoryCode: application.category.code,
    hasEquipmentData:
      data.equipment.length > 0 && !data.installedCapacity.startsWith("___"),
    hasRecallData: data.foodCategories.length > 0,
  });

  const outcomes = await runIsolated(
    keys,
    (key) => ANNEXURE_TITLES[key],
    async (key) => {
      const buffer = normaliseFontSubsetTags(
        await renderToBuffer(TEMPLATES[key](data)),
      );
      const storageKey = `applications/${options.applicationId}/annexures/${key}.pdf`;
      await putObject(storageKey, buffer, "application/pdf");

      const template = await templateIdFor(key);

      const generated = await prisma.$transaction(async (tx) => {
        // Regenerating replaces the previous copy of the same annexure.
        await tx.generatedPdf.deleteMany({
          where: {
            applicationId: options.applicationId,
            templateId: template.id,
          },
        });

        const row = await tx.generatedPdf.create({
          data: {
            applicationId: options.applicationId,
            templateId: template.id,
            templateVersion: template.version,
            fileKey: storageKey,
            generatedById: options.staffUserId,
          },
          select: { id: true },
        });

        await writeAudit(tx, {
          userId: options.staffUserId,
          entity: "Application",
          entityId: options.applicationId,
          action: "annexure_generated",
          after: { annexure: key, fileKey: storageKey },
          ipAddress: options.ipAddress,
        });

        return row;
      });

      return { generatedPdfId: generated.id };
    },
  );

  return { outcomes };
}

export interface GeneratedAnnexure {
  id: string;
  key: string;
  title: string;
  fileName: string;
  generatedAt: string;
  generatedBy: string | null;
}

export async function listAnnexures(
  applicationId: string,
): Promise<GeneratedAnnexure[]> {
  const rows = await prisma.generatedPdf.findMany({
    where: { applicationId },
    orderBy: { generatedAt: "desc" },
    select: {
      id: true,
      generatedAt: true,
      template: { select: { key: true, name: true } },
      generatedBy: { select: { name: true } },
      application: { select: { applicationNo: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    key: row.template.key,
    title: row.template.name,
    fileName: fileName(
      row.template.key as AnnexureKey,
      row.application.applicationNo,
    ),
    generatedAt: row.generatedAt.toISOString(),
    generatedBy: row.generatedBy?.name ?? null,
  }));
}
