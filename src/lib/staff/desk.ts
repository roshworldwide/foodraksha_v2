import type { AppStatus, LicenceType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * The staff desk query layer.
 *
 * Everything here is written to stay flat at 10,000+ applications: one query
 * for the page, one grouped query for the chip counts, one small query for the
 * section totals. No query runs per row.
 */

export const PAGE_SIZE = 50;

export const DESK_FILTERS = [
  "all",
  "not_logged_in",
  "in_progress",
  "awaiting_review",
  "query_raised",
  "filed",
  "issued",
] as const;

export type DeskFilter = (typeof DESK_FILTERS)[number];

export const FILTER_LABELS: Record<DeskFilter, string> = {
  all: "All",
  not_logged_in: "Not logged in",
  in_progress: "In progress",
  awaiting_review: "Awaiting review",
  query_raised: "Query raised",
  filed: "Filed",
  issued: "Issued",
};

/** Which application statuses each chip covers. */
const FILTER_STATUSES: Partial<Record<DeskFilter, AppStatus[]>> = {
  in_progress: ["DRAFT"],
  awaiting_review: ["SUBMITTED", "UNDER_REVIEW"],
  query_raised: ["QUERY_RAISED", "FSSAI_QUERY"],
  filed: ["READY_TO_FILE", "FILED"],
  issued: ["ISSUED"],
};

export const SORT_KEYS = [
  "customer",
  "business_type",
  "licence",
  "status",
  "updated",
] as const;

export type SortKey = (typeof SORT_KEYS)[number];
export type SortDirection = "asc" | "desc";

export interface DeskQuery {
  search: string;
  filter: DeskFilter;
  sort: SortKey;
  direction: SortDirection;
  page: number;
}

export interface DeskRow {
  applicationId: string;
  applicationNo: string;
  customerName: string;
  businessName: string;
  mobile: string;
  categoryName: string;
  licenceType: LicenceType;
  status: AppStatus;
  /** Null means the account has never been used — the follow-up list. */
  lastLoginAt: Date | null;
  completedSections: number;
  totalSections: number;
  updatedAt: Date;
}

export interface DeskPage {
  rows: DeskRow[];
  total: number;
  page: number;
  pageCount: number;
}

/* ────────────────────────────────────────────────────────── filters */

/**
 * Search, shaped so every branch can use an index.
 *
 * A single OR spanning Application, Customer and User cannot use the trigram
 * indexes — Postgres has to scan and filter. Looking each table up on its own
 * first turns that into three indexed lookups (verified with EXPLAIN: a bitmap
 * OR across User_name_trgm_idx and User_mobile_trgm_idx).
 */
const SEARCH_CANDIDATE_LIMIT = 5000;

async function searchWhere(
  search: string,
): Promise<Prisma.ApplicationWhereInput[]> {
  const term = search.trim();
  if (!term) return [];

  const [people, businesses] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { mobile: { contains: term, mode: "insensitive" } },
        ],
      },
      select: { customer: { select: { id: true } } },
      take: SEARCH_CANDIDATE_LIMIT,
    }),
    prisma.customer.findMany({
      where: { businessName: { contains: term, mode: "insensitive" } },
      select: { id: true },
      take: SEARCH_CANDIDATE_LIMIT,
    }),
  ]);

  const customerIds = new Set<string>();
  for (const person of people) {
    if (person.customer) customerIds.add(person.customer.id);
  }
  for (const business of businesses) customerIds.add(business.id);

  return [
    {
      OR: [
        { applicationNo: { contains: term, mode: "insensitive" } },
        { customerId: { in: [...customerIds] } },
      ],
    },
  ];
}

function filterWhere(filter: DeskFilter): Prisma.ApplicationWhereInput[] {
  if (filter === "all") return [];

  if (filter === "not_logged_in") {
    // An account was created and never used. Not a status — a fact about
    // the person, which is exactly why it is worth chasing.
    return [{ customer: { user: { lastLoginAt: null } } }];
  }

  const statuses = FILTER_STATUSES[filter];
  return statuses ? [{ status: { in: statuses } }] : [];
}

export async function deskWhere(query: {
  search: string;
  filter: DeskFilter;
}): Promise<Prisma.ApplicationWhereInput> {
  const clauses = [
    ...(await searchWhere(query.search)),
    ...filterWhere(query.filter),
  ];
  return clauses.length > 0 ? { AND: clauses } : {};
}

