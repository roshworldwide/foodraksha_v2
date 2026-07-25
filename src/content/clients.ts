/**
 * The client logo wall.
 *
 * The image files are the client's own, recovered from the legacy site's
 * `wwwroot/client-images/` and copied to `public/clients/`.
 *
 * They have been trimmed of their dead canvas padding, because the originals
 * had wildly different internal margins — the Medwell wordmark occupied about
 * 12% of a 200px square, so any single height cap in the marquee rendered it
 * unreadably small while wide logos filled their slot. Trimming means one
 * uniform cap gives even visual mass. Nothing was cropped from the artwork and
 * nothing was rescaled; it also took the Marine Lifesciences file from 568 KB
 * to 8 KB. The untouched originals remain in FoodLicense.zip.
 *
 * The dimensions below are the post-trim intrinsic sizes, so next/image can
 * reserve the right space and serve an optimised variant.
 */

export interface ClientLogo {
  /** Display name, and the image's alt text. */
  name: string;
  src: string;
  width: number;
  height: number;
}

/** Order follows the client's own logo wall. */
export const CLIENTS: ClientLogo[] = [
  {
    name: "Dr Agarwals Eye Hospital",
    src: "/clients/agarwals-eye-hospital.jpg",
    width: 386,
    height: 116,
  },
  {
    name: "Allianz Bio",
    src: "/clients/allianz-bio.png",
    width: 2685,
    height: 885,
  },
  {
    name: "Criticam Medical Systems",
    src: "/clients/criticam.webp",
    width: 534,
    height: 203,
  },
  { name: "DM", src: "/clients/dmpharma.png", width: 300, height: 180 },
  { name: "Karim's", src: "/clients/karims.png", width: 1011, height: 760 },
  {
    name: "Marine Lifesciences",
    src: "/clients/marine-life-sciences.jpg",
    width: 194,
    height: 58,
  },
  {
    name: "Medwell Ventures",
    src: "/clients/medwell.png",
    width: 192,
    height: 20,
  },
  {
    name: "Smayan Healthcare",
    src: "/clients/smayan-healthcare.png",
    width: 781,
    height: 227,
  },
  {
    name: "Sunways Bio-Science",
    src: "/clients/sunways.png",
    width: 290,
    height: 239,
  },
  {
    name: "Vinati Organics",
    src: "/clients/vinati-organics.jpg",
    width: 320,
    height: 131,
  },
];

/** Just the names — for the text logo strips on the other marketing pages. */
export const CLIENT_NAMES: string[] = CLIENTS.map((client) => client.name);
