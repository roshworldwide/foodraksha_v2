import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

/**
 * The shared frame for both login screens: centred logo lockup, a graphite
 * role badge, a heading and copy, then the card. The two portals are told
 * apart by copy and badge — never by colour. Everything stays titanium.
 */
export function LoginLockup({
  badge,
  title,
  subtitle,
  children,
  footer,
}: {
  badge: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8 flex flex-col items-center text-center">
        <Link href="/login" aria-label="FoodRaksha home">
          <Logo variant="lockup" height={34} />
        </Link>
        <span
          className={cn(
            "mt-6 inline-flex items-center rounded-pill bg-graphite px-3 py-1",
            "text-[12px] font-semibold tracking-[0.02em] text-white uppercase",
          )}
        >
          {badge}
        </span>
        <h1 className="mt-4 text-title-1">{title}</h1>
        <p className="mt-1.5 text-body text-label-2">{subtitle}</p>
      </div>

      {children}

      <div className="mt-6 text-center text-footnote text-label-2">
        {footer}
      </div>
    </div>
  );
}
