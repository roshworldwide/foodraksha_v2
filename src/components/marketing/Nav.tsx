import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "./Button";

/**
 * Sticky, translucent, blurred navigation. Logo + menu + Login (ghost) and
 * Book Now (blue). The mobile menu is a CSS-only <details> disclosure, so the
 * whole bar stays a Server Component — only the LeadForm ships JS.
 */

// "Enrollment" is consolidated into the /services qualifier (no separate page),
// so it points at the self-serve start. "Explore" is a Stage-2 hub (404 for now).
const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Membership", href: "/membership" },
  { label: "Enrollment", href: "/get-started" },
  { label: "Explore", href: "/explore" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b-[0.5px] border-fr-sep bg-fr-bg/80 backdrop-blur-[20px] backdrop-saturate-[180%]">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[60px] max-w-[1200px] items-center gap-6 px-6"
      >
        <Link href="/" aria-label="Food Raksha home" className="shrink-0">
          <Logo variant="lockup" height={24} />
        </Link>

        {/* Desktop menu */}
        <ul className="ml-2 hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-full px-3 py-2 text-[15px] font-medium tracking-[-0.008em] text-fr-ink-2 transition-colors hover:bg-fr-panel hover:text-fr-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Login
          </ButtonLink>
          <ButtonLink href="/book" variant="blue" size="sm">
            Book Now
          </ButtonLink>
        </div>

        {/* Mobile: CSS-only disclosure */}
        <details className="group relative ml-auto md:hidden">
          <summary
            aria-label="Menu"
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full text-fr-ink hover:bg-fr-panel [&::-webkit-details-marker]:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="size-6"
            >
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </summary>
          <div className="absolute top-[calc(100%+8px)] right-0 w-[220px] rounded-fr-card border-[0.5px] border-fr-sep bg-fr-bg p-2 shadow-fr-lift">
            <ul className="flex flex-col">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-[10px] px-3 py-2.5 text-[15px] font-medium text-fr-ink hover:bg-fr-panel"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-col gap-2 border-t-[0.5px] border-fr-sep pt-2">
              <ButtonLink href="/login" variant="ghost" size="sm" fullWidth>
                Login
              </ButtonLink>
              <ButtonLink href="/book" variant="blue" size="sm" fullWidth>
                Book Now
              </ButtonLink>
            </div>
          </div>
        </details>
      </nav>
    </header>
  );
}
