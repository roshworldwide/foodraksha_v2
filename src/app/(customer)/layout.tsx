import type { ReactNode } from "react";
import { PortalShell } from "@/components/PortalShell";
import { requireCustomer } from "@/lib/auth/guards";

/** Every route in this group requires a CUSTOMER session. */
export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireCustomer();

  return (
    <PortalShell
      brand="FoodRaksha"
      userName={session.user.name}
      accountHref="/account"
    >
      {children}
    </PortalShell>
  );
}
