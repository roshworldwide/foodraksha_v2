import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * Deliberately strict: no third-party origins. All styling and scripts are
 * first-party (Next.js + Tailwind), images may be data: URIs (PDF previews)
 * and same-origin, and connections are same-origin only. `'unsafe-inline'` on
 * styles is required by Tailwind's runtime style injection; scripts do not get
 * it in production.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // Next.js injects a small inline bootstrap; in dev it also needs eval.
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
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

  // Do not leak the framework version.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
