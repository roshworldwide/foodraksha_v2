import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { auditIp, writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { loadQuestionnaireById } from "@/lib/questionnaire/application";
import {
  answerValueSchema,
  parseAnswers,
  type AnswerValue,
} from "@/lib/questionnaire/schema";
import { validateSection } from "@/lib/questionnaire/validation";

/**
 * Staff editing a customer's answers.
 *
 * Unlike the customer route this always audits: the before and after value of
 * every field that actually changed, written in the same transaction as the
 * change. Staff may edit at any status — that is the point of the desk.
 */

const bodySchema = z.object({
  sectionKey: z.string().min(1),
  values: z.record(z.string(), answerValueSchema),
  revision: z.number().int().nonnegative(),
  validate: z.boolean().optional(),
});

function sameValue(left: AnswerValue | undefined, right: AnswerValue): boolean {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

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
  const { sectionKey, values, revision, validate } = parsed.data;

  const context = await loadQuestionnaireById(applicationId);
  if (!context) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );
  }

  const section = context.sections.find((entry) => entry.key === sectionKey);
  if (!section) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  const allowed = new Set(section.fields.map((field) => field.key));
  const patch: Record<string, AnswerValue> = {};
  const before: Record<string, AnswerValue> = {};
  const after: Record<string, AnswerValue> = {};

  for (const [key, value] of Object.entries(values)) {
    if (!allowed.has(key)) continue;
    patch[key] = value;
    if (!sameValue(context.answers[key], value)) {
      before[key] = context.answers[key] ?? null;
      after[key] = value;
    }
  }

  const ipAddress = await auditIp();

  const result = await prisma.$transaction(async (tx) => {
    if (Object.keys(patch).length > 0) {
      await tx.$executeRaw`
        UPDATE "Application"
        SET data = data || ${JSON.stringify(patch)}::jsonb,
            "updatedAt" = now()
        WHERE id = ${applicationId}
      `;
    }

    const fresh = await tx.application.findUniqueOrThrow({
      where: { id: applicationId },
      select: { data: true, completedSections: true },
    });

    const answers = parseAnswers(fresh.data);
    const errors = validateSection(section.fields, answers, context.uploaded);
    const isComplete = Object.keys(errors).length === 0;

    const completed = new Set(fresh.completedSections);
    const wasComplete = completed.has(sectionKey);
    if (isComplete) completed.add(sectionKey);
    else completed.delete(sectionKey);
    if (isComplete !== wasComplete) {
      await tx.application.update({
        where: { id: applicationId },
        data: { completedSections: [...completed] },
      });
    }

    // No change, no audit row — an audit trail full of no-ops is unreadable.
    if (Object.keys(after).length > 0) {
      await writeAudit(tx, {
        userId: session.user.id,
        entity: "Application",
        entityId: applicationId,
        action: "section_update",
        before: { section: sectionKey, values: before },
        after: { section: sectionKey, values: after },
        ipAddress,
      });
    }

    return { errors, completedSections: [...completed] };
  });

  return NextResponse.json({
    revision,
    savedAt: new Date().toISOString(),
    completedSections: result.completedSections,
    errors: validate ? result.errors : {},
    editedBy: Object.keys(after).length > 0 ? session.user.name : null,
  });
}
