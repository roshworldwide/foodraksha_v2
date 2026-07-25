import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CONTACT, fullAddress } from "@/lib/marketing/contact";

/** The 4-column footer + legal bar, matching the prototype. */

const SERVICES = [
  { label: "Basic Registration", href: "/services#basic" },
  { label: "State Licence", href: "/services#state" },
  { label: "Central Licence", href: "/services#central" },
  { label: "Renewals & modifications", href: "/services#renewals" },
  { label: "Annual returns", href: "/services#returns" },
];

const COMPANY = [
  { label: "About us", href: "/#about" },
  { label: "Membership", href: "/#membership" },
  { label: "Enrollment", href: "/#enrollment" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" },
];

export function Footer() {
  const year = "2026"; // stamped; Date is unavailable at module scope during build

  return (
    <footer className="border-t-[0.5px] border-fr-sep bg-fr-panel">
      <div className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          {/* Brand + blurb */}
          <div>
            <Logo variant="lockup" height={26} />
            <p className="mt-4 max-w-[280px] text-[15px] leading-relaxed text-fr-ink-2">
              FSSAI licensing, made simple. We prepare and file every form for
              you — from Basic Registration to Central Licence — so you can get
              back to running your food business.
            </p>
          </div>

          {/* Services */}
          <FooterColumn title="Services" links={SERVICES} />

          {/* Company */}
          <FooterColumn title="Company" links={COMPANY} />

          {/* Contact */}
          <div>
            <h3 className="text-[13px] font-semibold tracking-[0.05em] text-fr-ink-3 uppercase">
              Contact
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-[15px] text-fr-ink-2">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="transition-colors hover:text-fr-ink"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>
                {CONTACT.phoneHref ? (
                  <a
                    href={`tel:${CONTACT.phoneHref}`}
                    className="transition-colors hover:text-fr-ink"
                  >
                    {CONTACT.phoneDisplay}
                  </a>
                ) : (
                  CONTACT.phoneDisplay
                )}
              </li>
              <li className="max-w-[240px] leading-relaxed">{fullAddress()}</li>
              <li className="text-fr-ink-3">{CONTACT.hours}</li>
            </ul>
          </div>
        </div>

        {/* Legal bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t-[0.5px] border-fr-sep pt-6 text-[13px] text-fr-ink-3 sm:flex-row">
          <p>© {year} FoodRaksha. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-fr-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-fr-ink">
              Terms
            </Link>
            <span className="text-fr-ink-3">
              An FSSAI licensing consultancy — not a government body.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-[13px] font-semibold tracking-[0.05em] text-fr-ink-3 uppercase">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5 text-[15px]">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-fr-ink-2 transition-colors hover:text-fr-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
