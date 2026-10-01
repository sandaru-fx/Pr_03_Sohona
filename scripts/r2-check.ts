import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { isR2Configured, requireR2Config } from "../lib/r2-config";
import { getR2BucketName, getR2Client } from "../lib/r2";

async function main() {
  if (!isR2Configured()) {
    console.error(
      "R2 env incomplete. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT in `.env`.",
    );
    process.exitCode = 1;
    return;
  }

  const config = requireR2Config();
  const client = getR2Client();
  const bucket = getR2BucketName();

  await client.send(new HeadBucketCommand({ Bucket: bucket }));

  console.log("Cloudflare R2 connectivity OK (Phase 4.1).");
  console.log(
    JSON.stringify(
      {
        bucket,
        endpoint: config.endpoint,
        accountId: config.accountId,
        note: "Bucket must remain private. Presigned uploads arrive in Phase 4.3.",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("R2 connectivity check failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
