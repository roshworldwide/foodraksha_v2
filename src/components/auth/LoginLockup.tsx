import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

/**
 * The sign-in frame: a single centred card on a quiet titanium ground, in the
 * spirit of Apple ID / iCloud. The shield sits at the top, then the heading,
 * the portal switch and the form. Everything stays titanium; the shield is the
 * only colour.
 */
export function LoginLockup({
  title,
  subtitle,
  toggle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  /** The portal switch, centred under the heading. */
  toggle?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="rounded-[22px] border-[0.5px] border-separator bg-surface p-8 shadow-3 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <Link href="/" aria-label="FoodRaksha home">
              <Logo variant="mark" height={54} />
            </Link>
            <h1 className="mt-5 text-title-1">{title}</h1>
            <p className="mt-1 text-subhead text-label-2">{subtitle}</p>
          </div>

          {toggle && <div className="mt-6 flex justify-center">{toggle}</div>}

          <div className="mt-7">{children}</div>
        </div>

        <div className="mt-6 text-center text-footnote text-label-2">
          {footer}
        </div>
      </div>
    </div>
  );
}
