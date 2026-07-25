import { LICENCES } from "./licences";

/**
 * The headline "Food License" service — the service detail panel that sits on
 * the home page (section 5 of docs/Website-Structure-Teardown.md) and the
 * membership page.
 *
 * Sourced, not invented:
 *  · Price — docs/Website-Structure-Teardown.md: 'Single "Food License"
 *    service: from ₹799 (was ₹999)'. This is our professional fee; the
 *    government fee is separate and comes from the calculator.
 *  · Benefits and description — the client's live membership page copy.
 *  · Documents — taken from LICENCES, so the panel can never drift from the
 *    document lists shown on /services.
 */

export interface ServiceOffer {
  name: string;
  /** Current professional fee in whole rupees. */
  priceFrom: number;
  /** The pre-discount price, struck through. */
  priceWas: number;
  benefits: string[];
  description: string;
}

export const FOOD_LICENCE_SERVICE: ServiceOffer = {
  name: "Food License",
  priceFrom: 799,
  priceWas: 999,
  benefits: [
    "Obtaining a food license builds legal trust, supports food safety, and helps business expansion.",
    "It improves compliance for manufacturing, storage, distribution, and sale activities.",
  ],
  description:
    "Any food business operator must register under FSSAI. Registration is generally for businesses with turnover below threshold limits, and license is mandatory as your scale grows. A valid FSSAI credential improves customer confidence and helps your business run smoothly with compliance support.",
};

/** What you save by buying now — derived, never typed twice. */
export const FOOD_LICENCE_SAVING =
  FOOD_LICENCE_SERVICE.priceWas - FOOD_LICENCE_SERVICE.priceFrom;

/**
 * How the filing actually runs. One source for the /services page and the
 * service panel's "Process & Documents" tab.
 */
export const PROCESS_STEPS: { title: string; body: string }[] = [
  {
    title: "Tell us about your business",
    body: "Turnover, type, city — the qualifier does the rest.",
  },
  {
    title: "We prepare & file",
    body: "Answer your questionnaire once; we fan it across every form and file with FoSCoS.",
  },
  {
    title: "Track it in your dashboard",
    body: "Watch it move from filed to licensed, and message us any time.",
  },
  {
    title: "Licence issued",
    body: "You get your FSSAI licence — with perpetual validity, no renewals.",
  },
];

/**
 * The documents a Registration needs — the entry-level case this service starts
 * at. A State or Central licence needs more, so the panel links to /services
 * rather than implying this list covers every licence.
 */
export const REGISTRATION_DOCUMENTS: string[] =
  LICENCES.find((licence) => licence.kind === "BASIC")?.documents ?? [];
