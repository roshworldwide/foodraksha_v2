import { deleteObject } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

/**
 * Account deletion under the DPDP Act 2023.
 *
 * The customer's personal data is erased — the User row and everything that
 * cascades from it (Customer, Applications, Documents, Sessions, Queries), plus
 * the uploaded and generated files in object storage.
 *
 * The Lead is NOT deleted: it is the marketing-funnel record and DATA-MODEL.md
 * requires it to survive customer deletion. But its personal fields are
 * redacted, so what remains is attribution (source, UTM, referrer, consent
 * timestamp, which user it converted to) with no personal data attached.
 */

export interface DeletionResult {
  filesDeleted: number;
  applicationsDeleted: number;
  leadsRedacted: number;
}

export async function deleteCustomerAccount(
  userId: string,
): Promise<DeletionResult> {
  // Gather every stored object before the rows that point at them are gone.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      mobile: true,
      customer: {
        select: {
          applications: {
            select: {
              id: true,
              documents: { select: { fileKey: true } },
              generatedPdfs: { select: { fileKey: true } },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return { filesDeleted: 0, applicationsDeleted: 0, leadsRedacted: 0 };
  }

  const applications = user.customer?.applications ?? [];
  const fileKeys = applications.flatMap((application) => [
    ...application.documents.map((d) => d.fileKey),
    ...application.generatedPdfs.map((p) => p.fileKey),
  ]);

  // Redact the Lead(s) and delete the user in one transaction. Storage cleanup
  // follows: an orphaned object is a nuisance, a half-deleted account is a
  // compliance failure, so the database change is the one that must be atomic.
  const leadsRedacted = await prisma.$transaction(async (tx) => {
    const redacted = await tx.lead.updateMany({
      where: { convertedUserId: userId },
      data: {
        name: "[deleted]",
        email: null,
        mobile: "[deleted]",
        city: null,
        ipAddress: null,
        // source, utm*, referrer, consentAt and convertedUserId are kept —
        // they are attribution, not personal data.
      },
    });

    // Cascades to Customer, Application, Document, Session, Query, StatusEvent
    // and GeneratedPdf via the schema's onDelete: Cascade.
    await tx.user.delete({ where: { id: userId } });

    return redacted.count;
  });

  // Best effort — the personal data is already gone from the database.
  let filesDeleted = 0;
  for (const key of fileKeys) {
    try {
      await deleteObject(key);
      filesDeleted += 1;
    } catch (error) {
      console.error(
        `[dpdp] could not delete stored object ${key}:`,
        error instanceof Error ? error.message : "unknown error",
      );
    }
  }

  return {
    filesDeleted,
    applicationsDeleted: applications.length,
    leadsRedacted,
  };
}
