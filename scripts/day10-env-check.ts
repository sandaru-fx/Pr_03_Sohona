import {
  DEPLOY_ENV_REQUIRED,
  summarizeDeployEnv,
} from "../lib/deploy-env";

/**
 * Day 10.2 — production env readiness (never prints secret values).
 *
 * Usage:
 *   npm run day10:env-check
 *
 * Checks local `.env` so you know what to paste into Vercel.
 * For Vercel itself: Project → Settings → Environment Variables → Production.
 */
function main() {
  const summary = summarizeDeployEnv();

  const line = (items: { key: string; set: boolean }[]) =>
    items.map((item) => `  ${item.set ? "OK " : "MISS"}  ${item.key}`).join("\n");

  console.log("Day 10.2 — production env checklist (values hidden)\n");
  console.log("Required for admin + memorial demo:");
  console.log(line(summary.required));
  console.log(
    summary.requiredReady
      ? "\nRequired set: YES"
      : `\nRequired set: NO — missing: ${summary.required
          .filter((item) => !item.set)
          .map((item) => item.key)
          .join(", ")}`,
  );

  console.log("\nOptional — Cloudflare R2 (media):");
  console.log(line(summary.r2));
  console.log(summary.r2Ready ? "R2 set: YES" : "R2 set: NO (statements-only demo still OK)");

  console.log("\nOptional — Upstash Redis (rate limits):");
  console.log(line(summary.redis));
  console.log(
    summary.redisReady
      ? "Redis set: YES"
      : "Redis set: NO (degrades; DB PIN locks still apply)",
  );

  console.log("\nAPP_URL hints:");
  if (!isEnvKeySetLocal("APP_URL")) {
    console.log("  APP_URL is missing.");
  } else if (summary.appUrlLooksHttps && !summary.appUrlLooksLocal) {
    console.log("  Looks like a public HTTPS URL (good for Vercel Production).");
  } else if (summary.appUrlLooksLocal) {
    console.log(
      "  Current APP_URL looks local/http — on Vercel set Production APP_URL to https://YOUR_PROJECT.vercel.app (no trailing slash).",
    );
  } else {
    console.log("  APP_URL is set (check it matches the live domain).");
  }

  console.log("\nVercel paste order (Production + Preview if you want):");
  for (const key of DEPLOY_ENV_REQUIRED) {
    console.log(`  1) ${key}`);
  }
  console.log("  2) R2_* (if media demo)");
  console.log("  3) UPSTASH_REDIS_* (if distributed rate limits)");

  console.log("\nAfter setting vars on Vercel:");
  console.log("  - Update Google OAuth origin + redirect for the live host (Phase 10.3)");
  console.log("  - Redeploy");
  console.log("  - Atlas: allow access from Vercel (often 0.0.0.0/0 for serverless)");

  if (!summary.requiredReady) {
    process.exitCode = 1;
  } else {
    console.log("\nDay 10.2 local required env: READY to copy into Vercel.");
  }
}

function isEnvKeySetLocal(key: string): boolean {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

main();