function orderBy(
  sort: SortKey,
  direction: SortDirection,
): Prisma.ApplicationOrderByWithRelationInput[] {
  switch (sort) {
    case "customer":
      return [{ customer: { user: { name: direction } } }, { id: "asc" }];
    case "business_type":
      return [{ category: { name: direction } }, { id: "asc" }];
    case "licence":
      return [{ licenceType: direction }, { id: "asc" }];
    case "status":
      return [{ status: direction }, { id: "asc" }];
    case "updated":
    default:
      return [{ updatedAt: direction }, { id: "asc" }];
  }
}

/* ─────────────────────────────────────────────── section totals */

/**
 * How many sections each category has to answer — core plus its extras.
 * Two small queries, reused for every row on the page.
 */
async function sectionTotals(): Promise<Map<string, number>> {
  const [sections, categories] = await Promise.all([
    prisma.formSection.findMany({ select: { key: true, isCore: true } }),
    prisma.businessCategory.findMany({
      select: { id: true, extraSections: true },
    }),
  ]);

  const coreCount = sections.filter((section) => section.isCore).length;
  const known = new Set(sections.map((section) => section.key));

  const totals = new Map<string, number>();
  for (const category of categories) {
    const extras = category.extraSections.filter(
      (key) => known.has(key) && !sections.find((s) => s.key === key)?.isCore,
    );
    totals.set(category.id, coreCount + extras.length);
  }
  return totals;
}

/* ─────────────────────────────────────────────────────────── list */

export async function listApplications(query: DeskQuery): Promise<DeskPage> {
  const where = await deskWhere(query);
  const page = Math.max(1, query.page);

  const [total, applications, totals] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: orderBy(query.sort, query.direction),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      // One join, not one query per row.
      select: {
        id: true,
        applicationNo: true,
        licenceType: true,
        status: true,
        completedSections: true,
        updatedAt: true,
        categoryId: true,
        category: { select: { name: true } },
        customer: {
          select: {
            businessName: true,
            user: { select: { name: true, mobile: true, lastLoginAt: true } },
          },
        },
      },
    }),
    sectionTotals(),
  ]);

  const rows: DeskRow[] = applications.map((application) => ({
    applicationId: application.id,
    applicationNo: application.applicationNo,
    customerName: application.customer.user.name,
    businessName: application.customer.businessName,
    mobile: application.customer.user.mobile,
    categoryName: application.category.name,
    licenceType: application.licenceType,
    status: application.status,
    lastLoginAt: application.customer.user.lastLoginAt,
    completedSections: application.completedSections.length,
    totalSections: totals.get(application.categoryId) ?? 0,
    updatedAt: application.updatedAt,
  }));

  return {
    rows,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/* ───────────────────────────────────────────────────────── counts */

/**
 * Live counts for every chip, honouring the current search. Two queries: one
 * grouped by status, one for the never-logged-in list.
 */
export async function deskCounts(
  search: string,
): Promise<Record<DeskFilter, number>> {
  const base = await deskWhere({ search, filter: "all" });

  const [grouped, notLoggedIn] = await Promise.all([
    prisma.application.groupBy({
      by: ["status"],
      where: base,
      _count: { _all: true },
    }),
    prisma.application.count({
      where: {
        AND: [base, { customer: { user: { lastLoginAt: null } } }],
      },
    }),
  ]);

  const byStatus = new Map<AppStatus, number>(
    grouped.map((entry) => [entry.status, entry._count._all]),
  );
  const sum = (statuses: AppStatus[]) =>
    statuses.reduce((total, status) => total + (byStatus.get(status) ?? 0), 0);

  return {
    all: grouped.reduce((total, entry) => total + entry._count._all, 0),
    not_logged_in: notLoggedIn,
    in_progress: sum(FILTER_STATUSES.in_progress ?? []),
    awaiting_review: sum(FILTER_STATUSES.awaiting_review ?? []),
    query_raised: sum(FILTER_STATUSES.query_raised ?? []),
    filed: sum(FILTER_STATUSES.filed ?? []),
    issued: sum(FILTER_STATUSES.issued ?? []),
  };
}

/* ──────────────────────────────────────────────── query parsing */

export function parseDeskQuery(params: {
  q?: string;
  filter?: string;
  sort?: string;
  dir?: string;
  page?: string;
}): DeskQuery {
  const filter = DESK_FILTERS.includes(params.filter as DeskFilter)
    ? (params.filter as DeskFilter)
    : "all";
  const sort = SORT_KEYS.includes(params.sort as SortKey)
    ? (params.sort as SortKey)
    : "updated";

  return {
    search: (params.q ?? "").slice(0, 100),
    filter,
    sort,
    direction: params.dir === "asc" ? "asc" : "desc",
    page: Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1),
  };
}
