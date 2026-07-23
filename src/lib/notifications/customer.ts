import { env } from "@/lib/env";
import { getEmailAdapter, getSmsAdapter } from "./index";

/**
 * Customer-facing notifications for the status pipeline: query raised, document
 * rejected, filed, licence issued.
 *
 * Every one is best effort and self-contained. Exactly as with the signup
 * credentials, a provider being down must never undo the action that triggered
 * the message — the caller has already committed it before we are called.
 * Failures are logged, never thrown.
 */

export interface Recipient {
  name: string;
  mobile: string;
  email: string | null;
}

interface Message {
  subject: string;
  /** Plain-language body. Always ends with a direct link. */
  lines: string[];
  /** SMS template variables, for the DLT template. */
  smsVars: Record<string, string>;
  smsText: string;
}

/**
 * Wrap the plain-text lines in a simple branded HTML email.
 *
 * The mark is an inline SVG (blue/green) so it needs no hosted asset; clients
 * that strip SVG fall back to the alt text and the plain-text part.
 * TODO(brand): if broad email-client support matters, host a PNG of the mark
 * at NEXT_PUBLIC_APP_URL/brand and reference it here instead.
 */
function brandedHtml(lines: string[]): string {
  const body = lines
    .map((line) =>
      line.trim() === ""
        ? '<div style="height:10px"></div>'
        : `<p style="margin:0 0 10px;font-size:15px;line-height:1.5;color:#1D1D1F">${line}</p>`,
    )
    .join("");
  const mark = `<svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="FoodRaksha"><path d="M24 3.2l16.2 5.6a1.6 1.6 0 0 1 1.1 1.5v11.9c0 9.9-6.9 18.5-16.7 21.5a2 2 0 0 1-1.2 0C13.6 40.7 6.7 32.1 6.7 22.2V10.3a1.6 1.6 0 0 1 1.1-1.5z" fill="#1E4FA8"/><path d="M24 13.2c5.9 0 10.7 4.4 10.7 10.6 0 5.2-3.6 9.8-9.4 11.2a1 1 0 0 1-1.2-.8c-1-5.6.4-10.9 4.6-15.1a.6.6 0 0 0-.8-.9c-4.2 2.9-6.6 6.8-7.4 11.6-1.9-2-3.2-4.7-3.2-7.9 0-6.2 4.8-9.8 6.1-9.8z" fill="#43A57A"/></svg>`;
  return `<!doctype html><html><body style="margin:0;background:#EFEDE8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:520px;margin:0 auto;padding:24px">
  <div style="display:flex;align-items:center;gap:8px;padding-bottom:14px;border-bottom:1px solid rgba(60,60,67,.16)">
    ${mark}<span style="font-size:18px;font-weight:700;color:#1D1D1F">FoodRaksha</span>
  </div>
  <div style="background:#fff;border-radius:14px;padding:24px;margin-top:16px">${body}</div>
  <p style="margin:16px 0 0;font-size:12px;color:rgba(60,60,67,.6);text-align:center">FSSAI licensing, handled.</p>
</div></body></html>`;
}

async function deliver(
  recipient: Recipient,
  message: Message,
  context: string,
): Promise<void> {
  const email = getEmailAdapter();
  const sms = getSmsAdapter();

  await Promise.all([
    (async () => {
      if (!email || !recipient.email) return;
      try {
        await email.send({
          to: recipient.email,
          subject: message.subject,
          text: message.lines.join("\n"),
          html: brandedHtml(message.lines),
        });
      } catch (error) {
        console.error(
          `[notify] ${context} email failed:`,
          error instanceof Error ? error.message : "unknown error",
        );
      }
    })(),
    (async () => {
      if (!sms) return;
      try {
        await sms.send({
          to: recipient.mobile,
          text: message.smsText,
          templateId: env.MSG91_TEMPLATE_ID_STATUS_UPDATE,
          variables: message.smsVars,
        });
      } catch (error) {
        console.error(
          `[notify] ${context} SMS failed:`,
          error instanceof Error ? error.message : "unknown error",
        );
      }
    })(),
  ]);
}

