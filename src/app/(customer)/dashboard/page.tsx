import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomer } from "@/lib/auth/guards";
import {
  ButtonLink,
  Card,
  List,
  ListGroupHeader,
  ListIcon,
  ListRow,
  StatusPill,
  Timeline,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  loadDashboard,
  type DashboardData,
  type TrackerStep,
} from "@/lib/customer/dashboard";
import { APP_STATUS, DOC_STATUS, LICENCE_TYPE } from "@/lib/status";

export const metadata: Metadata = {
  title: "Your dashboard — FoodRaksha",
};

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
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

  const { application, tracker, sections, attention, timeline, documents } =
    data;
  const status = APP_STATUS[application.status];

  const docTotal = documents.length;
  const docApproved = documents.filter((d) => d.status === "APPROVED").length;

  // In the fill phase, the first still-incomplete section is where "next" points.
  const nextSectionKey =
    application.phase === "fill"
      ? sections.find((s) => !s.isComplete)?.key
      : undefined;

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8">
      {/* ── Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="text-large-title">Hello, {firstName}</h1>
          <p className="mt-1 text-body text-label-2">
            {application.applicationNo} ·{" "}
            {LICENCE_TYPE[application.licenceType]}
          </p>
        </div>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </div>

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

      {/* ── Hero (stage-aware) */}
      <Hero
        application={application}
        tracker={tracker}
        licenceHref={data.licenceHref}
      />

      {/* ── Stat band */}
      <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        <StatCard
          label="Licence type"
          value={LICENCE_TYPE[application.licenceType]}
        />
        <StatCard label="Business type" value={application.categoryName} />
        <StatCard
          label={application.phase === "fill" ? "Started" : "Submitted"}
          value={SHORT_DATE.format(
            new Date(
              application.phase === "fill"
                ? application.createdAt
                : (application.submittedAt ?? application.createdAt),
            ),
          )}
        />
        <StatCard
          label="Documents"
          value={
            docTotal > 0 ? `${docApproved} / ${docTotal} approved` : "None yet"
          }
        />
      </div>

      {/* ── Two-column body */}
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* LEFT */}
        <div className="flex flex-col gap-6">
          {attention.length > 0 && (
            <section aria-label="Needs your attention">
              <ListGroupHeader>Needs your attention</ListGroupHeader>
              <div className="overflow-hidden rounded-list border-[0.5px] border-wait/40 bg-wait-bg shadow-1">
                {attention.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-start gap-3 border-b-[0.5px] border-wait/20 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-wait/[0.06]"
                  >
                    <ListIcon tone="wait">!</ListIcon>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold text-label">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-footnote text-label-2">
                        {item.detail}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-[19px] text-wait">
                      ›
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Your application file */}
          <section aria-label="Your application file">
            <ListGroupHeader>Your application file</ListGroupHeader>
            <List>
              {sections.map((section, index) => {
                const isNext = section.key === nextSectionKey;
                const tappable = application.phase === "fill";
                return (
                  <ListRow
                    key={section.key}
                    compact
                    href={tappable ? `/application/${section.key}` : undefined}
                    chevron={tappable}
                    className={isNext ? "bg-white-titanium" : undefined}
                    icon={
                      <ListIcon tone={section.isComplete ? "done" : "pending"}>
                        {section.isComplete ? "✓" : index + 1}
                      </ListIcon>
                    }
                    title={
                      <span className={isNext ? "font-semibold" : undefined}>
                        {section.title}
                      </span>
                    }
                    trailing={
                      section.isComplete ? (
                        <StatusPill tone="ok">Complete</StatusPill>
                      ) : isNext ? (
                        <StatusPill tone="wait">Next</StatusPill>
                      ) : undefined
                    }
                  />
                );
              })}
            </List>
          </section>

          {/* Your documents */}
          <section aria-label="Your documents">
            <ListGroupHeader>Your documents</ListGroupHeader>
            {docTotal === 0 ? (
              <Card>
                <p className="text-body text-label-2">
                  Nothing to upload yet. When your application needs supporting
                  documents, they&rsquo;ll be listed here.
                </p>
              </Card>
            ) : (
              <>
                <List>
                  {documents.map((document) => {
                    const docStatus = DOC_STATUS[document.status];
                    return (
                      <ListRow
                        key={document.id}
                        compact
                        href={document.href ?? undefined}
                        external={Boolean(document.href)}
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
                <div className="mt-4">
                  <ButtonLink
                    href="/application/documents"
                    variant="secondary"
                    size="sm"
                  >
                    {docApproved < docTotal
                      ? "Manage documents"
                      : "Review documents"}
                  </ButtonLink>
                </div>
              </>
            )}
          </section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">
          <section aria-label="Progress">
            <ListGroupHeader>Progress</ListGroupHeader>
            <Card>
              <Timeline
                items={timeline.map((step) => ({
                  label: step.label,
                  state: step.state,
                  detail:
                    step.state === "now" && step.key === "review"
                      ? "Our team is checking your file"
                      : step.state === "upcoming"
                        ? undefined
                        : formatDate(step.on),
                }))}
              />
            </Card>
          </section>

          <section aria-label="Need help">
            <ListGroupHeader>Need help?</ListGroupHeader>
            <Card>
              <p className="text-body text-label-2">
                Questions about your application, or something not clear?
                Message our team and we&rsquo;ll get back to you.
              </p>
              <div className="mt-4">
                <ButtonLink href="/messages" variant="secondary" size="sm">
                  Open messages
                </ButtonLink>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────────────── hero */

function Hero({
  application,
  tracker,
  licenceHref,
}: {
  application: DashboardData["application"];
  tracker: TrackerStep[];
  licenceHref: string | null;
}) {
  if (application.phase === "issued") {
    return (
      <Card tone="dark">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-headline">Licence issued</span>
          <span className="text-title-3" aria-hidden="true">
            ✓
          </span>
        </div>
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
      </Card>
    );
  }

  if (application.phase === "tracking") {
    return (
      <Card tone="dark">
        <span className="text-headline">Application status</span>
        <div className="mt-5">
          <StepTracker tracker={tracker} />
        </div>
        <p className="mt-5 max-w-[640px] text-subhead text-white/[0.72]">
          {application.statusMessage}
        </p>
      </Card>
    );
  }

  // fill
  return (
    <Card tone="dark">
      <div className="mb-3.5 flex items-baseline justify-between">
        <span className="text-headline">Application progress</span>
        <span className="text-title-3 tabular-nums">
          {application.percent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Application completion"
        aria-valuenow={application.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-[7px] overflow-hidden rounded-pill bg-white/20"
      >
        <span
          className="block h-full rounded-pill bg-white"
          style={{ width: `${application.percent}%` }}
        />
      </div>
      <p className="mt-2.5 text-footnote text-white/[0.62]">
        {application.completed} of {application.total} sections complete
      </p>
      {application.resumable && (
        <>
          <ButtonLink
            href="/application"
            variant="onDark"
            fullWidth
            className="mt-[17px]"
          >
            {application.completed === 0
              ? "Start your application"
              : "Continue where you left off"}
          </ButtonLink>
          {application.resumeSection && (
            <p className="mt-2.5 text-center text-footnote text-white/[0.62]">
              Next: {application.resumeSection}
            </p>
          )}
        </>
      )}
    </Card>
  );
}

/** The 4-step horizontal stepper on the dark hero. */
function StepTracker({ tracker }: { tracker: TrackerStep[] }) {
  return (
    <ol aria-label="Application progress" className="flex items-start">
      {tracker.map((step, index) => (
        <li
          key={step.key}
          aria-current={step.state === "now" ? "step" : undefined}
          className="relative flex flex-1 flex-col items-center text-center"
        >
          {/* connector to the previous node */}
          {index > 0 && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-[13px] right-1/2 left-[-50%] h-[2px]",
                step.state === "upcoming" ? "bg-white/20" : "bg-white",
              )}
            />
          )}
          <span
            aria-hidden="true"
            className={cn(
              "relative z-10 flex size-[26px] items-center justify-center rounded-full text-[13px] font-bold",
              step.state === "done" && "bg-white text-graphite",
              step.state === "now" &&
                "bg-white text-graphite shadow-[0_0_0_4px_rgba(255,255,255,0.22)]",
              step.state === "upcoming" &&
                "border-[1.5px] border-white/30 text-white/40",
            )}
          >
            {step.state === "done" ? "✓" : index + 1}
          </span>
          <span
            className={cn(
              "mt-2.5 text-[12px] leading-tight tracking-[-0.004em]",
              step.state === "upcoming"
                ? "text-white/45"
                : step.state === "now"
                  ? "font-semibold text-white"
                  : "text-white/80",
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ─────────────────────────────────────────────────────── stat card */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border-[0.5px] border-separator bg-surface px-4 py-3.5 shadow-1">
      <p className="text-[11px] font-semibold tracking-[0.04em] text-label-3 uppercase">
        {label}
      </p>
      <p className="mt-1 text-headline tracking-[-0.01em]">{value}</p>
    </div>
  );
}
