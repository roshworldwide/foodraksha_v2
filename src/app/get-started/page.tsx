/**
 * TEMPORARY internal signup page.
 *
 * CLAUDE.md, Architectural rules: account creation is an API endpoint, not a
 * page. The real enquiry form lives on the marketing website (phase 2) and
 * will call POST /api/public/signup — the same endpoint this page calls.
 * Delete this route when the website ships. Never duplicate signup logic here.
 */
import type { Metadata } from "next";
import { Card, ListGroupHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { GetStartedFlow } from "./GetStartedFlow";

// Business categories are read per request — a build-time snapshot would
// silently go stale the moment staff edit the list.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get started — FoodRaksha",
  description: "Create your FoodRaksha account and start your FSSAI licence.",
};

export default async function GetStartedPage() {
  const categories = await prisma.businessCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { code: true, name: true },
  });

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-14">
      <div className="grid items-start gap-9 [grid-template-columns:minmax(0,1fr)] lg:[grid-template-columns:minmax(0,620px)_minmax(0,1fr)]">
        <div>
          <header className="mb-7">
            <div
              aria-hidden="true"
              className="mb-5 flex size-11 items-center justify-center rounded-[12px] bg-graphite text-[19px] font-bold text-white"
            >
              FR
            </div>
            <h1 className="text-large-title">Get your FSSAI licence</h1>
            <p className="mt-[9px] text-body text-label-2">
              Tell us a little about your business. Takes under a minute.
            </p>
          </header>

          <GetStartedFlow categories={categories} />
        </div>

        <aside>
          <ListGroupHeader>Why only five fields</ListGroupHeader>
          <Card className="mb-[18px]">
            <p className="text-subhead leading-[1.6] text-label-2">
              Every field added to a landing form measurably reduces
              submissions. Everything else we need is collected <i>after</i> the
              account exists — at which point the customer is already invested
              and far more likely to finish.
            </p>
          </Card>

          <ListGroupHeader>Built in from day one</ListGroupHeader>
          <Card>
            <dl className="text-[14px]">
              {[
                ["Rate limiting", "5 / IP / hour · 3 / mobile / day"],
                ["Duplicate mobile check", "Yes"],
                ["UTM source capture", "Yes"],
                ["DPDP consent", "Recorded with a timestamp"],
                ["Credentials by SMS and email", "Yes"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b-[0.5px] border-separator py-[11px] last:border-b-0"
                >
                  <dt className="text-label-2">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </aside>
      </div>
    </main>
  );
}
