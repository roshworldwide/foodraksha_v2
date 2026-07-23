import type { DocStatus } from "@prisma/client";
import type { AnswerMap } from "@/lib/questionnaire/schema";

/**
 * The pre-flight check. Everything that would stop a filing halfway through
 * the portal — a malformed value, a required document not yet approved — is
 * surfaced here, before staff start, where it costs seconds instead of a
 * restart.
 */

export type CheckSeverity = "error" | "warning";

export interface CheckIssue {
  severity: CheckSeverity;
  label: string;
  detail: string;
}

interface Rule {
  key: string;
  label: string;
  /** Return an error string when the value is wrong, or null when it is fine. */
  check: (value: string | null) => string | null;
  required: boolean;
}

function value(answers: AnswerMap, key: string): string | null {
  const raw = answers[key];
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (typeof raw === "number") return String(raw);
  return null;
}

const PIN = /^[1-9]\d{5}$/;
const MOBILE = /^[6-9]\d{9}$/;
const PAN = /^[A-Z]{5}\d{4}[A-Z]$/;
const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;
const AADHAAR = /^[2-9]\d{11}$/;

const RULES: Rule[] = [
  {
    key: "business.legal_name",
    label: "Business name",
    required: true,
    check: (v) => (v ? null : "not answered"),
  },
  {
    key: "applicant.full_name",
    label: "Applicant name",
    required: true,
    check: (v) => (v ? null : "not answered"),
  },
  {
    key: "applicant.mobile",
    label: "Contact number",
    required: true,
    check: (v) =>
      v && !MOBILE.test(v.replace(/^\+91/, ""))
        ? "not a 10-digit mobile"
        : null,
  },
  {
    key: "business.pan",
    label: "PAN",
    required: true,
    check: (v) => (v && !PAN.test(v) ? "not a valid PAN" : null),
  },
  {
    key: "business.gstin",
    label: "GSTIN",
    required: false,
    check: (v) => (v && !GSTIN.test(v) ? "not 15 valid characters" : null),
  },
  {
    key: "applicant.aadhaar_no",
    label: "Aadhaar number",
    required: false,
    check: (v) => (v && !AADHAAR.test(v) ? "not 12 digits" : null),
  },
  {
    key: "premises.pincode",
    label: "PIN code",
    required: true,
    check: (v) => (v && !PIN.test(v) ? "not a 6-digit PIN" : null),
  },
  {
    key: "premises.city",
    label: "City",
    required: true,
    check: (v) => (v ? null : "not answered"),
  },
  {
    key: "premises.state",
    label: "State",
    required: true,
    check: (v) => (v ? null : "not answered"),
  },
];

export interface DocumentForCheck {
  label: string;
  status: DocStatus;
  required: boolean;
}

export interface CompletenessResult {
  issues: CheckIssue[];
  errorCount: number;
  warningCount: number;
  /** True when nothing would block a clean filing. */
  ready: boolean;
}

export function checkCompleteness(
  answers: AnswerMap,
  documents: DocumentForCheck[],
): CompletenessResult {
  const issues: CheckIssue[] = [];

  for (const rule of RULES) {
    const current = value(answers, rule.key);

    if (!current) {
      if (rule.required) {
        issues.push({
          severity: "error",
          label: rule.label,
          detail: "is required and has not been answered",
        });
      }
      continue;
    }

    const problem = rule.check(current);
    if (problem) {
      issues.push({
        severity: "error",
        label: rule.label,
        detail: problem,
      });
    }
  }

  // Documents: a required document that is missing or rejected is a hard stop;
  // one still awaiting review is a warning, since staff may attach it anyway.
  for (const document of documents) {
    if (document.status === "REJECTED") {
      issues.push({
        severity: "error",
        label: document.label,
        detail: "was rejected — the customer must re-upload before filing",
      });
    } else if (document.required && document.status === "AWAITING") {
      issues.push({
        severity: "error",
        label: document.label,
        detail: "is required and has not been uploaded",
      });
    } else if (document.status === "PENDING") {
      issues.push({
        severity: "warning",
        label: document.label,
        detail: "has not been reviewed yet",
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.length - errorCount;

  return {
    issues,
    errorCount,
    warningCount,
    ready: errorCount === 0,
  };
}
