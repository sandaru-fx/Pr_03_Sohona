import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isR2Configured } from "@/lib/r2-config";
import { getR2BucketName, getR2Client } from "@/lib/r2";
import { isAppManagedR2ObjectKey } from "@/lib/r2-object-key";

/** Day 7 recommend: short-lived private media view URLs. */
export const R2_SIGNED_GET_EXPIRES_IN_SECONDS = 90;
export const R2_SIGNED_GET_MIN_EXPIRES_IN_SECONDS = 30;
export const R2_SIGNED_GET_MAX_EXPIRES_IN_SECONDS = 300;

export type SignedR2GetUrlResult = {
  url: string;
  expiresIn: number;
};

export function clampSignedGetExpiresIn(value: number | undefined): number {
  const raw = value ?? R2_SIGNED_GET_EXPIRES_IN_SECONDS;
  if (!Number.isFinite(raw)) {
    return R2_SIGNED_GET_EXPIRES_IN_SECONDS;
  }
  return Math.min(
    R2_SIGNED_GET_MAX_EXPIRES_IN_SECONDS,
    Math.max(R2_SIGNED_GET_MIN_EXPIRES_IN_SECONDS, Math.floor(raw)),
  );
}

/** Validate + normalize an object key before signing a GET URL. */
export function assertSignableR2ObjectKey(rawKey: string): string {
  const r2ObjectKey = rawKey.trim();
  if (!r2ObjectKey) {
    throw new Error("r2ObjectKey is required.");
  }
  if (r2ObjectKey.length > 512) {
    throw new Error("r2ObjectKey is too long.");
  }
  if (r2ObjectKey.includes("..") || r2ObjectKey.startsWith("/")) {
    throw new Error("r2ObjectKey is invalid.");
  }
  if (!isAppManagedR2ObjectKey(r2ObjectKey)) {
    throw new Error("r2ObjectKey is not an app-managed media object key.");
  }
  return r2ObjectKey;
}

/**
 * Create a short-lived signed GET URL for a private R2 object.
 * Never use this to mint permanent / public links.
 */
export async function getSignedR2GetUrl(input: {
  r2ObjectKey: string;
  expiresIn?: number;
}): Promise<SignedR2GetUrlResult> {
  if (!isR2Configured()) {
    throw new Error(
      "Cloudflare R2 is not configured. Set R2_* vars in `.env` and run `npm run r2:check`.",
    );
  }

  const r2ObjectKey = assertSignableR2ObjectKey(input.r2ObjectKey);
  const expiresIn = clampSignedGetExpiresIn(input.expiresIn);
  const command = new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: r2ObjectKey,
  });

  const url = await getSignedUrl(getR2Client(), command, { expiresIn });

  return { url, expiresIn };
}
