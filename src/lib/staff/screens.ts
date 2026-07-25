import type { AppStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Query helpers for the staff screens. Every function here reads real rows —
 * nothing is invented. Screens without a dedicated data source (Modification,
 * Annual Returns, Product Specification …) filter these same tables and carry a
 * scaffold banner rather than fabricating data.
 */

/** The FSSAI perpetual-validity reform: licences issued from here don't renew. */
export const PERPETUAL_VALIDITY_FROM = new Date("2026-04-01T00:00:00+05:30");

/* ────────────────────────────────────────────────────────── dashboard */

export interface DashboardKpis {
  openApplications: number;
  awaitingReview: number;
  issuedThisMonth: number;
  notLoggedIn: number;
}

export interface ActivityItem {
  applicationId: string;
  applicationNo: string;
  customerName: string;
  toStatus: AppStatus;
  note: string | null;
  by: string | null;
  at: Date;
}

export interface PipelineSnapshot {
  status: AppStatus;
  count: number;
}

export async function loadDashboard(): Promise<{
  kpis: DashboardKpis;
  activity: ActivityItem[];
  pipeline: PipelineSnapshot[];
  leadsOpen: number;
}> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [grouped, notLoggedIn, issuedThisMonth, events, leadsOpen] =
    await Promise.all([
      prisma.application.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.application.count({
        where: { customer: { user: { lastLoginAt: null } } },
      }),
      prisma.application.count({
        where: { status: "ISSUED", issuedAt: { gte: monthStart } },
      }),
      prisma.statusEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          toStatus: true,
          note: true,
          createdAt: true,
          by: { select: { name: true } },
          application: {
            select: {
              id: true,
              applicationNo: true,
              customer: { select: { user: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.lead.count({ where: { convertedUserId: null } }),
    ]);

  const byStatus = new Map<AppStatus, number>(
    grouped.map((g) => [g.status, g._count._all]),
  );
  const sum = (statuses: AppStatus[]) =>
    statuses.reduce((total, s) => total + (byStatus.get(s) ?? 0), 0);

  return {
    kpis: {
      // "Open" = anything still moving through the pipeline.
      openApplications: sum([
        "DRAFT",
        "SUBMITTED",
        "UNDER_REVIEW",
        "QUERY_RAISED",
        "READY_TO_FILE",
        "FILED",
        "FSSAI_QUERY",
      ]),
      awaitingReview: sum(["SUBMITTED", "UNDER_REVIEW"]),
      issuedThisMonth,
      notLoggedIn,
    },
    activity: events.map((event) => ({
      applicationId: event.application.id,
      applicationNo: event.application.applicationNo,
      customerName: event.application.customer.user.name,
      toStatus: event.toStatus,
      note: event.note,
      by: event.by?.name ?? null,
      at: event.createdAt,
    })),
    pipeline: PIPELINE_ORDER.map((status) => ({
      status,
      count: byStatus.get(status) ?? 0,
    })),
    leadsOpen,
  };
}

/* ────────────────────────────────────────────────────────── pipeline */

/** The order the board and snapshot show statuses in. Terminal states last. */
export const PIPELINE_ORDER: AppStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUERY_RAISED",
  "READY_TO_FILE",
  "FILED",
  "FSSAI_QUERY",
  "ISSUED",
];

export interface PipelineCard {
  applicationId: string;
  applicationNo: string;
  customerName: string;
  businessName: string;
  status: AppStatus;
}

export async function loadPipelineBoard(): Promise<
  Record<AppStatus, PipelineCard[]>
> {
  const rows = await prisma.application.findMany({
    where: { status: { in: PIPELINE_ORDER } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      applicationNo: true,
      status: true,
      customer: {
        select: {
          businessName: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  const board = Object.fromEntries(
    PIPELINE_ORDER.map((s) => [s, [] as PipelineCard[]]),
  ) as Record<AppStatus, PipelineCard[]>;

  for (const row of rows) {
    board[row.status].push({
      applicationId: row.id,
      applicationNo: row.applicationNo,
      customerName: row.customer.user.name,
      businessName: row.customer.businessName,
      status: row.status,
    });
  }
  return board;
}

/* ───────────────────────────────────────────────────────────── leads */

export interface LeadRow {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  businessType: string | null;
  city: string | null;
  source: string | null;
  /**
   * The enquiry note composed by composeNote() in @/lib/marketing/lead, stored
   * in Lead.referrer because the model has no columns for turnover, service
   * interest or the calculator read-out. For a calculator lead it carries the
   * licence and government fee the customer was quoted — the team needs to see
   * that before calling back, so it is a column on the enquiries screen.
   */
  note: string | null;
  createdAt: Date;
  converted: boolean;
}

export async function listLeads(options?: {
  onlyWebsite?: boolean;
  onlyOpen?: boolean;
}): Promise<LeadRow[]> {
  const rows = await prisma.lead.findMany({
    where: {
      ...(options?.onlyWebsite ? { source: "website" } : {}),
      ...(options?.onlyOpen ? { convertedUserId: null } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      businessType: true,
      city: true,
      source: true,
      referrer: true,
      createdAt: true,
      convertedUserId: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    mobile: row.mobile,
    email: row.email,
    businessType: row.businessType,
    city: row.city,
    source: row.source,
    note: row.referrer,
    createdAt: row.createdAt,
    converted: row.convertedUserId !== null,
  }));
}

/* ────────────────────────────────────────────── licensing filtered views */

export interface LicenceRow {
  applicationId: string;
  applicationNo: string;
  customerName: string;
  businessName: string;
  licenceNo: string | null;
  licenceExpiresAt: Date | null;
  status: AppStatus;
}

/** Legacy licences: issued with an expiry that pre-dates the reform. */
export async function listLegacyRenewals(): Promise<LicenceRow[]> {
  const rows = await prisma.application.findMany({
    where: {
      licenceExpiresAt: { not: null, lt: PERPETUAL_VALIDITY_FROM },
    },
    orderBy: { licenceExpiresAt: "asc" },
    select: {
      id: true,
      applicationNo: true,
      licenceNo: true,
      licenceExpiresAt: true,
      status: true,
      customer: {
        select: { businessName: true, user: { select: { name: true } } },
      },
    },
  });
  return rows.map(toLicenceRow);
}

/** Basic Registration cases. */
export async function listBasicRegistrations(): Promise<LicenceRow[]> {
  const rows = await prisma.application.findMany({
    where: { licenceType: "BASIC" },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      applicationNo: true,
      licenceNo: true,
      licenceExpiresAt: true,
      status: true,
      customer: {
        select: { businessName: true, user: { select: { name: true } } },
      },
    },
  });
  return rows.map(toLicenceRow);
}

/** Applications ready for FoSCoS filing (Form B). */
export async function listForFiling(): Promise<LicenceRow[]> {
  const rows = await prisma.application.findMany({
    where: { status: { in: ["UNDER_REVIEW", "READY_TO_FILE"] } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      applicationNo: true,
      licenceNo: true,
      licenceExpiresAt: true,
      status: true,
      customer: {
        select: { businessName: true, user: { select: { name: true } } },
      },
    },
  });
  return rows.map(toLicenceRow);
}

/* ───────────────────────────────────────────────────────── Form IX */

export interface FormIxRow {
  applicationId: string;
  applicationNo: string;
  customerName: string;
  businessName: string;
  constitution: string | null;
  /** Form IX does not apply to a sole proprietor (FoSCoS checklist). */
  eligible: boolean;
  generatedPdfId: string | null;
  generatedAt: Date | null;
}

export async function listFormIx(): Promise<FormIxRow[]> {
  const rows = await prisma.application.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      applicationNo: true,
      data: true,
      customer: {
        select: { businessName: true, user: { select: { name: true } } },
      },
      generatedPdfs: {
        where: { template: { key: "form_ix" } },
        orderBy: { generatedAt: "desc" },
        take: 1,
        select: { id: true, generatedAt: true },
      },
    },
  });

  return rows.map((row) => {
    const data = (row.data ?? {}) as Record<string, unknown>;
    const constitution =
      typeof data["business.constitution"] === "string"
        ? (data["business.constitution"] as string)
        : null;
    const generated = row.generatedPdfs[0];
    return {
      applicationId: row.id,
      applicationNo: row.applicationNo,
      customerName: row.customer.user.name,
      businessName: row.customer.businessName,
      constitution,
      eligible: constitution !== "Proprietorship",
      generatedPdfId: generated?.id ?? null,
      generatedAt: generated?.generatedAt ?? null,
    };
  });
}

/* ────────────────────────────────────────── NOC / address ownership */

export interface NocRow {
  documentId: string;
  applicationId: string;
  applicationNo: string;
  customerName: string;
  docType: string;
  label: string;
  fileName: string;
  status: "AWAITING" | "PENDING" | "APPROVED" | "REJECTED";
  uploadedAt: Date;
}

const NOC_DOC_TYPES = ["doc.premises_proof", "doc.noc_owner"];
const NOC_LABELS: Record<string, string> = {
  "doc.premises_proof": "Proof of premises",
  "doc.noc_owner": "NOC from premises owner",
};

export async function listNocDocuments(): Promise<NocRow[]> {
  const rows = await prisma.document.findMany({
    where: { docType: { in: NOC_DOC_TYPES } },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      docType: true,
      fileName: true,
      status: true,
      uploadedAt: true,
      application: {
        select: {
          id: true,
          applicationNo: true,
          customer: { select: { user: { select: { name: true } } } },
        },
      },
    },
  });
  return rows.map((row) => ({
    documentId: row.id,
    applicationId: row.application.id,
    applicationNo: row.application.applicationNo,
    customerName: row.application.customer.user.name,
    docType: row.docType,
    label: NOC_LABELS[row.docType] ?? row.docType,
    fileName: row.fileName,
    status: row.status,
    uploadedAt: row.uploadedAt,
  }));
}

/* ─────────────────────────────────────────────────────── compliance */

export interface ComplianceRow {
  applicationId: string;
  applicationNo: string;
  customerName: string;
  businessName: string;
  status: AppStatus;
  pendingDocuments: number;
  rejectedDocuments: number;
  openQueries: number;
}

/** Read-only roll-up: what is outstanding per live application. */
export async function loadCompliance(): Promise<ComplianceRow[]> {
  const rows = await prisma.application.findMany({
    where: { status: { notIn: ["CLOSED", "REJECTED"] } },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      applicationNo: true,
      status: true,
      customer: {
        select: { businessName: true, user: { select: { name: true } } },
      },
      documents: { select: { status: true } },
      _count: { select: { queries: { where: { resolvedAt: null } } } },
    },
  });

  return (
    rows
      .map((row) => ({
        applicationId: row.id,
        applicationNo: row.applicationNo,
        customerName: row.customer.user.name,
        businessName: row.customer.businessName,
        status: row.status,
        pendingDocuments: row.documents.filter((d) => d.status === "PENDING")
          .length,
        rejectedDocuments: row.documents.filter((d) => d.status === "REJECTED")
          .length,
        openQueries: row._count.queries,
      }))
      // Only surface applications that actually have something outstanding.
      .filter(
        (r) =>
          r.pendingDocuments > 0 ||
          r.rejectedDocuments > 0 ||
          r.openQueries > 0,
      )
  );
}

/* ────────────────────────────────────────────── product specification */

export interface ProductSpecRow {
  applicationId: string;
  applicationNo: string;
  customerName: string;
  categoryName: string;
  foodCategories: string[];
  installedCapacity: string | null;
}

export async function listProductSpecs(): Promise<ProductSpecRow[]> {
  const rows = await prisma.application.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      applicationNo: true,
      data: true,
      category: { select: { name: true } },
      customer: { select: { user: { select: { name: true } } } },
    },
  });

  return rows
    .map((row) => {
      const data = (row.data ?? {}) as Record<string, unknown>;
      const foods = Array.isArray(data["licence.food_categories"])
        ? (data["licence.food_categories"] as unknown[]).filter(
            (v): v is string => typeof v === "string",
          )
        : [];
      const capacity =
        typeof data["equipment.installed_capacity"] === "string"
          ? (data["equipment.installed_capacity"] as string)
          : null;
      return {
        applicationId: row.id,
        applicationNo: row.applicationNo,
        customerName: row.customer.user.name,
        categoryName: row.category.name,
        foodCategories: foods,
        installedCapacity: capacity,
      };
    })
    .filter((r) => r.foodCategories.length > 0);
}

function toLicenceRow(row: {
  id: string;
  applicationNo: string;
  licenceNo: string | null;
  licenceExpiresAt: Date | null;
  status: AppStatus;
  customer: { businessName: string; user: { name: string } };
}): LicenceRow {
  return {
    applicationId: row.id,
    applicationNo: row.applicationNo,
    customerName: row.customer.user.name,
    businessName: row.customer.businessName,
    licenceNo: row.licenceNo,
    licenceExpiresAt: row.licenceExpiresAt,
    status: row.status,
  };
}
