import { env } from "@/lib/env";
import { getEmailAdapter, getSmsAdapter } from "@/lib/notifications";

/**
 * Tell the customer their application has been lodged with FSSAI. Best effort,
 * exactly like the signup credentials: a provider being down must never undo a
 * filing that already happened.
 */
export interface FilingNotice {
  name: string;
  mobile: string;
  email: string | null;
  applicationNo: string;
  referenceNo: string;
}

export async function notifyFiled(notice: FilingNotice): Promise<void> {
  const loginUrl = `${env.NEXT_PUBLIC_APP_URL}/login`;

  const email = getEmailAdapter();
  const sms = getSmsAdapter();

  await Promise.all([
    (async () => {
      if (!email || !notice.email) return;
      try {
        await email.send({
          to: notice.email,
          subject: `Your FSSAI application has been filed — ${notice.applicationNo}`,
          text: [
            `Hello ${notice.name},`,
            "",
            `Good news — your application ${notice.applicationNo} has been filed with FSSAI.`,
            `FSSAI reference number: ${notice.referenceNo}`,
            "",
            "We will let you know as soon as there is an update.",
            `Track it any time: ${loginUrl}`,
            "",
            "FoodRaksha",
          ].join("\n"),
        });
      } catch (error) {
        console.error(
          `[filing] filed-notice email failed for ${notice.applicationNo}:`,
          error instanceof Error ? error.message : "unknown error",
        );
      }
    })(),
    (async () => {
      if (!sms) return;
      try {
        await sms.send({
          to: notice.mobile,
          text: `FoodRaksha: your FSSAI application ${notice.applicationNo} has been filed. Reference ${notice.referenceNo}. Track it at ${loginUrl}`,
          templateId: env.MSG91_TEMPLATE_ID_STATUS_UPDATE,
          variables: {
            NAME: notice.name,
            APPLICATION: notice.applicationNo,
            REFERENCE: notice.referenceNo,
          },
        });
      } catch (error) {
        console.error(
          `[filing] filed-notice SMS failed for ${notice.applicationNo}:`,
          error instanceof Error ? error.message : "unknown error",
        );
      }
    })(),
  ]);
}
