import { NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import {
  getRequestIdentity,
  rateLimitKey,
} from "@/lib/request-identity";

export const RATE_LIMIT_PRESETS = {
  /** Public PIN attempts per IP. */
  publicPinIp: { windowMs: 15 * 60 * 1000, max: 10 },
  /** Extra soft cap per profile (DB still enforces 5 fails → lock). */
  publicPinProfile: { windowMs: 15 * 60 * 1000, max: 20 },
  /** Family setup APIs + setup-token media upload. */
  setupIp: { windowMs: 15 * 60 * 1000, max: 30 },
  /** Owner manage APIs after PIN session (statements / media / settings). */
  manageIp: { windowMs: 15 * 60 * 1000, max: 60 },
  /** Signed media URL minting. */
  mediaUrlIp: { windowMs: 5 * 60 * 1000, max: 60 },
  /** Soft admin API throttle. */
  adminIp: { windowMs: 5 * 60 * 1000, max: 120 },
} as const;

export type RateLimitScope = keyof typeof RATE_LIMIT_PRESETS;

function blockedResponse(
  result: Extract<Awaited<ReturnType<typeof rateLimit>>, { ok: false }>,
) {
  return NextResponse.json(
    {
      error: result.error,
      message: result.message,
      retryAfterSeconds: result.retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        ...rateLimitHeaders(result),
      },
    },
  );
}

/**
 * Enforce an IP-scoped preset. Returns a 429 response when blocked, else null.
 */
export async function enforceIpRateLimit(
  request: Request,
  scope: Exclude<RateLimitScope, "publicPinProfile">,
): Promise<NextResponse | null> {
  const identity = getRequestIdentity(request);
  const preset = RATE_LIMIT_PRESETS[scope];
  const result = await rateLimit({
    key: rateLimitKey([scope, "ip", identity.ipHash]),
    windowMs: preset.windowMs,
    max: preset.max,
  });

  if (!result.ok) return blockedResponse(result);
  return null;
}

/**
 * Soft Redis cap for a memorial profile PIN attempts (DB lock remains authoritative).
 */
export async function enforcePublicPinProfileRateLimit(
  request: Request,
  profileId: string,
): Promise<NextResponse | null> {
  const identity = getRequestIdentity(request);
  const preset = RATE_LIMIT_PRESETS.publicPinProfile;
  const result = await rateLimit({
    key: rateLimitKey([
      "publicPinProfile",
      "profile",
      profileId,
      "ip",
      identity.ipHash,
    ]),
    windowMs: preset.windowMs,
    max: preset.max,
  });

  if (!result.ok) return blockedResponse(result);
  return null;
}
