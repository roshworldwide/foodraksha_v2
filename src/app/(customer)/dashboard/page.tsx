import type { Metadata } from "next";
import {
  ButtonLink,
  Card,
  List,
  ListGroup,
  ListGroupHeader,
  ListRow,
  Progress,
  StatusPill,
} from "@/components/ui";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { APP_STATUS, LICENCE_TYPE } from "@/lib/status";

export const metadata: Metadata = {
  title: "Your applications — FoodRaksha",
};

export default async function CustomerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const session = await requireCustomer();
  const { submitted } = await searchParams;

  const [customer, coreSectionCount] = await Promise.all([
    prisma.customer.findUnique({
      where: { userId: session.user.id },
      include: {
        applications: {
          orderBy: { updatedAt: "desc" },
          include: { category: true },
        },
      },
    }),
    prisma.formSection.count({ where: { isCore: true } }),
  ]);

  return (
    <main className="mx-auto max-w-[720px] px-6 py-10">
      <h1 className="text-large-title">
        {customer?.businessName ?? "Your applications"}
      </h1>
      <p className="mt-2 mb-8 text-body text-label-2">
        Signed in as {session.user.mobile}.
      </p>

      {submitted === "1" && (
        <Card className="mb-6">
          <h2 className="text-title-3">Application submitted</h2>
          <p className="mt-1.5 text-body text-label-2">
            Our team has it. We will be in touch if anything needs clarifying.
          </p>
        </Card>
      )}

      {customer && customer.applications.length > 0 ? (
        <ListGroup>
          <ListGroupHeader>Applications</ListGroupHeader>
          <List>
            {customer.applications.map((application) => {
              const status = APP_STATUS[application.status];
              const done = application.completedSections.length;
              const percent =
                coreSectionCount > 0
                  ? Math.round((done / coreSectionCount) * 100)
                  : 0;

              return (
                <ListRow
                  key={application.id}
                  title={application.applicationNo}
                  subtitle={`${application.category.name} · ${LICENCE_TYPE[application.licenceType]} · ${done} of ${coreSectionCount} sections`}
                  href={
                    application.status === "DRAFT" ||
                    application.status === "QUERY_RAISED"
                      ? "/application"
                      : undefined
                  }
                  chevron={
                    application.status === "DRAFT" ||
                    application.status === "QUERY_RAISED"
                  }
                  trailing={
                    <span className="flex items-center gap-3">
                      <Progress
                        value={percent}
                        thin
                        label={`${application.applicationNo} progress`}
                        className="w-[92px]"
                      />
                      <StatusPill tone={status.tone}>{status.label}</StatusPill>
                    </span>
                  }
                />
              );
            })}
          </List>
        </ListGroup>
      ) : (
        <Card>
          <h2 className="text-title-3">No application yet</h2>
          <p className="mt-1.5 text-body text-label-2">
            Your FoodRaksha agent will start one for you. You will get an SMS
            the moment it is ready to fill in.
          </p>
          <div className="mt-5">
            <ButtonLink href="/get-started" variant="secondary">
              Start one now
            </ButtonLink>
          </div>
        </Card>
      )}
    </main>
  );
}
