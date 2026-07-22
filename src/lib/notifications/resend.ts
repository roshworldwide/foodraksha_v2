import type { EmailAdapter, EmailMessage } from "./types";

const ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 8_000;

export function createResendAdapter(config: {
  apiKey: string;
  from: string;
  replyTo?: string;
}): EmailAdapter {
  return {
    name: "resend",
    async send(message: EmailMessage): Promise<void> {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
          reply_to: config.replyTo,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        // Provider errors describe the request, never echo the body back.
        const detail = (await response.text()).slice(0, 200);
        throw new Error(`Resend responded ${response.status}: ${detail}`);
      }
    },
  };
}
