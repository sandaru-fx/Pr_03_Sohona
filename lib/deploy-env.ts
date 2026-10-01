/**
 * Day 10.2 — production env groups for Vercel.
 * Values are never logged by the checker; only set/missing status.
 */

export const DEPLOY_ENV_REQUIRED = [
  "APP_URL",
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "ADMIN_EMAIL_ALLOWLIST",
] as const;

/** Full media upload + signed playback demo. */
export const DEPLOY_ENV_R2 = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
] as const;

/** Distributed rate limits (DB locks still work without these). */
export const DEPLOY_ENV_REDIS = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

export type DeployEnvKey =
  | (typeof DEPLOY_ENV_REQUIRED)[number]
  | (typeof DEPLOY_ENV_R2)[number]
  | (typeof DEPLOY_ENV_REDIS)[number];

export function isEnvKeySet(key: string): boolean {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

export function summarizeDeployEnv(): {
  required: { key: string; set: boolean }[];
  r2: { key: string; set: boolean }[];
  redis: { key: string; set: boolean }[];
  requiredReady: boolean;
  r2Ready: boolean;
  redisReady: boolean;
  appUrlLooksLocal: boolean;
  appUrlLooksHttps: boolean;
} {
  const required = DEPLOY_ENV_REQUIRED.map((key) => ({
    key,
    set: isEnvKeySet(key),
  }));
  const r2 = DEPLOY_ENV_R2.map((key) => ({
    key,
    set: isEnvKeySet(key),
  }));
  const redis = DEPLOY_ENV_REDIS.map((key) => ({
    key,
    set: isEnvKeySet(key),
  }));

  const appUrl = process.env.APP_URL?.trim() ?? "";
  const appUrlLooksLocal =
    /localhost|127\.0\.0\.1/i.test(appUrl) || appUrl.startsWith("http://");
  const appUrlLooksHttps = appUrl.startsWith("https://");

  return {
    required,
    r2,
    redis,
    requiredReady: required.every((item) => item.set),
    r2Ready: r2.every((item) => item.set),
    redisReady: redis.every((item) => item.set),
    appUrlLooksLocal,
    appUrlLooksHttps,
  };
}
