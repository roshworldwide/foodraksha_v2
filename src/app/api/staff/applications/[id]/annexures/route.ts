import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/guards";
import { auditIp } from "@/lib/audit";
import { generateAnnexures, listAnnexures } from "@/lib/annexures/generate";
import { isStorageConfigured } from "@/lib/storage";

/** What has been generated for this application. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  return NextResponse.json({ annexures: await listAnnexures(id) });
}

/** Generate every annexure this application needs. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "File storage is not switched on, so nothing can be stored." },
      { status: 503 },
    );
  }

  const { id } = await params;

  try {
    const { outcomes } = await generateAnnexures({
      applicationId: id,
      staffUserId: session.user.id,
      ipAddress: await auditIp(),
    });

    return NextResponse.json({
      outcomes,
      annexures: await listAnnexures(id),
    });
  } catch (error) {
    console.error("[annexures] batch failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The annexures could not be generated.",
      },
      { status: 500 },
    );
  }
}
