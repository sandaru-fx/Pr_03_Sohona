/**
 * r2-set-cors.ts
 * Sets CORS policy on the R2 bucket so browsers can PUT files directly.
 * Run with: npm run r2:set-cors
 */
import { PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { getR2BucketName, getR2Client } from "../lib/r2";
import { isR2Configured } from "../lib/r2-config";

async function main() {
  if (!isR2Configured()) {
    console.error(
      "R2 env incomplete. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT in `.env`.",
    );
    process.exitCode = 1;
    return;
  }

  const client = getR2Client();
  const bucket = getR2BucketName();
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const origins = [appUrl];
  // Always allow localhost for development
  if (!origins.includes("http://localhost:3000")) {
    origins.push("http://localhost:3000");
  }
  if (!origins.includes("http://localhost:3001")) {
    origins.push("http://localhost:3001");
  }

  console.log(`Setting CORS on bucket: ${bucket}`);
  console.log(`Allowed origins:`, origins);

  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: origins,
            AllowedMethods: ["PUT", "GET", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag", "Content-Type", "Content-Length"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );

  console.log("✅ CORS policy applied successfully!");
  console.log(
    "   Browser uploads from",
    origins.join(", "),
    "are now allowed.",
  );
  console.log(
    "   NOTE: When deploying to production, re-run with your live APP_URL set.",
  );
}

main().catch((error) => {
  console.error("Failed to set CORS policy.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
