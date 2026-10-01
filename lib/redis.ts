import { Redis } from "@upstash/redis";
import { isRedisConfigured, requireRedisConfig } from "@/lib/redis-config";

const globalForRedis = globalThis as unknown as {
  sohonaRedis: Redis | undefined;
};

/**
 * Upstash Redis client (REST).
 * Call only when isRedisConfigured() is true, or via getRedisClient().
 */
export function getRedisClient(): Redis {
  const config = requireRedisConfig();

  if (!globalForRedis.sohonaRedis) {
    globalForRedis.sohonaRedis = new Redis({
      url: config.url,
      token: config.token,
    });
  }

  return globalForRedis.sohonaRedis;
}

export function tryGetRedisClient(): Redis | null {
  if (!isRedisConfigured()) return null;
  try {
    return getRedisClient();
  } catch {
    return null;
  }
}
