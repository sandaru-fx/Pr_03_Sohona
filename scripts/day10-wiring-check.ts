import { summarizeDeployEnv } from "../lib/deploy-env";
import {
  ATLAS_WIRING_NOTES,
  googleOAuthWiring,
  r2CorsRulesForOrigin,
  UPSTASH_WIRING_NOTES,
} from "../lib/deploy-wiring";
import { isR2Configured } from "../lib/r2-config";
import { isRedisConfigured } from "../lib/redis-config";
import { prisma } from "../lib/prisma";

/**
 * Day 10.3 — print exact wiring steps + soft-probe services.
 * Never prints secret values.
 */
async function main() {
  const env = summarizeDeployEnv();
  const appUrl = process.env.APP_URL?.trim() || "https://YOUR_PROJECT.vercel.app";
  const oauth = googleOAuthWiring(appUrl);

  console.log("Day 10.3 — external service wiring\n");

  console.log("1) Google OAuth (Cloud Console → Credentials → Web client)");
  console.log(`   Authorized JavaScript origin:\n     ${oauth.origin}`);
  console.log(`   Authorized redirect URI:\n     ${oauth.redirectUri}`);
  if (oauth.looksLocal) {
    console.log(
      "   NOTE: APP_URL is local/http. After Vercel deploy, re-run with Production APP_URL",
    );
    console.log(
      "   (or add BOTH localhost and https://YOUR_PROJECT.vercel.app entries).",
    );
  } else {
    console.log("   Add these URIs, save, then redeploy Vercel.");
  }

  console.log("\n2) MongoDB Atlas");
  for (const note of ATLAS_WIRING_NOTES) {
    console.log(`   - ${note}`);
  }
  if (!env.required.find((item) => item.key === "DATABASE_URL")?.set) {
    console.log("   STATUS: DATABASE_URL missing locally.");
  } else {
    try {
      await prisma.$runCommandRaw({ ping: 1 });
      console.log("   STATUS: local DATABASE_URL ping OK.");
    } catch (error) {
      console.log(
        "   STATUS: local DATABASE_URL ping FAILED —",
        error instanceof Error ? error.message : error,
      );
    } finally {
      await prisma.$disconnect().catch(() => undefined);
    }
  }

  console.log("\n3) Cloudflare R2 (private bucket + browser upload CORS)");
  if (!isR2Configured()) {
    console.log("   STATUS: R2 env not set — skip for statements-only demo.");
    console.log(
      "   When ready: create private bucket, S3 API tokens, set R2_* on Vercel.",
    );
  } else {
    console.log("   STATUS: R2 env present locally (run npm run r2:check).");
  }
  console.log("   Suggested R2 CORS JSON for current APP_URL:");
  console.log(JSON.stringify(r2CorsRulesForOrigin(appUrl), null, 2));
  console.log(
    "   Apply in Cloudflare R2 → bucket → Settings → CORS Policy (or S3 PutBucketCors).",
  );

  console.log("\n4) Upstash Redis");
  for (const note of UPSTASH_WIRING_NOTES) {
    console.log(`   - ${note}`);
  }
  console.log(
    isRedisConfigured()
      ? "   STATUS: Redis env present locally (run npm run redis:check)."
      : "   STATUS: Redis env not set — optional for Day 10.",
  );

  console.log("\n5) After wiring");
  console.log("   - Vercel env vars match Production APP_URL host");
  console.log("   - Redeploy");
  console.log("   - Test /login Google → /admin");
  console.log("   - Test create profile → setup link → /p/{qrId}");

  console.log("\nDay 10.3 wiring guide printed.");
}

main().catch((error) => {
  console.error("Day 10.3 wiring check failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
