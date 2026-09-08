/**
 * Day 10.3 — external service wiring helpers (no secrets in output).
 */

export function normalizeAppOrigin(appUrl: string): string {
  return appUrl.trim().replace(/\/+$/, "");
}

export function googleOAuthWiring(appUrl: string): {
  origin: string;
  redirectUri: string;
  looksLocal: boolean;
} {
  const origin = normalizeAppOrigin(appUrl);
  return {
    origin,
    redirectUri: `${origin}/api/auth/callback/google`,
    looksLocal:
      /localhost|127\.0\.0\.1/i.test(origin) || origin.startsWith("http://"),
  };
}

/** CORS rules for browser PUT uploads from the app origin to private R2. */
export function r2CorsRulesForOrigin(appUrl: string): Array<{
  AllowedOrigins: string[];
  AllowedMethods: string[];
  AllowedHeaders: string[];
  ExposeHeaders: string[];
  MaxAgeSeconds: number;
}> {
  const origin = normalizeAppOrigin(appUrl);
  return [
    {
      AllowedOrigins: [origin],
      AllowedMethods: ["GET", "PUT", "HEAD"],
      AllowedHeaders: ["*"],
      ExposeHeaders: ["ETag", "Content-Type", "Content-Length"],
      MaxAgeSeconds: 3600,
    },
  ];
}

export const ATLAS_WIRING_NOTES = [
  "Network Access → add IP Allowlist entry 0.0.0.0/0 for Vercel serverless (or tighten later).",
  "Database user password special chars must be URL-encoded inside DATABASE_URL.",
  "Use the same cluster DB name you use locally unless you intentionally split prod.",
] as const;

export const UPSTASH_WIRING_NOTES = [
  "Create an Upstash Redis database (regional close to Vercel).",
  "Copy REST URL + REST TOKEN into UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.",
  "Optional on Day 10 — without Redis, rate limits degrade open; DB PIN locks still work.",
] as const;
