import { prisma } from "@/lib/prisma";

/**
 * Everything the "My Forms & Licence" screen shows for a customer's own
 * application: the government forms staff have generated for them, and — once
 * the licence is issued — the final licence PDF. All downloads go through
 * signed-URL routes; no storage key ever reaches the browser.
 */

export interface GeneratedForm {
  id: string;
  name: string;
  generatedAt: string;
  href: string;
}

export interface CustomerForms {
  applicationNo: string;
  status: string;
  forms: GeneratedForm[];
  licence: {
    no: string | null;
    expiresAt: string | null;
    /** Download route for the licence PDF, or null when not uploaded. */
    href: string | null;
  } | null;
}

export async function loadCustomerForms(
  userId: string,
): Promise<CustomerForms | null> {
  const application = await prisma.application.findFirst({
    where: { customer: { userId } },
    orderBy: { updatedAt: "desc" },
    select: {
      applicationNo: true,
      status: true,
      licenceNo: true,
      licenceExpiresAt: true,
      generatedPdfs: {
        orderBy: { generatedAt: "desc" },
        select: {
          id: true,
          generatedAt: true,
          template: { select: { name: true } },
        },
      },
      documents: {
        where: { docType: "licence_certificate" },
        orderBy: { uploadedAt: "desc" },
        take: 1,
        select: { id: true },
      },
    },
  });

  if (!application) return null;

  const forms: GeneratedForm[] = application.generatedPdfs.map((pdf) => ({
    id: pdf.id,
    name: pdf.template.name,
    generatedAt: pdf.generatedAt.toISOString(),
    href: `/api/customer/annexures/${pdf.id}/file`,
  }));

  const licenceDoc = application.documents[0];
  const licence =
    application.status === "ISSUED"
      ? {
          no: application.licenceNo,
          expiresAt: application.licenceExpiresAt?.toISOString() ?? null,
          href: licenceDoc
            ? `/api/customer/documents/${licenceDoc.id}/file`
            : null,
        }
      : null;

  return {
    applicationNo: application.applicationNo,
    status: application.status,
    forms,
    licence,
  };
}
