import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { loadQuestionnaire } from "@/lib/questionnaire/application";
import { answerValueSchema, parseAnswers } from "@/lib/questionnaire/schema";
import { validateSection } from "@/lib/questionnaire/validation";

/**
 * Autosave for one questionnaire section.
 *
 * Writes are a jsonb merge (`data || patch`), so two saves racing each other
 * cannot wipe one another's keys — the last write per key wins, and no key is
 * ever lost. The client sends `revision` back untouched so it can discard
 * responses that arrive out of order.
 */

const bodySchema = z.object({
  applicationId: z.string().min(1),
  sectionKey: z.string().min(1),
  values: z.record(z.string(), answerValueSchema),
  revision: z.number().int().nonnegative(),
  /** True on Continue: run the section's rules and report what is missing. */
  validate: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }
  const { applicationId, sectionKey, values, revision, validate } = parsed.data;

  const context = await loadQuestionnaire(session.user.id);
  if (!context || context.application.id !== applicationId) {
    // Either no application, or one that is not this customer's.
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );
  }
  if (!context.isEditable) {
    return NextResponse.json(
      {
        error: "This application is with our team and can no longer be edited.",
      },
      { status: 409 },
    );
  }

  const section = context.sections.find((entry) => entry.key === sectionKey);
  if (!section) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  // Only keys this section actually asks for. Anything else is ignored.
  const allowed = new Set(section.fields.map((field) => field.key));
  const patch = Object.fromEntries(
    Object.entries(values).filter(([key]) => allowed.has(key)),
  );

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

    return { errors, completedSections: [...completed] };
  });

  return NextResponse.json({
    revision,
    savedAt: new Date().toISOString(),
    completedSections: result.completedSections,
    // Problems are only reported when the customer asked to move on.
    errors: validate ? result.errors : {},
  });
}
