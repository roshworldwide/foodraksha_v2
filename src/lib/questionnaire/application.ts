import type { AppStatus, LicenceType } from "@prisma/client";
import {
  listDocuments,
  satisfiedSlots,
  type DocumentSummary,
} from "@/lib/documents";
import type { FieldDef } from "@/lib/fields";
import { prisma } from "@/lib/prisma";
import { parseAnswers, parseFields, type AnswerMap } from "./schema";
import { isSectionComplete } from "./validation";

export interface ResolvedSection {
  key: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isCore: boolean;
  fields: FieldDef[];
}

export interface QuestionnaireContext {
  application: {
    id: string;
    applicationNo: string;
    status: AppStatus;
    licenceType: LicenceType;
    categoryName: string;
    completedSections: string[];
  };
  /** Core sections plus this category's extras, in order. */
  sections: ResolvedSection[];
  answers: AnswerMap;
  /** Uploaded files, newest first. */
  documents: DocumentSummary[];
  /** Slots that already hold an acceptable file. */
  uploaded: ReadonlySet<string>;
  /** Editing is closed once the application is with staff or the authority. */
  isEditable: boolean;
}

/** Statuses where the customer still owns the answers. */
const EDITABLE: AppStatus[] = ["DRAFT", "QUERY_RAISED"];

/**
 * Core sections for everyone, plus the extras this category needs. A
 * restaurant never sees the equipment-capacity section.
 */
export async function resolveSections(
  extraSections: string[],
): Promise<ResolvedSection[]> {
  const rows = await prisma.formSection.findMany({
    where: {
      OR: [{ isCore: true }, { key: { in: extraSections } }],
    },
    orderBy: { sortOrder: "asc" },
  });

  return rows.map((row) => ({
    key: row.key,
    title: row.title,
    description: row.description,
    sortOrder: row.sortOrder,
    isCore: row.isCore,
    fields: parseFields(row.fields, row.key),
  }));
}

type ApplicationRow = {
  id: string;
  applicationNo: string;
  status: AppStatus;
  licenceType: LicenceType;
  data: unknown;
  completedSections: string[];
  category: { name: string; extraSections: string[] };
};

const APPLICATION_SELECT = {
  id: true,
  applicationNo: true,
  status: true,
  licenceType: true,
  data: true,
  completedSections: true,
  category: { select: { name: true, extraSections: true } },
} as const;

async function buildContext(
  application: ApplicationRow,
): Promise<QuestionnaireContext> {
  const [sections, documents] = await Promise.all([
    resolveSections(application.category.extraSections),
    listDocuments(application.id),
  ]);

  return {
    application: {
      id: application.id,
      applicationNo: application.applicationNo,
      status: application.status,
      licenceType: application.licenceType,
      categoryName: application.category.name,
      completedSections: application.completedSections,
    },
    sections,
    answers: parseAnswers(application.data),
    documents,
    uploaded: satisfiedSlots(documents),
    isEditable: EDITABLE.includes(application.status),
  };
}

/**
 * The application this customer is working on — the most recently touched one.
 * Customers have exactly one in practice today.
 */
export async function loadQuestionnaire(
  userId: string,
): Promise<QuestionnaireContext | null> {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: {
      applications: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: APPLICATION_SELECT,
      },
    },
  });

  const application = customer?.applications[0];
  return application ? buildContext(application) : null;
}

/**
 * The same context, addressed by application. Staff work by application, not
 * by whoever happens to be signed in.
 */
export async function loadQuestionnaireById(
  applicationId: string,
): Promise<QuestionnaireContext | null> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: APPLICATION_SELECT,
  });

  return application ? buildContext(application) : null;
}

/* ─────────────────────────────────────────────── ask once, print everywhere */

export interface Mirror {
  sectionKey: string;
  sectionTitle: string;
}

/**
 * A field key that appears in more than one section is asked in the first
 * section only; later sections show the answer read-only. Typing the same
 * value twice means the design is wrong.
 */
export function buildMirrorMap(
  sections: ResolvedSection[],
): Map<string, Mirror> {
  const origin = new Map<string, Mirror>();
  const mirrors = new Map<string, Mirror>();

  for (const section of sections) {
    for (const field of section.fields) {
      const seen = origin.get(field.key);
      if (seen) {
        mirrors.set(`${section.key}:${field.key}`, seen);
      } else {
        origin.set(field.key, {
          sectionKey: section.key,
          sectionTitle: section.title,
        });
      }
    }
  }

  return mirrors;
}

/** Fields this section is responsible for asking — mirrors excluded. */
export function ownFields(
  section: ResolvedSection,
  mirrors: Map<string, Mirror>,
): FieldDef[] {
  return section.fields.filter(
    (field) => !mirrors.has(`${section.key}:${field.key}`),
  );
}

/* ───────────────────────────────────────────────────────────── progress */

export interface SectionProgress {
  key: string;
  title: string;
  isComplete: boolean;
}

/**
 * Completion is recomputed from the answers rather than trusted from
 * completedSections, so a section can never look done when it is not.
 */
export function sectionStates(
  sections: ResolvedSection[],
  answers: AnswerMap,
  uploaded: ReadonlySet<string> = new Set(),
): SectionProgress[] {
  return sections.map((section) => ({
    key: section.key,
    title: section.title,
    isComplete: isSectionComplete(section.fields, answers, uploaded),
  }));
}

export function completedCount(states: SectionProgress[]): number {
  return states.filter((state) => state.isComplete).length;
}

/** Where "resume" and "start" should land. */
export function firstIncompleteSection(
  states: SectionProgress[],
): string | null {
  return states.find((state) => !state.isComplete)?.key ?? null;
}

export function neighbourSections(
  sections: ResolvedSection[],
  currentKey: string,
): { previous: string | null; next: string | null } {
  const index = sections.findIndex((section) => section.key === currentKey);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? sections[index - 1].key : null,
    next: index < sections.length - 1 ? sections[index + 1].key : null,
  };
}
