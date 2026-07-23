import type { Metadata } from "next";
import { requireCustomer } from "@/lib/auth/guards";
import {
  ButtonLink,
  Card,
  List,
  ListGroup,
  ListGroupHeader,
  ListIcon,
  ListRow,
  StatusPill,
  Timeline,
} from "@/components/ui";
import { loadDashboard } from "@/lib/customer/dashboard";
import { APP_STATUS, DOC_STATUS } from "@/lib/status";

export const metadata: Metadata = {
  title: "Your dashboard — FoodRaksha",
};

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

function formatDate(iso: string | null): string | undefined {
  return iso ? DATE.format(new Date(iso)) : undefined;
}

export default async function CustomerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; resolved?: string }>;
}) {
  const session = await requireCustomer();
  const { submitted, resolved } = await searchParams;
  const data = await loadDashboard(session.user.id);

  const firstName = session.user.name.split(" ")[0];

  if (!data) {
    return (
      <main className="mx-auto max-w-[720px] px-6 py-10">
        <h1 className="text-large-title">Hello, {firstName}</h1>
        <Card className="mt-6">
          <h2 className="text-title-3">No application yet</h2>
          <p className="mt-1.5 text-body text-label-2">
            Your FoodRaksha agent will start one for you. You will get an SMS
            the moment it is ready to fill in.
          </p>
        </Card>
      </main>
    );
  }

  const { application, attention, timeline, documents, licenceHref } = data;
  const status = APP_STATUS[application.status];

  return (
    <main className="mx-auto max-w-[720px] px-6 py-10">
      <h1 className="text-large-title">Hello, {firstName}</h1>
      <p className="mt-2 mb-7 text-body text-label-2">
        {application.applicationNo}
      </p>

      {submitted === "1" && (
        <Card className="mb-6 border-l-[3px] border-ok">
          <p className="text-body">
            Your application is in. Our team will review it and be in touch if
            anything needs clarifying.
          </p>
        </Card>
      )}
      {resolved === "1" && (
        <Card className="mb-6 border-l-[3px] border-ok">
          <p className="text-body">
            Thanks — your update is back with our team for review.
          </p>
        </Card>
      )}

      {/* ── Progress card: the one dark, high-contrast element */}
      <Card tone="dark" className="mb-[26px]">
        <div className="mb-3.5 flex items-baseline justify-between">
          <span className="text-headline">
            {application.status === "ISSUED"
              ? "Licence issued"
              : "Application progress"}
          </span>
          <span className="text-title-3">
            {application.status === "ISSUED" ? "✓" : `${application.percent}%`}
          </span>
        </div>

        {application.status === "ISSUED" ? (
          <>
            <p className="text-subhead text-white/[0.62]">
              Licence {application.licenceNo}
              {application.licenceExpiresAt &&
                ` · valid to ${formatDate(application.licenceExpiresAt)}`}
            </p>
            {licenceHref && (
              <a href={licenceHref} target="_blank" rel="noreferrer">
                <span className="mt-[17px] flex min-h-[50px] w-full items-center justify-center rounded-pill bg-white text-[17px] font-semibold text-graphite">
                  Download your licence
                </span>
              </a>
            )}
          </>
        ) : (
          <>
            <div className="h-[7px] overflow-hidden rounded-pill bg-white/20">
              <span
                className="block h-full rounded-pill bg-white"
                style={{ width: `${application.percent}%` }}
              />
            </div>
            <p className="mt-2.5 text-footnote text-white/[0.62]">
              {application.completed} of {application.total} sections complete
            </p>
            {application.resumable && (
              <ButtonLink
                href="/application"
                fullWidth
                className="mt-[17px] bg-white text-graphite hover:opacity-90"
              >
                Continue where you left off
              </ButtonLink>
            )}
          </>
        )}
      </Card>

      {/* ── Needs your attention */}
      {attention.length > 0 && (
        <ListGroup>
          <ListGroupHeader>Needs your attention</ListGroupHeader>
          <List>
            {attention.map((item, index) => (
              <ListRow
                key={index}
                href={item.href}
                chevron
                icon={<ListIcon tone="wait">!</ListIcon>}
                title={item.title}
                subtitle={item.detail}
              />
            ))}
          </List>
        </ListGroup>
      )}

      {/* ── Status timeline */}
      <ListGroup>
        <ListGroupHeader>Application status</ListGroupHeader>
        <Card>
          <div className="mb-4">
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
          </div>
          <Timeline
            items={timeline.map((step) => ({
              label: step.label,
              state: step.state,
              detail:
                step.state === "now" && step.key === "review"
                  ? "Our team is checking your file"
                  : formatDate(step.on),
            }))}
          />
        </Card>
      </ListGroup>

      {/* ── Documents */}
      <ListGroup className="mb-0">
        <ListGroupHeader>Your documents</ListGroupHeader>
        <List>
          {licenceHref && (
            <ListRow
              href={licenceHref}
              chevron
              icon={<ListIcon tone="done">↓</ListIcon>}
              title="FSSAI licence"
              subtitle="Issued · download"
            />
          )}
          {documents.map((document) => {
            const docStatus = DOC_STATUS[document.status];
            return (
              <ListRow
                key={document.id}
                href={document.href ?? undefined}
                chevron={Boolean(document.href)}
                icon={
                  <ListIcon
                    tone={
                      document.status === "APPROVED"
                        ? "done"
                        : document.status === "REJECTED"
                          ? "wait"
                          : "pending"
                    }
                  >
                    {document.status === "APPROVED"
                      ? "✓"
                      : document.status === "REJECTED"
                        ? "!"
                        : "·"}
                  </ListIcon>
                }
                title={document.label}
                trailing={
                  <StatusPill tone={docStatus.tone}>
                    {docStatus.label}
                  </StatusPill>
                }
              />
            );
          })}
        </List>
      </ListGroup>
    </main>
  );
}
