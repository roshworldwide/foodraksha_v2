import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

/**
 * The shared frame for both login screens. On desktop it is a two-panel split:
 * a branded titanium panel on the left (logo, a portal-specific headline and a
 * few reassurance points) and the sign-in form on the right. Below `lg` the
 * panel drops away and the form centres on its own.
 *
 * The two portals are told apart by copy, badge and highlights — never by
 * colour. Everything stays titanium; the shield is the only colour.
 */
export function LoginLockup({
  badge,
  title,
  subtitle,
  panelHeadline,
  highlights,
  toggle,
  children,
  footer,
}: {
  badge: string;
  title: string;
  subtitle: string;
  /** The large statement on the brand panel. */
  panelHeadline: string;
  /** Two or three short reassurance points for the brand panel. */
  highlights: string[];
  /** Optional control shown in place of the badge (the portal switcher). */
  toggle?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ── Brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden bg-white-titanium lg:flex lg:flex-col lg:justify-between lg:p-14">
        {/* Soft titanium wash + an oversized shield watermark. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white-titanium-lt via-white-titanium to-nat-titanium/70"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -bottom-20 opacity-[0.06]"
        >
          <Logo variant="mark" height={460} />
        </div>

        <div className="relative">
          <Link href="/login" aria-label="FoodRaksha home">
            <Logo variant="lockup" height={30} />
          </Link>
        </div>

        <div className="relative max-w-[420px]">
          <h2 className="text-large-title tracking-[-0.02em] text-balance">
            {panelHeadline}
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {highlights.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full bg-graphite text-[12px] font-bold text-white"
                >
                  ✓
                </span>
                <span className="text-body text-label">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-footnote text-label-2">
          © FoodRaksha · FSSAI licensing, handled for you.
        </p>
      </aside>

      {/* ── Form panel */}
      <main className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-[400px]">
          {/* Logo shows here only when the brand panel is hidden. */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/login" aria-label="FoodRaksha home">
              <Logo variant="lockup" height={32} />
            </Link>
          </div>

          <div className="mb-7">
            {toggle ? (
              <div className="mb-6">{toggle}</div>
            ) : (
              <span className="inline-flex items-center rounded-pill bg-graphite px-3 py-1 text-[12px] font-semibold tracking-[0.02em] text-white uppercase">
                {badge}
              </span>
            )}
            <h1 className={toggle ? "text-title-1" : "mt-4 text-title-1"}>
              {title}
            </h1>
            <p className="mt-1.5 text-body text-label-2">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 text-footnote text-label-2">{footer}</div>
        </div>
      </main>
    </div>
  );
}
