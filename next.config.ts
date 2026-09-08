import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Playwright (127.0.0.1) to hit Next.js dev resources during e2e.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
