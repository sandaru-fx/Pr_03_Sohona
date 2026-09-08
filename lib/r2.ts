import { S3Client } from "@aws-sdk/client-s3";
import { requireR2Config } from "@/lib/r2-config";

const globalForR2 = globalThis as unknown as {
  r2Client: S3Client | undefined;
};

/**
 * Cloudflare R2 client (S3-compatible).
 * Private bucket only — never enable public access.
 */
export function getR2Client(): S3Client {
  const config = requireR2Config();

  if (!globalForR2.r2Client) {
    globalForR2.r2Client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return globalForR2.r2Client;
}

export function getR2BucketName(): string {
  return requireR2Config().bucketName;
}
