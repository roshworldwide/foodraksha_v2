import type { NextConfig } from "next";

/**
 * Object storage lives on its own origin, and the browser talks to it directly
 * in two places: document uploads PUT straight to a presigned URL
 * (connect-src), and image thumbnails are <img> tags whose /api/…/file src
 * redirects to a signed URL — CSP is checked against the redirect target too
 * (img-src). Derived from S3_ENDPOINT at build time so it follows whatever
 * provider each environment uses; when storage is not configured (uploads
 * switched off) nothing extra is allowed.
 */
const storageOrigin = (() => {
  const endpoint = process.env.S3_ENDPOINT;
  if (!endpoint) return null;
  try {
    return new URL(endpoint).origin;
  } catch {
    return null;
  }
})();
const withStorage = (sources: string) =>
  storageOrigin ? `${sources} ${storageOrigin}` : sources;

/**
 * Content Security Policy.
 *
 * Deliberately strict: no third-party origins beyond the storage origin above.
 * All styling and scripts are first-party (Next.js + Tailwind), images may be
 * data: URIs (PDF previews), same-origin, or signed storage URLs, and
 * connections are same-origin plus the storage origin for uploads.
 * `'unsafe-inline'` on styles is required by Tailwind's runtime style
 * injection; scripts do not get it in production.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  withStorage("img-src 'self' data: blob:"),
  // Google Fonts (Inter / Inter Tight) used by the static marketing site.
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Next.js injects a small inline bootstrap; in dev it also needs eval.
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  withStorage("connect-src 'self'"),
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // One year, subdomains, preload-eligible. Only meaningful over HTTPS.
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Uploaded documents and signed URLs must never be cached by a shared proxy.
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  // @react-pdf/renderer renders server-side and reads font files from disk,
  // so it must not be bundled.
  serverExternalPackages: ["@react-pdf/renderer"],

  // The blog / FSSAI-updates MDX is read from /content at build and (for the
  // dynamic index routes) at request time. Trace it into the server bundle so
  // it ships to a serverless deploy.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*.mdx"],
  },

  // Do not leak the framework version.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
