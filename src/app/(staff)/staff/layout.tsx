import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { requireStaff } from "@/lib/auth/guards";

/** Every route in this group requires a STAFF or ADMIN session. */
export default async function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireStaff();

  return (
    <AppShell
      role="STAFF"
      userName={session.user.name}
      userSubtitle={session.user.role === "ADMIN" ? "Administrator" : "Staff"}
      isAdmin={session.user.role === "ADMIN"}
    >
      {children}
    </AppShell>
  );
}
