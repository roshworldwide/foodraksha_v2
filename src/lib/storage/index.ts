import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";

/**
 * S3-compatible object storage. Provider-neutral: everything is driven by
 * S3_ENDPOINT with path-style addressing, so Supabase Storage, Cloudflare R2
 * and MinIO all work by changing environment variables alone. Buckets are
 * private — nothing is ever served from a public URL, only through
 * short-lived signed URLs.
 *
 * Browser uploads use a presigned PUT rather than a presigned POST form,
 * which these providers do not all support.
 *
 * Region: R2 accepts the literal "auto"; Supabase requires the project's real
 * region (e.g. ap-south-1) and rejects "auto". Set S3_REGION accordingly —
 * the "auto" fallback below only suits R2 and the local dev stub.
 */

/** How long a browser has to finish an upload it has been authorised for. */
const UPLOAD_TTL_SECONDS = 300;

let client: S3Client | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(
    env.S3_ENDPOINT &&
    env.S3_ACCESS_KEY_ID &&
    env.S3_SECRET_ACCESS_KEY &&
    env.S3_BUCKET_DOCUMENTS,
  );
}

function getClient(): S3Client {
  if (!isStorageConfigured()) {
    throw new Error("Object storage is not configured — see .env.example");
  }
  client ??= new S3Client({
    region: env.S3_REGION ?? "auto",
    endpoint: env.S3_ENDPOINT,
    // R2 and MinIO both address buckets by path, not by subdomain.
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY as string,
    },
  });
  return client;
}

function bucket(): string {
  return env.S3_BUCKET_DOCUMENTS as string;
}

/* ─────────────────────────────────────────────────────────── keys */

/**
 * Uploads land in quarantine first. Nothing reaches a document key until the
 * server has read the bytes, checked the magic numbers and stripped metadata.
 */
export function quarantineKey(applicationId: string): string {
  return `quarantine/${applicationId}/${randomUUID()}`;
}

export function documentKey(
  applicationId: string,
  docType: string,
  extension: string,
): string {
  const safeType = docType.replace(/[^a-z0-9._-]/gi, "_");
  return `applications/${applicationId}/${safeType}/${randomUUID()}.${extension}`;
}

/* ──────────────────────────────────────────────────────── operations */

/** A short-lived URL the browser may PUT exactly one object to. */
export async function presignUpload(
  key: string,
  contentType: string,
): Promise<{ url: string; expiresInSeconds: number }> {
  const url = await getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: UPLOAD_TTL_SECONDS },
  );
  return { url, expiresInSeconds: UPLOAD_TTL_SECONDS };
}

/** A short-lived read URL. 15 minutes, never longer. */
export async function presignDownload(
  key: string,
  fileName?: string,
): Promise<string> {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({
      Bucket: bucket(),
      Key: key,
      ResponseContentDisposition: fileName
        ? `inline; filename="${fileName.replace(/["\\]/g, "")}"`
        : undefined,
    }),
    { expiresIn: Math.min(env.S3_SIGNED_URL_TTL_SECONDS, 900) },
  );
}

export async function getObject(key: string): Promise<Buffer> {
  const response = await getClient().send(
    new GetObjectCommand({ Bucket: bucket(), Key: key }),
  );
  if (!response.Body) throw new Error(`Object ${key} has no body`);
  return Buffer.from(await response.Body.transformToByteArray());
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: bucket(), Key: key }),
  );
}
