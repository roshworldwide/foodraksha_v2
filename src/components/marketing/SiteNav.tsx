"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";
import { NAV_LINKS, SERVICES_MEGA } from "@/content/navigation";
import { CONTACT, CONTACT_IS_PLACEHOLDER } from "@/lib/marketing/contact";

/**
 * The marketing header, ported from docs/client-design/components/Navbar.tsx.
 *
 * Adaptations to this codebase, per the porting rules:
 *  · FontAwesome → lucide-react; AOS/CSS transitions → framer-motion.
 *  · Their scroll-spy buttons (onNavigate to a section id) become real links —
 *    this is a multi-page site, not their single-page composition.
 *  · Every mega-menu href was "#" in the original. They point at real routes now,
 *    from @/content/navigation.
 *  · The gradient shield placeholder is replaced by the official logo.
 *  · Their hardcoded "+91 99999 99999" is NOT shipped. The phone renders only
 *    when a real number exists in contact config; until then the header shows
 *    the same "awaiting real number" marker the rest of the site uses, so nobody
 *    publishes a fake number to a live site.
 *
 * The mega menu opens on hover AND on click/Enter, and closes on Escape, so it
 * is reachable without a pointer — their hover-only `group-hover` version was
 * not.
 */

const TONE: Record<string, string> = {
  blue: "text-fr-blue",
  green: "text-fr-green-deep",
  violet: "text-fr-violet-deep",
  orange: "text-fr-orange-deep",
  cyan: "text-fr-blue-deep",
  rose: "text-fr-rose-deep",
};

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMegaOpen(false);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-fr-sep bg-fr-bg/90 backdrop-blur-xl",
        "transition-shadow duration-300",
        scrolled ? "shadow-fr-soft" : "shadow-none",
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Food Raksha home" className="shrink-0">
          <Logo variant="lockup" height={30} />
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 text-[14.5px] font-semibold text-fr-ink-2 lg:flex"
        >
          <Link
            href="/"
            className="rounded-lg px-3 py-2 transition-colors hover:bg-fr-panel hover:text-fr-blue"
          >
            Home
          </Link>

          {/* Services mega menu */}
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-haspopup="true"
              onClick={() => setMegaOpen((open) => !open)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors",
                "hover:bg-fr-panel hover:text-fr-blue",
                "focus-visible:ring-[3px] focus-visible:ring-fr-blue/35 focus-visible:outline-none",
                megaOpen && "text-fr-blue",
              )}
            >
              Services
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  megaOpen && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                  className={cn(
                    "absolute top-full left-1/2 z-50 w-[min(94vw,1060px)] -translate-x-1/2",
                    "rounded-b-[22px] border border-fr-sep bg-fr-bg p-8 shadow-fr-lift",
                  )}
                >
                  <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                    {SERVICES_MEGA.map((column) => (
                      <div key={column.heading}>
                        <h3
                          className={cn(
                            "mb-4 text-[15px] font-extrabold",
                            TONE[column.tone] ?? TONE.blue,
                          )}
                        >
                          {column.heading}
                        </h3>
                        <ul className="flex flex-col gap-2.5">
                          {column.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                onClick={() => setMegaOpen(false)}
                                className="block text-[13px] leading-relaxed font-medium text-fr-ink-2 transition-colors hover:text-fr-blue"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.filter((item) => item.href !== "/").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 transition-colors hover:bg-fr-panel hover:text-fr-blue"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Calls to action */}
        <div className="hidden items-center gap-3 lg:flex">
          {CONTACT_IS_PLACEHOLDER ? (
            <span className="rounded bg-[#FFF4E5] px-2 py-1 text-[12px] text-[#B85C00]">
              [phone — awaiting real number]
            </span>
          ) : (
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="flex items-center gap-1.5 text-[14px] font-medium text-fr-ink-2 transition-colors hover:text-fr-blue"
            >
              <Phone aria-hidden="true" className="size-4 text-fr-green" />
              {CONTACT.phoneDisplay}
            </a>
          )}
          <Link
            href="/get-started"
            className={cn(
              "flex items-center gap-2 rounded-xl bg-fr-blue px-5 py-2.5",
              "text-[14px] font-semibold text-white shadow-fr-blue",
              "transition-colors duration-300 hover:bg-fr-blue-deep",
              "focus-visible:ring-[3px] focus-visible:ring-fr-blue/35 focus-visible:outline-none",
            )}
          >
            Get Started
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="p-2 text-fr-ink transition-colors hover:text-fr-blue lg:hidden"
        >
          {mobileOpen ? (
            <X aria-hidden="true" className="size-6" />
          ) : (
            <Menu aria-hidden="true" className="size-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden border-t border-fr-sep bg-fr-bg lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-[15px] font-medium text-fr-ink transition-colors hover:bg-fr-panel"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/services#documents"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-[15px] font-medium text-fr-ink transition-colors hover:bg-fr-panel"
              >
                Documents required
              </Link>
              <Link
                href="/get-started"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-xl bg-fr-blue px-4 py-3 text-center text-[15px] font-semibold text-white shadow-fr-blue"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
