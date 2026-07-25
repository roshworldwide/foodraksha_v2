import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mobileSchema } from "@/lib/validation";
import { licenceInfo, licenceForBand, TURNOVER_BANDS } from "./qualifier";

/**
 * The website lead — a soft enquiry, distinct from /api/public/signup which
 * creates a full account. A lead lands in the CRM's "Website Enquiries" inbox
 * (source = "website") for the team to convert manually. No credentials are
 * ever issued here.
 */

const attribution = z.string().trim().max(500).optional();

const turnoverValues = TURNOVER_BANDS.map((b) => b.value) as [
  string,
  ...string[],
];

export const leadSchema = z.object({
  name: z
    .string({ error: "Enter your name" })
    .trim()
    .min(2, "Enter your name")
    .max(120, "That name is too long"),
  mobile: mobileSchema,
  /** Free-text business type / kind of business (label, not a category code). */
  businessType: z
    .string({ error: "Tell us your kind of business" })
    .trim()
    .min(2, "Tell us your kind of business")
    .max(80, "That is too long"),
  /** Qualifier turnover band; optional so a bare "call me back" still works. */
  turnover: z.enum(turnoverValues).optional(),
  serviceInterest: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  message: z
    .string()
    .trim()
    .max(1000, "Please keep it under 1000 characters")
    .optional(),
  /** DPDP Act 2023 — no lead is stored without consent to be contacted. */
  consent: z
    .boolean({ error: "Please agree so we can call you back" })
    .refine((v) => v, "Please agree so we can call you back"),
  utmSource: attribution,
  utmMedium: attribution,
  utmCampaign: attribution,
  referrer: attribution,
});

export type LeadInput = z.infer<typeof leadSchema>;

/**
 * The Lead model has no columns for turnover, service interest or a message, and
 * this stage must not migrate the schema — so those, plus the qualifier's
 * licence read-out and any page referrer, are composed into a single readable
 * note stored in `referrer`. The essentials (name, mobile, business type, city)
 * map to their own columns and show directly in the Website Enquiries screen.
 */
function composeNote(input: LeadInput): string | null {
  const parts: string[] = [];
  if (input.turnover) {
    const band = TURNOVER_BANDS.find((b) => b.value === input.turnover);
    if (band) {
      const licence = licenceInfo(licenceForBand(input.turnover));
      parts.push(`Turnover: ${band.label} → ${licence.name}`);
    }
  }
  if (input.serviceInterest)
    parts.push(`Interested in: ${input.serviceInterest}`);
  if (input.message) parts.push(`Message: ${input.message}`);
  if (input.referrer) parts.push(`Page: ${input.referrer}`);
  const note = parts.join(" · ");
  return note ? note.slice(0, 500) : null;
}

export async function createWebsiteLead(
  input: LeadInput,
  meta: { ipAddress: string | null },
): Promise<{ id: string }> {
  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      mobile: input.mobile,
      businessType: input.businessType,
      city: input.city,
      source: "website",
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      // Qualifier detail the schema has no home for — see composeNote.
      referrer: composeNote(input),
      ipAddress: meta.ipAddress,
      consentAt: new Date(),
    },
    select: { id: true },
  });
  return lead;
}
