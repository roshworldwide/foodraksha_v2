import Link from "next/link";
import { CONTACT } from "@/lib/marketing/contact";

/** The thin top strip: contact shortcuts and social, Apple-clean and subtle. */
export function UtilityBar() {
  const socials = Object.entries(CONTACT.social).filter(([, href]) => href) as [
    string,
    string,
  ][];

  return (
    <div className="hidden border-b-[0.5px] border-fr-sep bg-fr-panel text-fr-ink-2 md:block">
      <div className="mx-auto flex h-9 max-w-[1200px] items-center justify-between gap-6 px-6 text-[13px]">
        <div className="flex items-center gap-5">
          <a
            href={`mailto:${CONTACT.email}`}
            className="transition-colors hover:text-fr-ink"
          >
            {CONTACT.email}
          </a>
          {CONTACT.phoneHref ? (
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="transition-colors hover:text-fr-ink"
            >
              {CONTACT.phoneDisplay}
            </a>
          ) : (
            <span>{CONTACT.phoneDisplay}</span>
          )}
        </div>
        <div className="flex items-center gap-5">
          <Link href="/contact" className="transition-colors hover:text-fr-ink">
            Contact
          </Link>
          {socials.map(([name, href]) => (
            <a
              key={name}
              href={href}
              className="capitalize transition-colors hover:text-fr-ink"
              rel="noreferrer"
              target="_blank"
            >
              {name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
