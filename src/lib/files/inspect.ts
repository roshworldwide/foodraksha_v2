/**
 * File type by magic bytes. The extension and the browser-supplied MIME type
 * are both attacker-controlled and are never trusted.
 */

export const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type AcceptedType = (typeof ACCEPTED_TYPES)[number];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const SIGNATURES: { type: AcceptedType; bytes: number[] }[] = [
  { type: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // %PDF-
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  {
    type: "image/png",
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
];

export function detectType(buffer: Buffer): AcceptedType | null {
  for (const signature of SIGNATURES) {
    if (buffer.length < signature.bytes.length) continue;
    if (signature.bytes.every((byte, index) => buffer[index] === byte)) {
      return signature.type;
    }
  }
  return null;
}

export function isAcceptedType(value: string): value is AcceptedType {
  return (ACCEPTED_TYPES as readonly string[]).includes(value);
}

export function extensionFor(type: AcceptedType): string {
  switch (type) {
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
  }
}
