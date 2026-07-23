import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured, presignDownload } from "@/lib/storage";

/**
 * A customer downloading one of their generated forms. Same private-object
 * rule as uploads: a signed URL that expires in 15 minutes, and ownership is
 * part of the query so it can never be skipped.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "File storage is not switched on yet." },
      { status: 503 },
    );
  }

  const generated = await prisma.generatedPdf.findFirst({
    where: {
      id,
      application: { customer: { userId: session.user.id } },
    },
    select: {
      fileKey: true,
      template: { select: { key: true } },
      application: { select: { applicationNo: true } },
    },
  });

  if (!generated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = await presignDownload(
    generated.fileKey,
    `${generated.application.applicationNo}-${generated.template.key}.pdf`,
  );
  return NextResponse.redirect(url, {
    status: 307,
    headers: { "Cache-Control": "no-store" },
  });
}
