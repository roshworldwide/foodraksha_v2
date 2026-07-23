import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { requireCustomer } from "@/lib/auth/guards";

/** Every route in this group requires a CUSTOMER session. */
export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireCustomer();

  return (
    <AppShell
      role="CUSTOMER"
      userName={session.user.name}
      userSubtitle={session.user.mobile}
      accountHref="/profile"
    >
      {children}
    </AppShell>
  );
}
