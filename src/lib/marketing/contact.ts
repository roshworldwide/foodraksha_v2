/**
 * Contact details for the marketing website. Source of truth: docs/CONTACT.md.
 *
 * That file now exists. Business name and office hours are real. Phone, email,
 * address and social are still [PLACEHOLDER] — the client is supplying the real
 * ones. We never invent a phone number or an address: a placeholder value is
 * rendered in a clearly-marked amber pill, and the build prints a warning.
 *
 * Any value that begins with "[" is a placeholder (see isPlaceholder).
 */

/** True while any critical contact value (phone/email/address) is a placeholder. */
export const CONTACT_IS_PLACEHOLDER = true;

export interface ContactDetails {
  businessName: string;
  /** Public enquiries inbox. */
  email: string;
  /** E.164 for tel: links; empty string while unknown. */
  phoneHref: string;
  /** Human-readable phone, for display. */
  phoneDisplay: string;
  /** wa.me number (digits only), or null. */
  whatsapp: string | null;
  /** Single-line office address, for display. */
  address: string;
  /** Real, confirmed. */
  hours: string;
  social: {
    facebook: string | null;
    instagram: string | null;
    x: string | null;
  };
}

export const CONTACT: ContactDetails = {
  businessName: "Food Raksha", // real
  email: "[email — awaiting real address]",
  phoneHref: "",
  phoneDisplay: "[phone — awaiting real number]",
  whatsapp: null,
  address: "[office address — Pune / Mumbai]",
  hours: "Mon–Sat, 9 AM – 6 PM IST", // real (docs/CONTACT.md corrected the old "PST")
  social: {
    facebook: null,
    instagram: null,
    x: null,
  },
};

/** A value the client still has to supply. */
export function isPlaceholder(value: string): boolean {
  return value.trim().startsWith("[");
}

/** Full postal address on one line, for footer / JSON-LD. */
export function fullAddress(): string {
  return CONTACT.address;
}

// One loud build-time warning while critical contact values are unset.
if (CONTACT_IS_PLACEHOLDER && typeof window === "undefined") {
  console.warn(
    "\n⚠️  [marketing/contact] docs/CONTACT.md is present, but phone / email / address are still PLACEHOLDERS.\n" +
      "    Fill the real values in src/lib/marketing/contact.ts and set CONTACT_IS_PLACEHOLDER = false before launch.\n",
  );
}
