import { redirect } from "next/navigation";

/**
 * Staff sign-in now lives on the single /login page, opened on the Staff side
 * of the switcher. This route stays as a redirect so old links, bookmarks and
 * the auth guard keep working.
 */
export default async function StaffLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const query = new URLSearchParams({ role: "staff" });
  if (next) query.set("next", next);
  redirect(`/login?${query.toString()}`);
}
