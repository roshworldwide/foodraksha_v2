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
