import { env } from "@/lib/env";
import { createMsg91Adapter } from "./msg91";
import { createResendAdapter } from "./resend";
import type { EmailAdapter, SmsAdapter } from "./types";

export * from "./types";

/**
 * Returns null when the provider is not configured. The caller reports that
 * as "skipped" — signup never depends on delivery succeeding.
 */
export function getEmailAdapter(): EmailAdapter | null {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return null;
  return createResendAdapter({
    apiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM,
    replyTo: env.EMAIL_REPLY_TO,
  });
}

export function getSmsAdapter(): SmsAdapter | null {
  if (!env.MSG91_AUTH_KEY) return null;
  return createMsg91Adapter({
    authKey: env.MSG91_AUTH_KEY,
    senderId: env.MSG91_SENDER_ID,
    defaultTemplateId: env.MSG91_TEMPLATE_ID_CREDENTIALS,
  });
}
