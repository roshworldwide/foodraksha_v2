import { headers } from "next/headers";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * "Who changed this field?" must always have an answer. Every staff mutation
 * writes one of these, inside the same transaction as the change itself — an
 * audit row that can be lost is not an audit trail.
 */

export type AuditAction =
  | "section_update"
  | "document_review"
  | "status_change"
  | "query_raised"
  | "annexure_generated";

export interface AuditEntry {
  userId: string;
  entity: "Application" | "Document" | "Query";
  entityId: string;
  action: AuditAction;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}

type Client = PrismaClient | Prisma.TransactionClient;

export async function writeAudit(
  client: Client,
  entry: AuditEntry,
): Promise<void> {
  await client.auditLog.create({
    data: {
      userId: entry.userId,
      entity: entry.entity,
      entityId: entry.entityId,
      action: entry.action,
      before: entry.before,
      after: entry.after,
      ipAddress: entry.ipAddress ?? null,
    },
  });
}

/** Best-effort client IP for the audit row. */
export async function auditIp(): Promise<string | null> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headerList.get("x-real-ip") || null;
}

export interface SectionEdit {
  sectionKey: string;
  by: { id: string; name: string };
  at: Date;
}

/**
 * The most recent staff edit per section, for the "Last edited by …" line.
 * One query for the whole application — never one per section.
 */
export async function lastSectionEdits(
  applicationId: string,
): Promise<Map<string, SectionEdit>> {
  const rows = await prisma.auditLog.findMany({
    where: {
      entity: "Application",
      entityId: applicationId,
      action: "section_update",
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      after: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
  });

  const edits = new Map<string, SectionEdit>();
  for (const row of rows) {
    const payload = row.after as { section?: unknown } | null;
    const sectionKey =
      payload && typeof payload.section === "string" ? payload.section : null;
    if (!sectionKey || edits.has(sectionKey) || !row.user) continue;
    edits.set(sectionKey, {
      sectionKey,
      by: { id: row.user.id, name: row.user.name },
      at: row.createdAt,
    });
  }

  return edits;
}
