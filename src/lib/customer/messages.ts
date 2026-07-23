import { documentSlots } from "@/lib/documents";
import { loadQuestionnaireById } from "@/lib/questionnaire/application";
import { prisma } from "@/lib/prisma";

/**
 * The customer's message thread: every clarification staff have raised on
 * their application, newest first. Each carries a deep-link straight to the
 * section or document that needs the fix, and — once answered — the note the
 * customer sent back.
 */

export interface CustomerMessage {
  id: string;
  message: string;
  raisedAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  resolutionNote: string | null;
  /** Where to go to fix it, and a human label for that place. */
  fixHref: string | null;
  fixLabel: string | null;
}

export interface CustomerMessages {
  applicationId: string;
  applicationNo: string;
  /** The questionnaire is open, so responses can still be made. */
  editable: boolean;
  openCount: number;
  messages: CustomerMessage[];
}

export async function loadCustomerMessages(
  userId: string,
): Promise<CustomerMessages | null> {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: {
      applications: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { id: true, applicationNo: true },
      },
    },
  });
  const application = customer?.applications[0];
  if (!application) return null;

  const context = await loadQuestionnaireById(application.id);

  // Friendly labels for the deep-links.
  const sectionTitle = new Map(
    context?.sections.map((section) => [section.key, section.title]) ?? [],
  );
  const docLabel = new Map(
    context
      ? documentSlots(context.sections).map((slot) => [slot.key, slot.label])
      : [],
  );

  const rows = await prisma.query.findMany({
    where: { applicationId: application.id },
    orderBy: { raisedAt: "desc" },
    select: {
      id: true,
      message: true,
      raisedAt: true,
      resolvedAt: true,
      resolutionNote: true,
      relatedSection: true,
      relatedDocType: true,
    },
  });

  const messages: CustomerMessage[] = rows.map((row) => {
    let fixHref: string | null = null;
    let fixLabel: string | null = null;
    if (row.relatedSection) {
      fixHref = `/application/${row.relatedSection}`;
      fixLabel = sectionTitle.get(row.relatedSection) ?? "Open the section";
    } else if (row.relatedDocType) {
      fixHref = "/application/documents";
      fixLabel = docLabel.get(row.relatedDocType) ?? "Open your documents";
    }

    return {
      id: row.id,
      message: row.message,
      raisedAt: row.raisedAt.toISOString(),
      resolved: row.resolvedAt !== null,
      resolvedAt: row.resolvedAt?.toISOString() ?? null,
      resolutionNote: row.resolutionNote,
      fixHref,
      fixLabel,
    };
  });

  return {
    applicationId: application.id,
    applicationNo: application.applicationNo,
    editable: context?.isEditable ?? false,
    openCount: messages.filter((message) => !message.resolved).length,
    messages,
  };
}
