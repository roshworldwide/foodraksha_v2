import Link from "next/link";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";
import { ALIGNED_WITH, FOOTER_GROUPS } from "@/content/navigation";
import { CONTACT, CONTACT_IS_PLACEHOLDER } from "@/lib/marketing/contact";

/**
 * The marketing footer, ported from docs/client-design/components/Footer.tsx:
 * an "Aligned with" strip over a four-column link grid and a legal line.
 *
 * A Server Component — the original had no interactivity, only markup.
 *
 * Their footer hardcodes support@foodraksha.com and +91 99999 99999. Neither is
 * real, so neither ships: contact details come from the contact config and
 * render as the site's standard "awaiting" markers until the client confirms
 * them. Their social icons linked to "#" and no accounts are confirmed, so the
 * row appears only when a real profile URL exists.
 */

const PLACEHOLDER =
  "rounded bg-[#FFF4E5] px-1.5 py-0.5 text-[0.92em] text-[#B85C00]";

export function SiteFooter() {
  const socials = Object.entries(CONTACT.social).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  return (
    <footer className="w-full border-t border-fr-sep bg-fr-bg">
      {/* Aligned with */}
      <div className="border-b border-fr-sep">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-12 gap-y-5 px-6 py-8 md:justify-between">
          <span className="text-[12px] font-bold tracking-[0.12em] text-fr-ink-2 uppercase">
            Aligned with
          </span>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {ALIGNED_WITH.map((body) => (
              <li key={body.name} className="text-center">
                <span className="block text-[15px] font-extrabold text-fr-ink">
                  {body.name}
                </span>
                <span className="block text-[11px] text-fr-ink-2">
                  {body.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo variant="lockup" height={28} />
          <p className="mt-4 max-w-[260px] text-[14px] leading-relaxed text-fr-ink-2">
            35+ years of experience in food handler and food manager training
            and compliance. Good work, fair price.
          </p>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <div key={group.heading}>
            <h3 className="text-[15px] font-bold text-fr-ink">
              {group.heading}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-fr-ink-2 transition-colors hover:text-fr-blue"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 md:col-span-1">
          <h3 className="text-[15px] font-bold text-fr-ink">Contact us</h3>
          <ul className="mt-3 flex flex-col gap-2 text-[14px] text-fr-ink-2">
            <li>
              {CONTACT_IS_PLACEHOLDER ? (
                <span className={PLACEHOLDER}>{CONTACT.email}</span>
              ) : (
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="transition-colors hover:text-fr-blue"
                >
                  {CONTACT.email}
                </a>
              )}
            </li>
            <li>
              {CONTACT_IS_PLACEHOLDER ? (
                <span className={PLACEHOLDER}>{CONTACT.phoneDisplay}</span>
              ) : (
                <a
                  href={`tel:${CONTACT.phoneHref}`}
                  className="transition-colors hover:text-fr-blue"
                >
                  {CONTACT.phoneDisplay}
                </a>
              )}
            </li>
            <li>
              {CONTACT_IS_PLACEHOLDER ? (
                <span className={PLACEHOLDER}>{CONTACT.address}</span>
              ) : (
                CONTACT.address
              )}
            </li>
            <li>{CONTACT.hours}</li>
          </ul>

          {socials.length > 0 && (
            <ul className="mt-4 flex gap-3">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-medium text-fr-ink-2 capitalize transition-colors hover:text-fr-blue"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div
        className={cn(
          "border-t border-fr-sep px-6 py-5",
          "text-center text-[12.5px] text-fr-ink-2",
        )}
      >
        © {new Date().getFullYear()} Food Raksha. All rights reserved. ·
        Compliance. Simplified.
      </div>
    </footer>
  );
}
