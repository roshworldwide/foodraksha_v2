import type { Metadata } from "next";
import Link from "next/link";
import { StaffPage } from "@/components/staff/StaffPage";
import { Card, StatusPill } from "@/components/ui";
import { requireStaff } from "@/lib/auth/guards";
import { loadDashboard, type ActivityItem } from "@/lib/staff/screens";
import { APP_STATUS } from "@/lib/status";

export const metadata: Metadata = {
  title: "Dashboard — FoodRaksha Staff",
};

function timeAgo(date: Date): string {
  const m = Math.round((Date.now() - date.getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default async function StaffDashboardPage() {
  await requireStaff();
  const { kpis, activity, pipeline, leadsOpen } = await loadDashboard();

  const cards = [
    {
      label: "Open applications",
      value: kpis.openApplications,
      href: "/staff/clients",
    },
    {
      label: "Awaiting review",
      value: kpis.awaitingReview,
      href: "/staff/clients?filter=awaiting_review",
    },
    {
      label: "Issued this month",
      value: kpis.issuedThisMonth,
      href: "/staff/clients?filter=issued",
    },
    {
      label: "Not logged in",
      value: kpis.notLoggedIn,
      href: "/staff/clients?filter=not_logged_in",
    },
  ];

  const pipelineTotal = pipeline.reduce((sum, p) => sum + p.count, 0);

  return (
    <StaffPage description="Everything that needs attention today, at a glance.">
      {/* KPI cards */}
      <div className="mb-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition-shadow hover:shadow-2">
              <p className="text-footnote text-label-2">{card.label}</p>
              <p className="mt-1 text-large-title tabular-nums">{card.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        {/* Pipeline snapshot */}
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-headline">Pipeline snapshot</h2>
            <Link
              href="/staff/pipeline"
              className="text-footnote font-semibold text-label underline"
            >
              Open board
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {pipeline.map((stage) => {
              const s = APP_STATUS[stage.status];
              const pct = pipelineTotal
                ? (stage.count / pipelineTotal) * 100
                : 0;
              return (
                <div key={stage.status} className="flex items-center gap-3">
                  <span className="w-[130px] shrink-0">
                    <StatusPill tone={s.tone}>{s.label}</StatusPill>
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-sunk">
                    <span
                      className="block h-full rounded-pill bg-graphite"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-footnote font-semibold tabular-nums text-label-2">
                    {stage.count}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t-[0.5px] border-separator pt-3 text-footnote text-label-2">
            {leadsOpen} open lead{leadsOpen === 1 ? "" : "s"} ·{" "}
            <Link
              href="/staff/leads"
              className="font-semibold text-label underline"
            >
              work them
            </Link>
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="p-0">
          <h2 className="border-b-[0.5px] border-separator px-5 py-4 text-headline">
            Recent activity
          </h2>
          {activity.length === 0 ? (
            <p className="px-5 py-8 text-center text-subhead text-label-2">
              No status changes yet.
            </p>
          ) : (
            <ul>
              {activity.map((event, index) => (
                <ActivityRow key={index} event={event} timeAgo={timeAgo} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </StaffPage>
  );
}

function ActivityRow({
  event,
  timeAgo,
}: {
  event: ActivityItem;
  timeAgo: (date: Date) => string;
}) {
  const s = APP_STATUS[event.toStatus];
  return (
    <li className="border-b-[0.5px] border-separator last:border-b-0">
      <Link
        href={`/staff/clients?q=${event.applicationNo}`}
        className="flex items-center gap-3 px-5 py-3 hover:bg-white-titanium-lt"
      >
        <StatusPill tone={s.tone}>{s.label}</StatusPill>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px]">
            {event.customerName}
          </span>
          <span className="block truncate text-footnote text-label-2">
            {event.applicationNo}
            {event.by ? ` · ${event.by}` : ""}
          </span>
        </span>
        <span className="shrink-0 text-footnote text-label-2">
          {timeAgo(event.at)}
        </span>
      </Link>
    </li>
  );
}
