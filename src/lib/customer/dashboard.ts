import type { AppStatus } from "@prisma/client";
import { documentSlots, documentsByType } from "@/lib/documents";
import { loadQuestionnaireById } from "@/lib/questionnaire/application";
import { prisma } from "@/lib/prisma";
import {
  CUSTOMER_MILESTONES,
  milestoneForStatus,
  type MilestoneKey,
} from "@/lib/status-machine";

/**
 * Everything the customer dashboard shows, assembled once. Deliberately
 * customer-shaped: it never exposes the internal review sub-states, only the
 * milestones a customer cares about.
 */

export interface AttentionItem {
  kind: "query" | "document";
  title: string;
  detail: string;
  /** Deep-link to the thing that needs fixing. */
  href: string;
}

export interface TimelineStep {
  key: MilestoneKey;
  label: string;
  state: "done" | "now" | "upcoming";
  /** Date the milestone was reached, if known. */
  on: string | null;
}

export interface CustomerDocument {
  id: string;
  label: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | "AWAITING";
  /** Download route, or null when nothing has been uploaded. */
  href: string | null;
}

export interface DashboardData {
  application: {
    id: string;
    applicationNo: string;
    status: AppStatus;
    percent: number;
    completed: number;
    total: number;
    /** DRAFT or QUERY_RAISED — the questionnaire is open. */
    resumable: boolean;
    licenceNo: string | null;
    licenceExpiresAt: string | null;
  };
  attention: AttentionItem[];
  timeline: TimelineStep[];
  documents: CustomerDocument[];
  /** The issued licence PDF, when there is one. */
  licenceHref: string | null;
}

const RESUMABLE: AppStatus[] = ["DRAFT", "QUERY_RAISED"];

export async function loadDashboard(
  userId: string,
): Promise<DashboardData | null> {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: {
      applications: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { id: true },
      },
    },
  });
  const applicationId = customer?.applications[0]?.id;
  if (!applicationId) return null;

  const context = await loadQuestionnaireById(applicationId);
  if (!context) return null;

  const record = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    select: {
      createdAt: true,
      submittedAt: true,
      filedAt: true,
      issuedAt: true,
      licenceNo: true,
      licenceExpiresAt: true,
      statusEvents: {
        orderBy: { createdAt: "asc" },
        select: { toStatus: true, createdAt: true },
      },
      queries: {
        where: { resolvedAt: null },
        orderBy: { raisedAt: "desc" },
        select: { message: true, relatedSection: true, relatedDocType: true },
      },
    },
  });

  const total = context.sections.length;
  const completed = context.application.completedSections.length;

  // ── Needs your attention: open queries and rejected documents.
  const slots = documentSlots(context.sections);
  const byType = documentsByType(context.documents);

  const attention: AttentionItem[] = [];
  for (const query of record.queries) {
    attention.push({
      kind: "query",
      title: "Our team has a question",
      detail: query.message,
      href: query.relatedSection
        ? `/application/${query.relatedSection}`
        : query.relatedDocType
          ? "/application/documents"
          : "/application",
    });
  }
  for (const document of context.documents) {
    if (document.status !== "REJECTED") continue;
    const label =
      slots.find((slot) => slot.key === document.docType)?.label ??
      document.docType;
    attention.push({
      kind: "document",
      title: label,
      detail: document.rejectionReason ?? "Please upload a new copy.",
      href: "/application/documents",
    });
  }

  // ── Timeline: customer milestones only.
  const timeline = buildTimeline(context.application.status, record);

  // ── Documents the customer can see.
  const documents: CustomerDocument[] = slots
    .filter((slot) => slot.kind === "file")
    .map((slot) => {
      const document = byType.get(slot.key);
      return {
        id: slot.key,
        label: slot.label,
        status: document?.status ?? "AWAITING",
        href: document ? `/api/customer/documents/${document.id}/file` : null,
      };
    });

  const licence = byType.get("licence_certificate");

  return {
    application: {
      id: context.application.id,
      applicationNo: context.application.applicationNo,
      status: context.application.status,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total,
      resumable: RESUMABLE.includes(context.application.status),
      licenceNo: record.licenceNo,
      licenceExpiresAt: record.licenceExpiresAt?.toISOString() ?? null,
    },
    attention,
    timeline,
    documents,
    licenceHref: licence ? `/api/customer/documents/${licence.id}/file` : null,
  };
}

function buildTimeline(
  status: AppStatus,
  record: {
    createdAt: Date;
    submittedAt: Date | null;
    filedAt: Date | null;
    issuedAt: Date | null;
    statusEvents: { toStatus: AppStatus; createdAt: Date }[];
  },
): TimelineStep[] {
  // When each milestone was first reached, from the recorded dates and events.
  const firstReview = record.statusEvents.find(
    (event) => milestoneForStatus(event.toStatus) === "review",
  );

  const reachedAt: Record<MilestoneKey, Date | null> = {
    created: record.createdAt,
    submitted: record.submittedAt,
    review: firstReview?.createdAt ?? null,
    filed: record.filedAt,
    issued: record.issuedAt,
  };

  const current = milestoneForStatus(status);
  const currentIndex = CUSTOMER_MILESTONES.findIndex((m) => m.key === current);

  return CUSTOMER_MILESTONES.map((milestone, index) => ({
    key: milestone.key,
    label: milestone.label,
    state:
      index < currentIndex
        ? "done"
        : index === currentIndex
          ? "now"
          : "upcoming",
    on: reachedAt[milestone.key]?.toISOString() ?? null,
  }));
}
