import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer renders server-side and reads font files from disk,
  // so it must not be bundled.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
