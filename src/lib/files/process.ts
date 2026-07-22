import sharp from "sharp";
import { extensionFor, type AcceptedType } from "./inspect";

/**
 * Everything that reaches storage passes through here. Images are re-encoded,
 * which is what actually removes EXIF — including the GPS coordinates phones
 * quietly attach to photographs of documents.
 */

export interface ProcessedFile {
  body: Buffer;
  contentType: string;
  extension: string;
}

/** Passport photographs print into a 3:4 box. */
const PHOTO_WIDTH = 600;
const PHOTO_HEIGHT = 800;

/** Signatures are placed into PDF boxes, so keep them generous but bounded. */
const SIGNATURE_MAX_WIDTH = 1200;

/** Pixels lighter than this are paper, not ink. */
const INK_CUTOFF = 205;

export async function sanitizeDocument(
  buffer: Buffer,
  detected: AcceptedType,
): Promise<ProcessedFile> {
  if (detected === "application/pdf") {
    // PDFs carry no EXIF. Re-writing one risks breaking a government form.
    return {
      body: buffer,
      contentType: "application/pdf",
      extension: "pdf",
    };
  }

  // .rotate() with no argument applies the EXIF orientation and then drops it;
  // sharp writes no metadata unless asked, so the rest goes with it.
  const pipeline = sharp(buffer, { failOn: "error" }).rotate();

  const body =
    detected === "image/png"
      ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
      : await pipeline.jpeg({ quality: 88, mozjpeg: true }).toBuffer();

  return {
    body,
    contentType: detected,
    extension: extensionFor(detected),
  };
}

/** Square-cropped to 3:4 and stripped, whatever the phone produced. */
export async function processPhoto(buffer: Buffer): Promise<ProcessedFile> {
  const body = await sharp(buffer, { failOn: "error" })
    .rotate()
    .resize(PHOTO_WIDTH, PHOTO_HEIGHT, { fit: "cover", position: "attention" })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return { body, contentType: "image/png", extension: "png" };
}

/**
 * Ink on transparency, trimmed to the strokes.
 *
 * Works for both a signature drawn on the canvas and a photographed scan on
 * white paper: luminance becomes the alpha channel, so the paper disappears
 * and only the ink survives. Trimming to the content bounds means the PDF
 * writer can drop the result straight into a signature box without whitespace
 * throwing off the alignment.
 */
export async function processSignature(buffer: Buffer): Promise<ProcessedFile> {
  const { data, info } = await sharp(buffer, { failOn: "error" })
    .rotate()
    .flatten({ background: "#ffffff" })
    .greyscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = info.width * info.height;
  const rgba = Buffer.alloc(pixels * 4);

  for (let index = 0; index < pixels; index += 1) {
    const luminance = data[index * info.channels];
    const alpha = luminance >= INK_CUTOFF ? 0 : 255 - luminance;
    // Black ink; only the alpha channel varies.
    rgba[index * 4 + 3] = alpha;
  }

  const trimmed = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ background: "#00000000", threshold: 1 })
    .resize({
      width: SIGNATURE_MAX_WIDTH,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return { body: trimmed, contentType: "image/png", extension: "png" };
}
