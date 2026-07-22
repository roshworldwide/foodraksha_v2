import type { QuestionnaireContext } from "@/lib/questionnaire/application";
import type { AnswerMap, GroupRow } from "@/lib/questionnaire/schema";
import { prisma } from "@/lib/prisma";
import { getObject, isStorageConfigured } from "@/lib/storage";

/**
 * Everything the annexure templates read, assembled once from the answers.
 *
 * Two rules run through all of it: nothing here reads the clock, so the same
 * application always produces the same document; and a missing answer becomes
 * a blank line for someone to complete by hand, never the word "undefined".
 */

/** A line to be filled in by hand. */
export const BLANK = "_________________________";

export function orBlank(value: unknown): string {
  if (value === null || value === undefined) return BLANK;
  const text = String(value).trim();
  return text.length > 0 ? text : BLANK;
}

/** Blank-safe join, e.g. address lines. */
function joined(
  parts: (string | null | undefined)[],
  separator = ", ",
): string {
  const filled = parts
    .map((part) => (part ?? "").trim())
    .filter((part) => part.length > 0);
  return filled.length > 0 ? filled.join(separator) : BLANK;
}

function text(answers: AnswerMap, key: string): string | null {
  const value = answers[key];
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

function rows(answers: AnswerMap, key: string): GroupRow[] {
  const value = answers[key];
  return Array.isArray(value) && value.every((row) => typeof row === "object")
    ? (value as GroupRow[])
    : [];
}

export interface AnnexurePerson {
  name: string;
  designation: string;
  address: string;
  contact: string;
  idDetails: string;
  appointedOn: string;
  /** True when this row was filled in from the applicant rather than a list. */
  fromApplicant: boolean;
}

export interface AnnexureLetterhead {
  name: string;
  address: string;
  contact: string;
  cin: string;
  logo: string | null;
}

export interface AnnexureContext {
  applicationNo: string;
  constitution: string | null;
  categoryCode: string;
  business: {
    legalName: string;
    tradeName: string;
    pan: string;
    gstin: string;
  };
  applicant: {
    name: string;
    designation: string;
    mobile: string;
    email: string;
  };
  premisesAddress: string;
  letterhead: AnnexureLetterhead;
  people: AnnexurePerson[];
  nominees: { name: string; designation: string; address: string }[];
  foodCategories: string[];
  equipment: { name: string; quantity: string; capacity: string }[];
  installedCapacity: string;
  waterSource: string;
  /** Signed and dated by hand unless the application carries the values. */
  place: string;
  date: string;
  /**
   * Stamped into the PDF metadata. Fixed rather than "now", so regenerating
   * an unchanged application produces byte-identical output.
   */
  documentDate: Date;
  signature: string | null;
}

async function imageDataUri(fileKey: string): Promise<string | null> {
  if (!isStorageConfigured()) return null;
  try {
    const buffer = await getObject(fileKey);
    const type = fileKey.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${type};base64,${buffer.toString("base64")}`;
  } catch (error) {
    // A missing image must not cost the customer their document.
    console.error(`[annexures] could not read ${fileKey}:`, error);
    return null;
  }
}

/** Stand-in date for an application that has not been submitted yet. */
const EPOCH = new Date(0);

/** IST, and only ever from stored data — never from the clock. */
const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export async function buildAnnexureContext(
  context: QuestionnaireContext,
  options: { categoryCode: string; submittedAt: Date | null },
): Promise<AnnexureContext> {
  const answers = context.answers;

  const premisesAddress = joined([
    text(answers, "premises.address_1"),
    text(answers, "premises.address_2"),
    text(answers, "premises.city"),
    text(answers, "premises.district"),
    text(answers, "premises.state"),
    text(answers, "premises.pincode"),
  ]);

  const applicant = {
    name: orBlank(text(answers, "applicant.full_name")),
    designation: orBlank(text(answers, "applicant.designation")),
    mobile: orBlank(text(answers, "applicant.mobile")),
    email: orBlank(text(answers, "applicant.email")),
  };

  // Directors, partners or executive members as listed. A proprietorship has
  // no list, so the applicant is the single person — which is exactly what
  // "In case of individual — Proprietor" asks for.
  const listed = rows(answers, "business.directors");
  const people: AnnexurePerson[] =
    listed.length > 0
      ? listed.map((row) => ({
          name: orBlank(row.name),
          designation: orBlank(row.designation),
          address: orBlank(row.address),
          contact: orBlank(row.contact),
          idDetails: orBlank(row.id_details),
          appointedOn: orBlank(row.appointed_on),
          fromApplicant: false,
        }))
      : [
          {
            name: applicant.name,
            designation: applicant.designation,
            address: premisesAddress,
            contact: applicant.mobile,
            idDetails: text(answers, "applicant.aadhaar_no")
              ? `Aadhaar ${text(answers, "applicant.aadhaar_no")}`
              : BLANK,
            appointedOn: BLANK,
            fromApplicant: true,
          },
        ];

  const nomineeName = text(answers, "nominee.name");
  const nominees = nomineeName
    ? [
        {
          name: nomineeName,
          designation: orBlank(text(answers, "nominee.designation")),
          address: orBlank(text(answers, "nominee.address")),
        },
      ]
    : // No nominee section for this category: the person in charge is the
      // applicant, which staff can override by filling the Nominee section.
      [
        {
          name: applicant.name,
          designation: applicant.designation,
          address: premisesAddress,
        },
      ];

  // The two images that get embedded. One query for their storage keys; the
  // keys never leave the server.
  const files = await prisma.document.findMany({
    where: {
      applicationId: context.application.id,
      docType: { in: ["applicant.signature", "doc.letterhead_logo"] },
      status: { not: "REJECTED" },
    },
    select: { docType: true, fileKey: true },
  });
  const keyFor = new Map(files.map((file) => [file.docType, file.fileKey]));

  const [signature, logo] = await Promise.all([
    keyFor.has("applicant.signature")
      ? imageDataUri(keyFor.get("applicant.signature") as string)
      : Promise.resolve(null),
    keyFor.has("doc.letterhead_logo")
      ? imageDataUri(keyFor.get("doc.letterhead_logo") as string)
      : Promise.resolve(null),
  ]);

  return {
    applicationNo: context.application.applicationNo,
    constitution: text(answers, "business.constitution"),
    categoryCode: options.categoryCode,
    business: {
      legalName: orBlank(text(answers, "business.legal_name")),
      tradeName: orBlank(text(answers, "business.trade_name")),
      pan: orBlank(text(answers, "business.pan")),
      gstin: orBlank(text(answers, "business.gstin")),
    },
    applicant,
    premisesAddress,
    letterhead: {
      name: orBlank(
        text(answers, "letterhead.name") ??
          text(answers, "business.legal_name"),
      ),
      address: text(answers, "letterhead.address") ?? premisesAddress,
      contact:
        text(answers, "letterhead.contact") ??
        joined(
          [text(answers, "applicant.mobile"), text(answers, "applicant.email")],
          " · ",
        ),
      cin: orBlank(text(answers, "letterhead.cin")),
      logo,
    },
    people,
    nominees,
    foodCategories: Array.isArray(answers["licence.food_categories"])
      ? (answers["licence.food_categories"] as string[])
      : [],
    equipment: rows(answers, "equipment.list").map((row) => ({
      name: orBlank(row.name),
      quantity: orBlank(row.quantity),
      capacity: orBlank(row.capacity),
    })),
    installedCapacity: orBlank(text(answers, "equipment.installed_capacity")),
    waterSource: orBlank(text(answers, "water.source")),
    place: orBlank(text(answers, "declaration.place")),
    date: options.submittedAt ? DATE_FORMAT.format(options.submittedAt) : BLANK,
    documentDate: options.submittedAt ?? EPOCH,
    signature,
  };
}
