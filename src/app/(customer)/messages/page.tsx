import type { Metadata } from "next";
import { ButtonLink, Card, StatusPill } from "@/components/ui";
import { requireCustomer } from "@/lib/auth/guards";
import { loadCustomerMessages } from "@/lib/customer/messages";
import { MessageReply } from "./MessageReply";

export const metadata: Metadata = {
  title: "Messages — FoodRaksha",
};

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

function formatDate(iso: string): string {
  return DATE.format(new Date(iso));
}

export default async function MessagesPage() {
  const session = await requireCustomer();
  const data = await loadCustomerMessages(session.user.id);

  const empty = !data || data.messages.length === 0;

  return (
    <main className="mx-auto max-w-[720px] px-6 py-10">
      <h1 className="text-large-title">Messages</h1>
      <p className="mt-2 mb-8 text-body text-label-2">
        {empty
          ? "Questions from our team about your application show up here."
          : data.openCount > 0
            ? `${data.openCount} ${
                data.openCount === 1 ? "message needs" : "messages need"
              } your reply.`
            : "You're all caught up — nothing needs a reply."}
      </p>

      {empty ? (
        <Card>
          <p className="text-body text-label-2">
            No messages yet. If our team needs anything clarified while
            reviewing your application, we&rsquo;ll ask here — and point you
            straight to what needs a fix.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {data.messages.map((message) => (
            <Card
              key={message.id}
              className={
                message.resolved ? undefined : "border-l-[3px] border-wait"
              }
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-footnote font-semibold text-label-2">
                  Our team · {formatDate(message.raisedAt)}
                </span>
                <StatusPill tone={message.resolved ? "ok" : "wait"}>
                  {message.resolved ? "Resolved" : "Needs your reply"}
                </StatusPill>
              </div>

              <p className="text-body whitespace-pre-line">{message.message}</p>

              {message.fixHref && !message.resolved && (
                <div className="mt-3.5">
                  <ButtonLink
                    href={message.fixHref}
                    variant="secondary"
                    size="sm"
                  >
                    Fix: {message.fixLabel}
                  </ButtonLink>
                </div>
              )}

              {message.resolved
                ? message.resolutionNote && (
                    <div className="mt-3.5 rounded-list bg-quiet px-4 py-3">
                      <p className="text-footnote font-semibold text-label-2">
                        Your reply
                        {message.resolvedAt &&
                          ` · ${formatDate(message.resolvedAt)}`}
                      </p>
                      <p className="mt-1 text-body whitespace-pre-line">
                        {message.resolutionNote}
                      </p>
                    </div>
                  )
                : data.editable && <MessageReply queryId={message.id} />}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
