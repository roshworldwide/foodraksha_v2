import type { Metadata } from "next";
import {
  Card,
  List,
  ListGroup,
  ListGroupHeader,
  ListRow,
  Progress,
  StatusPill,
} from "@/components/ui";
import { requireStaff } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { APP_STATUS, LICENCE_TYPE } from "@/lib/status";

export const metadata: Metadata = {
  title: "Desk — FoodRaksha Staff",
};

export default async function StaffDeskPage() {
  await requireStaff();

  const [applications, coreSectionCount] = await Promise.all([
    prisma.application.findMany({
      orderBy: { updatedAt: "desc" },
      include: { customer: { include: { user: true } }, category: true },
    }),
    prisma.formSection.count({ where: { isCore: true } }),
  ]);

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10">
      <h1 className="text-large-title">Desk</h1>
      <p className="mt-2 mb-8 text-body text-label-2">
        {applications.length} application{applications.length === 1 ? "" : "s"}{" "}
        · every customer, flat.
      </p>

      {applications.length > 0 ? (
        <ListGroup>
          <ListGroupHeader>All applications</ListGroupHeader>
          <List>
            {applications.map((application) => {
              const status = APP_STATUS[application.status];
              const done = application.completedSections.length;
              const percent =
                coreSectionCount > 0
                  ? Math.round((done / coreSectionCount) * 100)
                  : 0;

              return (
                <ListRow
                  key={application.id}
                  title={application.customer.user.name}
                  subtitle={`${application.customer.businessName} · ${application.applicationNo} · ${LICENCE_TYPE[application.licenceType]}`}
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
          <h2 className="text-title-3">Nothing on the desk</h2>
          <p className="mt-1.5 text-body text-label-2">
            Run <code className="font-mono text-[15px]">npm run db:seed</code>{" "}
            to load demo customers, or create the first application from a lead.
          </p>
        </Card>
      )}
    </main>
  );
}
