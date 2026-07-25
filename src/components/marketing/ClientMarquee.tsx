import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ClientLogo } from "@/content/clients";

/**
 * The client wall, as a continuously scrolling marquee of real logos.
 *
 * CSS only — no JavaScript, so this stays a Server Component and ships nothing
 * to the browser. Three details make it behave:
 *
 *  · The track contains the list twice and travels exactly -50%, so the loop is
 *    seamless with no jump at the wrap.
 *  · The second copy is aria-hidden with empty alt text. Screen readers and
 *    crawlers get the client list once; the duplicate is purely decorative.
 *  · It pauses on hover and on keyboard focus within, so a logo can actually be
 *    looked at. `prefers-reduced-motion` is honoured globally in globals.css.
 *
 * Every logo sits in an equal fixed slot and is fitted with object-contain. The
 * files run from square to 3:1, so constraining width would render Karim's at a
 * third the mass of Allianz Bio; equal slots keep the rhythm even.
 */
export function ClientMarquee({
  label,
  logos,
  className,
}: {
  label?: string;
  logos: ClientLogo[];
  className?: string;
}) {
  if (logos.length === 0) return null;

  return (
    <div className={cn("group", className)}>
      {label && (
        <p className="mb-7 text-center text-[13px] font-medium tracking-[0.02em] text-fr-ink-2">
          {label}
        </p>
      )}

      {/* The mask fades both ends so logos enter and leave instead of being
          chopped off at a hard edge. */}
      <div
        className={cn(
          "relative overflow-hidden",
          "[mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]",
        )}
      >
        <div
          className={cn(
            "animate-fr-marquee flex w-max",
            "group-hover:[animation-play-state:paused]",
            "group-focus-within:[animation-play-state:paused]",
          )}
        >
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 || undefined}
              className="flex shrink-0 items-center"
            >
              {logos.map((logo) => (
                <li
                  key={logo.name}
                  className="flex h-[72px] w-[190px] shrink-0 items-center justify-center px-5"
                >
                  <Image
                    src={logo.src}
                    alt={copy === 0 ? logo.name : ""}
                    width={logo.width}
                    height={logo.height}
                    sizes="150px"
                    /* Eager, not lazy: a marquee scrolls its off-screen items
                       INTO view, so lazy loading would pop blank gaps in as the
                       track moves. Ten logos at w=384 is a few KB each, and
                       both copies share the same URLs. Not `priority` — that
                       would preload against the hero's LCP. */
                    loading="eager"
                    className={cn(
                      /* A fixed box with object-contain, NOT `w-auto` with max
                         caps: with a srcset, `auto` resolves to the intrinsic
                         width divided by the chosen candidate's density, which
                         rendered the two smallest files (Marine 194px, Medwell
                         192px) at ~39% of their slot. A fixed box scales the
                         artwork to fit regardless of source size, and the files
                         are trimmed so the artwork fills it. */
                      "h-[56px] w-[150px] object-contain",
                      // Muted by default so ten different brand palettes read as
                      // one wall; true colour on hover.
                      "opacity-80 transition-opacity duration-300 ease-ios",
                      "group-hover:opacity-100",
                    )}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
