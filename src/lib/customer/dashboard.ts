import type { AppStatus, LicenceType } from "@prisma/client";
import { documentSlots, documentsByType } from "@/lib/documents";
import { loadQuestionnaireById } from "@/lib/questionnaire/application";
import { prisma } from "@/lib/prisma";
import {
  CUSTOMER_MILESTONES,
  milestoneForStatus,
  type MilestoneKey,
} from "@/lib/status-machine";

/**
 * The dashboard hero has three shapes, decided by status — never a raw fill
 * percentage on an application the customer has already handed over.
 *  - "fill"     DRAFT: the questionnaire is still theirs to complete.
 *  - "tracking" SUBMITTED…FILED: it is with our team / FSSAI; show a tracker.
 *  - "issued"   ISSUED/CLOSED: the licence card.
 */
export type DashboardPhase = "fill" | "tracking" | "issued";

function phaseForStatus(status: AppStatus): DashboardPhase {
  if (status === "DRAFT") return "fill";
  if (status === "ISSUED" || status === "CLOSED") return "issued";
  return "tracking";
}

/** One plain-language line under the hero — what is happening, in their terms. */
function statusMessage(status: AppStatus): string {
  switch (status) {
    case "SUBMITTED":
      return "Your application is in. Our team will review it and be in touch if anything needs clarifying.";
    case "UNDER_REVIEW":
      return "Our team is checking your file. We'll message you the moment we need anything.";
    case "QUERY_RAISED":
      return "We've asked you a question — see “Needs your attention” below to respond.";
    case "READY_TO_FILE":
      return "Reviewed and ready. We're preparing to file your application with FSSAI.";
    case "FILED":
      return "Filed with FSSAI. We're now waiting for your licence to be issued.";
    case "FSSAI_QUERY":
      return "FSSAI has raised a query on the filing; our team is handling it for you.";
    case "REJECTED":
      return "This application was not approved. Our team will be in touch about the next steps.";
    default:
      return "We'll keep you posted here as your application moves along.";
  }
}

/** The 4-step tracker shown once an application is past DRAFT. */
const TRACKER_STEPS = [
  { key: "submitted", label: "Submitted" },
  { key: "review", label: "Under review" },
  { key: "filed", label: "Filed with FSSAI" },
  { key: "issued", label: "Licence issued" },
] as const satisfies readonly { key: MilestoneKey; label: string }[];

export interface TrackerStep {
  key: MilestoneKey;
  label: string;
  state: "done" | "now" | "upcoming";
}

export interface DashboardSection {
  key: string;
  title: string;
  isComplete: boolean;
}

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
    /** Which hero to render. The fill percent is meaningful only in "fill". */
    phase: DashboardPhase;
    percent: number;
    completed: number;
    total: number;
    /** DRAFT or QUERY_RAISED — the questionnaire is open. */
    resumable: boolean;
    /** Title of the next section to fill, so "Continue" names where it goes. */
    resumeSection: string | null;
    licenceType: LicenceType;
    categoryName: string;
    createdAt: string;
    submittedAt: string | null;
    /** Plain-language line under the hero, for the tracking phase. */
    statusMessage: string;
    licenceNo: string | null;
    licenceExpiresAt: string | null;
  };
  /** The 4-step tracker for the tracking/issued phases. */
  tracker: TrackerStep[];
  /** The questionnaire sections, with completion — the "application file" list. */
  sections: DashboardSection[];
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

  const status = context.application.status;
  const phase = phaseForStatus(status);

  // The next section that still needs work — what "Continue" actually opens.
  const resumeSection =
    context.sections.find(
      (section) => !context.application.completedSections.includes(section.key),
    )?.title ?? null;

  // The 4-step tracker. Only meaningful past DRAFT; the page hides it in "fill".
  const currentMilestone = milestoneForStatus(status);
  const currentIndex = TRACKER_STEPS.findIndex(
    (step) => step.key === currentMilestone,
  );
  const tracker: TrackerStep[] = TRACKER_STEPS.map((step, index) => ({
    key: step.key,
    label: step.label,
    state:
      index < currentIndex
        ? "done"
        : index === currentIndex
          ? "now"
          : "upcoming",
  }));

  // The application file. Once submitted, every section is complete by
  // definition — submission is gated on completeness — so the ticks read that
  // way regardless of how a demo row happened to be seeded.
  const sections: DashboardSection[] = context.sections.map((section) => ({
    key: section.key,
    title: section.title,
    isComplete:
      phase === "fill"
        ? context.application.completedSections.includes(section.key)
        : true,
  }));

  return {
    application: {
      id: context.application.id,
      applicationNo: context.application.applicationNo,
      status,
      phase,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total,
      resumable: RESUMABLE.includes(status),
      resumeSection,
      licenceType: context.application.licenceType,
      categoryName: context.application.categoryName,
      createdAt: record.createdAt.toISOString(),
      submittedAt: record.submittedAt?.toISOString() ?? null,
      statusMessage: statusMessage(status),
      licenceNo: record.licenceNo,
      licenceExpiresAt: record.licenceExpiresAt?.toISOString() ?? null,
    },
    tracker,
    sections,
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
