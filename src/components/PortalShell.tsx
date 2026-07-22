import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import { logout } from "@/lib/auth/actions";

export interface PortalShellProps {
  /** "FoodRaksha" for customers, "FoodRaksha Staff" for the desk. */
  brand: string;
  userName: string;
  children: ReactNode;
}

/** Shared chrome for both portals: brand, who you are, sign out. */
export function PortalShell({ brand, userName, children }: PortalShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b-[0.5px] border-separator bg-white-titanium/[0.82] backdrop-blur-[20px] backdrop-saturate-[180%]">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-5 px-6 py-3.5">
          <span className="text-subhead font-semibold">{brand}</span>
          <div className="flex items-center gap-4">
            <span className="text-footnote text-label-2">{userName}</span>
            <form action={logout}>
              <Button type="submit" variant="quiet" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
