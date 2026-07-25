import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CONTACT, isPlaceholder } from "@/lib/marketing/contact";
import { Placeholder } from "./primitives";

/** The 4-column footer + legal bar, matching the prototype. */

const SERVICES = [
  { label: "New Application", href: "/book" },
  { label: "Modification", href: "/book" },
  { label: "Renewal", href: "/book" },
  { label: "Membership", href: "/membership" },
  { label: "FSSAI Enrollment", href: "/enrollment" },
];

const COMPANY = [
  { label: "About", href: "/about" },
  { label: "Explore More", href: "/explore" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Login", href: "/login" },
];

export function Footer() {
  const year = "2026"; // stamped; Date is unavailable at module scope during build

  return (
    <footer className="border-t-[0.5px] border-fr-sep bg-fr-panel">
      <div className="mx-auto max-w-[1120px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          {/* Brand + blurb */}
          <div>
            <Logo variant="lockup" height={26} />
            <p className="mt-4 max-w-[280px] text-[14px] leading-relaxed text-fr-ink-2">
              35+ years of experience in food handler and food manager training
              and compliance. Good work, fair price.
            </p>
          </div>

          <FooterColumn title="Services" links={SERVICES} />
          <FooterColumn title="Company" links={COMPANY} />

          {/* Contact */}
          <div>
            <h3 className="text-[13px] font-semibold tracking-[0.05em] text-fr-ink-2 uppercase">
              Contact
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-[14px] text-fr-ink-2">
              <li>
                {isPlaceholder(CONTACT.address) ? (
                  <Placeholder>{CONTACT.address}</Placeholder>
                ) : (
                  CONTACT.address
                )}
              </li>
              <li>
                {isPlaceholder(CONTACT.phoneDisplay) || !CONTACT.phoneHref ? (
                  <Placeholder>{CONTACT.phoneDisplay}</Placeholder>
                ) : (
                  <a
                    href={`tel:${CONTACT.phoneHref}`}
                    className="transition-colors hover:text-fr-ink"
                  >
                    {CONTACT.phoneDisplay}
                  </a>
                )}
              </li>
              <li>
                {isPlaceholder(CONTACT.email) ? (
                  <Placeholder>{CONTACT.email}</Placeholder>
                ) : (
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="transition-colors hover:text-fr-ink"
                  >
                    {CONTACT.email}
                  </a>
                )}
              </li>
              <li className="text-fr-ink-3">{CONTACT.hours}</li>
            </ul>
          </div>
        </div>

        {/* Legal bar */}
        <div className="mt-9 flex flex-col items-center justify-between gap-3 border-t-[0.5px] border-fr-sep pt-6 text-[13px] text-fr-ink-3 sm:flex-row">
          <p>© {year} Food Raksha. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-fr-ink">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms" className="hover:text-fr-ink">
              Terms
            </Link>
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
      <h3 className="text-[13px] font-semibold tracking-[0.05em] text-fr-ink-2 uppercase">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5 text-[14px]">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <Link
              href={link.href}
              className="text-fr-ink-2 transition-colors hover:text-fr-blue"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
