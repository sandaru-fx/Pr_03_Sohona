import { requireEnv } from "@/lib/env";

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
};

const R2_ENV_KEYS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
] as const;

/**
 * True when all R2 env vars are present (Phase 4.1+).
 * App boot does not require these until upload/view routes run.
 */
export function isR2Configured(): boolean {
  return R2_ENV_KEYS.every((key) => Boolean(process.env[key]?.trim()));
}

/**
 * Resolve private R2 config. Throws with a clear message if incomplete.
 */
export function requireR2Config(): R2Config {
  return {
    accountId: requireEnv("R2_ACCOUNT_ID"),
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    bucketName: requireEnv("R2_BUCKET_NAME"),
    endpoint: requireEnv("R2_ENDPOINT").replace(/\/$/, ""),
  };
}