function link(path: string): string {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`;
}

/* ─────────────────────────────────────────────────── query raised */

export function notifyQueryRaised(
  recipient: Recipient,
  data: { applicationNo: string; message: string },
): Promise<void> {
  const url = link("/dashboard");
  return deliver(
    recipient,
    {
      subject: `Action needed on your FSSAI application — ${data.applicationNo}`,
      lines: [
        `Hello ${recipient.name},`,
        "",
        `Our team needs something from you before we can move ${data.applicationNo} forward:`,
        "",
        `"${data.message}"`,
        "",
        `Please open your dashboard to sort it out: ${url}`,
        "",
        "FoodRaksha",
      ],
      smsText: `FoodRaksha: we need something from you on application ${data.applicationNo}. Please check your dashboard: ${url}`,
      smsVars: {
        NAME: recipient.name,
        APPLICATION: data.applicationNo,
      },
    },
    "query-raised",
  );
}

/* ────────────────────────────────────────────────── document rejected */

export function notifyDocumentRejected(
  recipient: Recipient,
  data: { applicationNo: string; documentLabel: string; reason: string },
): Promise<void> {
  const url = link("/application/documents");
  return deliver(
    recipient,
    {
      subject: `Please re-upload a document — ${data.applicationNo}`,
      lines: [
        `Hello ${recipient.name},`,
        "",
        `One of your documents needs to be sent again:`,
        "",
        `${data.documentLabel} — ${data.reason}`,
        "",
        `Upload a new copy here: ${url}`,
        "",
        "FoodRaksha",
      ],
      smsText: `FoodRaksha: your "${data.documentLabel}" needs re-uploading. ${url}`,
      smsVars: {
        NAME: recipient.name,
        APPLICATION: data.applicationNo,
      },
    },
    "document-rejected",
  );
}

/* ────────────────────────────────────────────────────────── filed */

export function notifyFiled(
  recipient: Recipient,
  data: { applicationNo: string; referenceNo: string },
): Promise<void> {
  const url = link("/dashboard");
  return deliver(
    recipient,
    {
      subject: `Your FSSAI application has been filed — ${data.applicationNo}`,
      lines: [
        `Hello ${recipient.name},`,
        "",
        `Good news — ${data.applicationNo} has been filed with FSSAI.`,
        `FSSAI reference number: ${data.referenceNo}`,
        "",
        "We will let you know the moment there is an update.",
        `Track it any time: ${url}`,
        "",
        "FoodRaksha",
      ],
      smsText: `FoodRaksha: application ${data.applicationNo} filed with FSSAI. Reference ${data.referenceNo}. ${url}`,
      smsVars: {
        NAME: recipient.name,
        APPLICATION: data.applicationNo,
        REFERENCE: data.referenceNo,
      },
    },
    "filed",
  );
}

/* ─────────────────────────────────────────────────── licence issued */

export function notifyLicenceIssued(
  recipient: Recipient,
  data: { applicationNo: string; licenceNo: string },
): Promise<void> {
  const url = link("/dashboard");
  return deliver(
    recipient,
    {
      subject: `Your FSSAI licence has been issued — ${data.licenceNo}`,
      lines: [
        `Hello ${recipient.name},`,
        "",
        `Congratulations — your FSSAI licence has been issued.`,
        `Licence number: ${data.licenceNo}`,
        "",
        `Download your licence from your dashboard: ${url}`,
        "",
        "FoodRaksha",
      ],
      smsText: `FoodRaksha: your FSSAI licence ${data.licenceNo} has been issued. Download it here: ${url}`,
      smsVars: {
        NAME: recipient.name,
        APPLICATION: data.applicationNo,
        LICENCE: data.licenceNo,
      },
    },
    "licence-issued",
  );
}
