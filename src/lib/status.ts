import type { AppStatus, DocStatus, LicenceType } from "@prisma/client";
import type { StatusTone } from "@/components/ui";

/** Status is the only place colour is allowed, so the mapping lives in one file. */
export const APP_STATUS: Record<
  AppStatus,
  { label: string; tone: StatusTone }
> = {
  DRAFT: { label: "Draft", tone: "idle" },
  SUBMITTED: { label: "Awaiting review", tone: "wait" },
  UNDER_REVIEW: { label: "Under review", tone: "wait" },
  QUERY_RAISED: { label: "Query raised", tone: "stop" },
  READY_TO_FILE: { label: "Ready to file", tone: "ok" },
  FILED: { label: "Filed with FSSAI", tone: "ok" },
  FSSAI_QUERY: { label: "FSSAI query", tone: "stop" },
  ISSUED: { label: "Licence issued", tone: "ok" },
  REJECTED: { label: "Rejected", tone: "stop" },
  CLOSED: { label: "Closed", tone: "idle" },
};

export const DOC_STATUS: Record<
  DocStatus,
  { label: string; tone: StatusTone }
> = {
  AWAITING: { label: "Awaiting upload", tone: "idle" },
  PENDING: { label: "Pending review", tone: "wait" },
  APPROVED: { label: "Approved", tone: "ok" },
  REJECTED: { label: "Re-upload needed", tone: "stop" },
};

export const LICENCE_TYPE: Record<LicenceType, string> = {
  BASIC: "Basic Registration",
  STATE: "State Licence",
  CENTRAL: "Central Licence",
};
