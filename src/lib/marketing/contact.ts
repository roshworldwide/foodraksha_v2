/**
 * Real contact details for the marketing website.
 *
 * These are the client's real values and must come from docs/CONTACT.md. That
 * file does not exist yet, so every value below is a clearly-marked
 * [PLACEHOLDER] and the build prints a warning. We never invent a phone number
 * or an address — a plausible-looking fake is worse than an obvious blank.
 *
 * When docs/CONTACT.md arrives: replace the values, set PLACEHOLDER = false,
 * and the warning goes away.
 */

/** Flip to false once the real values from docs/CONTACT.md are filled in. */
export const CONTACT_IS_PLACEHOLDER = true;

const P = "[PLACEHOLDER]";

export interface ContactDetails {
  /** Public enquiries inbox. */
  email: string;
  /** E.164 for tel: links. */
  phoneHref: string;
  /** Human-readable, for display. */
  phoneDisplay: string;
  /** wa.me number (digits only), or null. */
  whatsapp: string | null;
  /** Street line. */
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  /** Opening hours, one line. */
  hours: string;
  social: {
    instagram: string | null;
    linkedin: string | null;
    facebook: string | null;
  };
}

export const CONTACT: ContactDetails = {
  email: `${P} hello@foodraksha.in`,
  phoneHref: "", // deliberately empty so tel: links are omitted until real
  phoneDisplay: `${P} +91 00000 00000`,
  whatsapp: null,
  addressLine: `${P} street / building`,
  city: `${P} city`,
  state: `${P} state`,
  pincode: `${P} 000000`,
  hours: `${P} Mon–Sat, 10am–7pm`,
  social: {
    instagram: null,
    linkedin: null,
    facebook: null,
  },
};

/** Full postal address on one line, for footer / JSON-LD. */
export function fullAddress(): string {
  return [
    CONTACT.addressLine,
    CONTACT.city,
    CONTACT.state,
    CONTACT.pincode,
  ].join(", ");
}

// A single, loud build-time warning. Rendered server-side at build, so it lands
// in the Vercel/`next build` log where whoever ships this will see it.
if (CONTACT_IS_PLACEHOLDER && typeof window === "undefined") {
  console.warn(
    "\n⚠️  [marketing/contact] Using PLACEHOLDER contact details — docs/CONTACT.md is missing.\n" +
      "    Fill in src/lib/marketing/contact.ts and set CONTACT_IS_PLACEHOLDER = false before launch.\n",
  );
}
