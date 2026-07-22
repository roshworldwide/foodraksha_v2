import type { ReactNode } from "react";
import { PortalShell } from "@/components/PortalShell";
import { requireStaff } from "@/lib/auth/guards";

/** Every route in this group requires a STAFF or ADMIN session. */
export default async function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireStaff();

  return (
    <PortalShell
      brand="FoodRaksha Staff"
      userName={`${session.user.name} · ${session.user.role.toLowerCase()}`}
    >
      {children}
    </PortalShell>
  );
}
