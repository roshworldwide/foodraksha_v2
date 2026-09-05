import Link from "next/link";
import { CONTACT, isPlaceholder } from "@/lib/marketing/contact";
import { Placeholder } from "./primitives";

/** The thin top strip: contact shortcuts and social, Apple-clean and subtle. */
export function UtilityBar() {
  const socials = Object.entries(CONTACT.social).filter(([, href]) => href) as [
    string,
    string,
  ][];

  const emailIsPh = isPlaceholder(CONTACT.email);
  const phoneIsPh = isPlaceholder(CONTACT.phoneDisplay);

  return (
    <div className="hidden border-b border-white/10 bg-fr-night text-white/55 md:block">
      <div className="mx-auto flex h-[38px] max-w-[1120px] items-center gap-[18px] px-6 text-[13px]">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">✉</span>
          {emailIsPh ? (
            <Placeholder>{CONTACT.email}</Placeholder>
          ) : (
            <a
              href={`mailto:${CONTACT.email}`}
              className="transition-colors hover:text-white"
            >
              {CONTACT.email}
            </a>
          )}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">✆</span>
          {phoneIsPh || !CONTACT.phoneHref ? (
            <Placeholder>{CONTACT.phoneDisplay}</Placeholder>
          ) : (
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="transition-colors hover:text-white"
            >
              {CONTACT.phoneDisplay}
            </a>
          )}
        </span>
        <div className="ml-auto flex items-center gap-3.5">
          <Link href="/contact" className="transition-colors hover:text-white">
            Contact
          </Link>
          {socials.map(([name, href]) => (
            <a
              key={name}
              href={href}
              className="capitalize transition-colors hover:text-white"
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
