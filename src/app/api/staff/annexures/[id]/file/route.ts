import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured, presignDownload } from "@/lib/storage";

/** Generated annexures are private objects too — signed URL, 15 minutes. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "File storage is not switched on yet." },
      { status: 503 },
    );
  }

  const { id } = await params;
  const generated = await prisma.generatedPdf.findUnique({
    where: { id },
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
