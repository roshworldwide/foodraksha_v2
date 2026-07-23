import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { auditIp, writeAudit } from "@/lib/audit";
import { detectType, MAX_UPLOAD_BYTES } from "@/lib/files/inspect";
import { notifyLicenceIssued } from "@/lib/notifications/customer";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured, putObject } from "@/lib/storage";
import { InvalidTransitionError, transition } from "@/lib/status-machine";

/**
 * Record a licence as issued: number, expiry, and the licence PDF from FSSAI.
 * Moves FILED → ISSUED, stores the PDF privately as a document, and tells the
 * customer. Multipart, because it carries a file alongside the fields.
 */
const fieldsSchema = z.object({
  licenceNo: z.string().trim().min(3, "Enter the licence number").max(60),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD expiry date"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!isStorageConfigured()) {
    return NextResponse.json(
      {
        error:
          "File storage is not switched on, so the licence cannot be stored.",
      },
      { status: 503 },
    );
  }

  const { id: applicationId } = await params;

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = fieldsSchema.safeParse({
    licenceNo: form.get("licenceNo"),
    expiresAt: form.get("expiresAt"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the details." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Attach the licence PDF from FSSAI." },
      { status: 400 },
    );
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "That file is larger than 10 MB." },
      { status: 413 },
    );
  }
  if (detectType(bytes) !== "application/pdf") {
    return NextResponse.json(
      { error: "The licence must be a PDF." },
      { status: 415 },
    );
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      status: true,
      applicationNo: true,
      customer: {
        select: {
          user: { select: { name: true, mobile: true, email: true } },
        },
      },
    },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fileKey = `applications/${applicationId}/licence/${parsed.data.licenceNo.replace(/[^a-z0-9]/gi, "_")}.pdf`;
  await putObject(fileKey, bytes, "application/pdf");

  const expiresAt = new Date(`${parsed.data.expiresAt}T00:00:00+05:30`);
  const issuedAt = new Date();
  const ipAddress = await auditIp();

  try {
    await prisma.$transaction(async (tx) => {
      await transition(tx, {
        applicationId,
        from: application.status,
        to: "ISSUED",
        byUserId: session.user.id,
        note: `Licence ${parsed.data.licenceNo} issued.`,
        data: {
          licenceNo: parsed.data.licenceNo,
          licenceExpiresAt: expiresAt,
          issuedAt,
        },
      });

      // The licence PDF is a document the customer may download. Replace any
      // earlier copy for the same application.
      await tx.document.deleteMany({
        where: { applicationId, docType: "licence_certificate" },
      });
      await tx.document.create({
        data: {
          applicationId,
          docType: "licence_certificate",
          fileKey,
          fileName: `FSSAI-Licence-${parsed.data.licenceNo}.pdf`,
          mimeType: "application/pdf",
          sizeBytes: bytes.byteLength,
          status: "APPROVED",
          reviewedAt: issuedAt,
          reviewedById: session.user.id,
        },
      });

      await writeAudit(tx, {
        userId: session.user.id,
        entity: "Application",
        entityId: applicationId,
        action: "status_change",
        before: { status: application.status },
        after: {
          status: "ISSUED",
          licenceNo: parsed.data.licenceNo,
          licenceExpiresAt: expiresAt.toISOString(),
        },
        ipAddress,
      });
    });
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      return NextResponse.json(
        { error: "A licence can only be issued once an application is filed." },
        { status: 409 },
      );
    }
    throw error;
  }

  await notifyLicenceIssued(
    {
      name: application.customer.user.name,
      mobile: application.customer.user.mobile,
      email: application.customer.user.email,
    },
    {
      applicationNo: application.applicationNo,
      licenceNo: parsed.data.licenceNo,
    },
  );

  return NextResponse.json({ ok: true });
}
