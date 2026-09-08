import { requireEnv } from "@/lib/env";

export type RedisConfig = {
  url: string;
  token: string;
};

const REDIS_ENV_KEYS = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

/**
 * True when Upstash Redis env vars are present (Day 8+).
 * App boot does not require these — rate limits degrade when missing.
 */
export function isRedisConfigured(): boolean {
  return REDIS_ENV_KEYS.every((key) => Boolean(process.env[key]?.trim()));
}

/**
 * Resolve Upstash Redis config. Throws with a clear message if incomplete.
 */
export function requireRedisConfig(): RedisConfig {
  return {
    url: requireEnv("UPSTASH_REDIS_REST_URL"),
    token: requireEnv("UPSTASH_REDIS_REST_TOKEN"),
  };
}
