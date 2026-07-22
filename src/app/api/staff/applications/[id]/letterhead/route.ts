import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { auditIp, writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { parseAnswers } from "@/lib/questionnaire/schema";

/**
 * The letterhead block that heads every generated annexure. FSSAI guidance
 * requires name, address, contact details and CIN, so staff can set all four
 * per client rather than anything being hardcoded. The logo is uploaded as the
 * `doc.letterhead_logo` document.
 */
const bodySchema = z.object({
  name: z.string().trim().max(200),
  address: z.string().trim().max(400),
  contact: z.string().trim().max(200),
  cin: z.string().trim().max(50),
});

const KEYS = ["name", "address", "contact", "cin"] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id: applicationId } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { data: true },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const answers = parseAnswers(application.data);
  const patch: Record<string, string> = {};
  const before: Record<string, string> = {};
  for (const key of KEYS) {
    patch[`letterhead.${key}`] = parsed.data[key];
    const previous = answers[`letterhead.${key}`];
    before[`letterhead.${key}`] = typeof previous === "string" ? previous : "";
  }

  const ipAddress = await auditIp();

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "Application"
      SET data = data || ${JSON.stringify(patch)}::jsonb,
          "updatedAt" = now()
      WHERE id = ${applicationId}
    `;

    await writeAudit(tx, {
      userId: session.user.id,
      entity: "Application",
      entityId: applicationId,
      action: "section_update",
      before: { section: "letterhead", values: before },
      after: { section: "letterhead", values: patch },
      ipAddress,
    });
  });

  return NextResponse.json({ ok: true });
}
