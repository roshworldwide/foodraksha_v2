import type { SmsAdapter, SmsMessage } from "./types";

const ENDPOINT = "https://control.msg91.com/api/v5/flow/";
const TIMEOUT_MS = 8_000;

/**
 * MSG91 Flow API. Indian operators require a DLT-registered template, so the
 * body is sent as template variables rather than free text.
 */
export function createMsg91Adapter(config: {
  authKey: string;
  senderId?: string;
  defaultTemplateId?: string;
}): SmsAdapter {
  return {
    name: "msg91",
    async send(message: SmsMessage): Promise<void> {
      const templateId = message.templateId ?? config.defaultTemplateId;
      if (!templateId) {
        throw new Error("MSG91 needs a DLT template id — none configured");
      }

      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          authkey: config.authKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: templateId,
          sender: config.senderId,
          short_url: "0",
          recipients: [
            {
              // MSG91 wants country code without the leading plus.
              mobiles: message.to.replace(/^\+/, ""),
              ...message.variables,
            },
          ],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      const body = (await response.text()).slice(0, 200);
      if (!response.ok) {
        throw new Error(`MSG91 responded ${response.status}: ${body}`);
      }
      // MSG91 answers 200 with {"type":"error"} for rejected sends.
      if (body.includes('"type":"error"')) {
        throw new Error(`MSG91 rejected the message: ${body}`);
      }
    },
  };
}
