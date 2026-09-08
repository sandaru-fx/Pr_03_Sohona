import { createHash, createHmac } from "crypto";
import { getServerEnv } from "@/lib/env";
import { getClientIp } from "@/lib/request-ip";

const USER_AGENT_MAX = 300;

export type RequestIdentity = {
  /** Raw IP for ephemeral rate-limit key building only — never persist long-term. */
  ip: string | null;
  /** HMAC/SHA hash suitable for SecurityEvent.ipHash and Redis key segments. */
  ipHash: string | null;
  /** Truncated User-Agent for audit metadata. */
  userAgent: string | null;
};

/**
 * Hash a client IP for storage / Redis keys.
 * Prefers HMAC with AUTH_SECRET so hashes are not portable rainbow tables.
 */
export function hashIp(ip: string): string {
  const trimmed = ip.trim();
  if (!trimmed) {
    throw new Error("ip is required for hashing.");
  }

  const secret = getServerEnv().AUTH_SECRET;
  if (secret) {
    return createHmac("sha256", secret).update(trimmed, "utf8").digest("hex");
  }

  // Local/dev without AUTH_SECRET — still never store raw IP.
  return createHash("sha256")
    .update(`sohona-ip:${trimmed}`, "utf8")
    .digest("hex");
}

export function truncateUserAgent(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, USER_AGENT_MAX);
}

/** Resolve IP + hashed IP + UA from an incoming Request. */
export function getRequestIdentity(request: Request): RequestIdentity {
  const ip = getClientIp(request);
  return {
    ip,
    ipHash: ip ? hashIp(ip) : null,
    userAgent: truncateUserAgent(request.headers.get("user-agent")),
  };
}

/**
 * Fields safe to write onto SecurityEvent (no raw IP).
 */
export function securityEventRequestFields(request: Request): {
  ipHash?: string;
  userAgent?: string;
} {
  const identity = getRequestIdentity(request);
  return {
    ...(identity.ipHash ? { ipHash: identity.ipHash } : {}),
    ...(identity.userAgent ? { userAgent: identity.userAgent } : {}),
  };
}

/**
 * Build a Redis rate-limit key segment list.
 * Example: rateLimitKey(["pin", "ip", ipHash]) → `pin:ip:abc...`
 */
export function rateLimitKey(parts: Array<string | null | undefined>): string {
  const cleaned = parts
    .map((part) => (part ?? "unknown").trim())
    .filter(Boolean)
    .map((part) => part.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 80));

  if (cleaned.length === 0) return "unknown";
  return cleaned.join(":").slice(0, 180);
}
