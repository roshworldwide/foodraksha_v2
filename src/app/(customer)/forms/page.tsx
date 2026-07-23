import type { Metadata } from "next";
import {
  Card,
  List,
  ListGroup,
  ListGroupHeader,
  ListIcon,
  ListRow,
} from "@/components/ui";
import { requireCustomer } from "@/lib/auth/guards";
import { loadCustomerForms } from "@/lib/customer/forms";

export const metadata: Metadata = {
  title: "Forms & licence — FoodRaksha",
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

export default async function FormsPage() {
  const session = await requireCustomer();
  const data = await loadCustomerForms(session.user.id);

  return (
    <main className="mx-auto max-w-[720px] px-6 py-10">
      <h1 className="text-large-title">Forms &amp; licence</h1>
      <p className="mt-2 mb-8 text-body text-label-2">
        {data
          ? `Everything we prepare for ${data.applicationNo}.`
          : "Your forms and licence will appear here."}
      </p>

      {/* ── The issued licence: the one high-contrast card + primary action */}
      {data?.licence && (
        <Card tone="dark" className="mb-[26px]">
          <div className="mb-1 text-headline">Your FSSAI licence</div>
          <p className="text-subhead text-white/[0.62]">
            {data.licence.no ? `Licence ${data.licence.no}` : "Issued"}
            {data.licence.expiresAt &&
              ` · valid to ${formatDate(data.licence.expiresAt)}`}
          </p>
          {data.licence.href ? (
            <a href={data.licence.href} target="_blank" rel="noreferrer">
              <span className="mt-[17px] flex min-h-[50px] w-full items-center justify-center rounded-pill bg-white text-[17px] font-semibold text-graphite">
                Download your licence
              </span>
            </a>
          ) : (
            <p className="mt-3 text-footnote text-white/[0.62]">
              The certificate PDF is being attached — check back shortly.
            </p>
          )}
        </Card>
      )}

      {/* ── Generated government forms */}
      <ListGroup className="mb-0">
        <ListGroupHeader>Prepared forms</ListGroupHeader>
        {data && data.forms.length > 0 ? (
          <List>
            {data.forms.map((form) => (
              <ListRow
                key={form.id}
                href={form.href}
                chevron
                icon={<ListIcon tone="done">↓</ListIcon>}
                title={form.name}
                subtitle={`Prepared ${formatDate(form.generatedAt)}`}
              />
            ))}
          </List>
        ) : (
          <Card>
            <p className="text-body text-label-2">
              No forms yet. Once you have submitted your application, our team
              prepares your government forms from your answers — you will be
              able to download each one here.
            </p>
          </Card>
        )}
      </ListGroup>
    </main>
  );
}
