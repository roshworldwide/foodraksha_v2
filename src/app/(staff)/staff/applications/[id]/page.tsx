import type { Metadata } from "next";
import { CustomerDetail } from "@/components/staff/CustomerDetail";
import { requireStaff } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Client file — FoodRaksha Staff",
};

/**
 * A single client's file, on its own page. Reached by clicking a row on the
 * desk. The heavy lifting — fetching the detail and every in-place action — is
 * done client-side by CustomerDetail against the audited staff API.
 */
export default async function ClientFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;

  return <CustomerDetail applicationId={id} />;
}
