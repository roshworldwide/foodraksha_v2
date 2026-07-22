import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured, presignDownload } from "@/lib/storage";

/**
 * The only way to read an uploaded file: a signed URL that expires in 15
 * minutes. The bucket is private, and the storage key never leaves the server.
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

  const document = await prisma.document.findFirst({
    where: {
      id,
      // Ownership is part of the query, not a check that can be forgotten.
      application: { customer: { userId: session.user.id } },
    },
    select: { fileKey: true, fileName: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = await presignDownload(document.fileKey, document.fileName);
  return NextResponse.redirect(url, {
    status: 307,
    headers: { "Cache-Control": "no-store" },
  });
}
