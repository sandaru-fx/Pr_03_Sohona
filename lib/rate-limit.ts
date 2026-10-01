import { isRedisConfigured } from "@/lib/redis-config";
import { tryGetRedisClient } from "@/lib/redis";

export type RateLimitInput = {
  /** Stable key, e.g. `pin:ip:abc` or `media:profile:xyz` — no secrets. */
  key: string;
  /** Sliding/fixed window length in milliseconds. */
  windowMs: number;
  /** Max allowed hits inside the window. */
  max: number;
};

export type RateLimitAllowed = {
  ok: true;
  degraded: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

export type RateLimitBlocked = {
  ok: false;
  degraded: false;
  status: 429;
  error: "RateLimited";
  message: string;
  limit: number;
  remaining: 0;
  resetAt: number;
  retryAfterSeconds: number;
};

export type RateLimitResult = RateLimitAllowed | RateLimitBlocked;

function sanitizeKey(key: string): string {
  return key.trim().replace(/\s+/g, "_").slice(0, 200);
}

/**
 * Fixed-window counter rate limit via Upstash Redis.
 * If Redis is not configured / unavailable, allows the request (degraded).
 * DB locks (PIN/setup) remain the hard safety net.
 */
export async function rateLimit(
  input: RateLimitInput,
): Promise<RateLimitResult> {
  const max = Math.max(1, Math.floor(input.max));
  const windowMs = Math.max(1000, Math.floor(input.windowMs));
  const now = Date.now();
  const resetAt = now + windowMs;

  if (!isRedisConfigured()) {
    return {
      ok: true,
      degraded: true,
      limit: max,
      remaining: max,
      resetAt,
    };
  }

  const redis = tryGetRedisClient();
  if (!redis) {
    return {
      ok: true,
      degraded: true,
      limit: max,
      remaining: max,
      resetAt,
    };
  }

  const bucket = Math.floor(now / windowMs);
  const redisKey = `sohona:rl:${sanitizeKey(input.key)}:${bucket}`;

  try {
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.pexpire(redisKey, windowMs);
    }

    const remaining = Math.max(0, max - count);
    const windowResetAt = (bucket + 1) * windowMs;

    if (count > max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((windowResetAt - now) / 1000),
      );
      return {
        ok: false,
        degraded: false,
        status: 429,
        error: "RateLimited",
        message:
          "Too many requests. Please wait a moment and try again.",
        limit: max,
        remaining: 0,
        resetAt: windowResetAt,
        retryAfterSeconds,
      };
    }

    return {
      ok: true,
      degraded: false,
      limit: max,
      remaining,
      resetAt: windowResetAt,
    };
  } catch (error) {
    console.error("Redis rate limit failed; degrading to allow", error);
    return {
      ok: true,
      degraded: true,
      limit: max,
      remaining: max,
      resetAt,
    };
  }
}

/** Attach standard rate-limit headers for API responses. */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
  if (!result.ok) {
    headers["Retry-After"] = String(result.retryAfterSeconds);
  }
  return headers;
}
