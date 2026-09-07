import { z } from "zod";

/**
 * Treat blank env strings as "not set" so optional Phase 3+ vars
 * can stay empty in `.env` during early Day 1 work.
 */
function emptyToUndefined(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

const optionalNonEmptyString = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Phase 2 — required to boot the app shell
  APP_URL: z.preprocess(
    emptyToUndefined,
    z.string().url("APP_URL must be a valid URL (e.g. http://localhost:3000)"),
  ),

  // Phase 3+
  DATABASE_URL: optionalNonEmptyString,

  // Day 2 — Admin auth
  AUTH_SECRET: optionalNonEmptyString,
  AUTH_GOOGLE_ID: optionalNonEmptyString,
  AUTH_GOOGLE_SECRET: optionalNonEmptyString,
  ADMIN_EMAIL_ALLOWLIST: optionalNonEmptyString,

  // Day 4 — Cloudflare R2
  R2_ACCOUNT_ID: optionalNonEmptyString,
  R2_ACCESS_KEY_ID: optionalNonEmptyString,
  R2_SECRET_ACCESS_KEY: optionalNonEmptyString,
  R2_BUCKET_NAME: optionalNonEmptyString,
  R2_ENDPOINT: optionalNonEmptyString,

  // Day 8 — Upstash Redis
  UPSTASH_REDIS_REST_URL: optionalNonEmptyString,
  UPSTASH_REDIS_REST_TOKEN: optionalNonEmptyString,
});

export type ServerEnv = z.infer<typeof envSchema>;

function formatEnvError(error: z.ZodError): string {
  const details = error.issues
    .map((issue) => `- ${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");

  return [
    "Invalid environment configuration.",
    "Copy `.env.example` to `.env` and set the required values.",
    "",
    details,
  ].join("\n");
}

/**
 * Validates `process.env` once (server-side).
 * Phase 2 requires APP_URL. Later phases call `requireEnv(...)`.
 */
export function getServerEnv(): ServerEnv {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error));
  }

  return parsed.data;
}

type RequiredEnvKey = {
  [K in keyof ServerEnv]-?: undefined extends ServerEnv[K] ? never : K;
}[keyof ServerEnv];

type OptionalEnvKey = Exclude<keyof ServerEnv, RequiredEnvKey>;

/**
 * Use when a later phase needs a var that is optional at boot.
 * Example (Phase 3): `requireEnv("DATABASE_URL")`
 */
export function requireEnv<K extends OptionalEnvKey>(key: K): string {
  const value = getServerEnv()[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Set it in \`.env\` (see \`.env.example\`).`,
    );
  }
  return value;
}
