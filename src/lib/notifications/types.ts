/**
 * Delivery adapters. Resend and MSG91 are today's choices, not commitments —
 * anything that satisfies these two interfaces can replace them without the
 * signup flow noticing.
 */

export interface EmailMessage {
  /** Single recipient address. */
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailAdapter {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}

export interface SmsMessage {
  /** E.164, e.g. +919845021764. */
  to: string;
  /** Plain text — used by providers that accept free-form bodies. */
  text: string;
  /** DLT-registered template id, required by Indian operators. */
  templateId?: string;
  /** Template variables, keyed as the template declares them. */
  variables?: Record<string, string>;
}

export interface SmsAdapter {
  readonly name: string;
  send(message: SmsMessage): Promise<void>;
}

export type DeliveryStatus = "sent" | "failed" | "skipped";

export interface DeliveryResult {
  status: DeliveryStatus;
  /** Where it went — shown back to the customer. Null when skipped. */
  to: string | null;
}
