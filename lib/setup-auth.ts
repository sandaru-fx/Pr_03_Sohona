import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { isMongoObjectId } from "@/lib/object-id";
import { securityEventRequestFields } from "@/lib/request-identity";
import {
  assertSetupNotRateLimited,
  recordSetupTokenEvent,
} from "@/lib/setup-rate-limit";
import { hashToken } from "@/lib/tokens";

export type SetupAuthSuccess = {
  ok: true;
  profile: {
    id: string;
    qrId: string;
    isSetupComplete: boolean;
    setupTokenExpiresAt: Date | null;
    packageTier: "A" | "B" | "C";
  };
};

export type SetupAuthFailure = {
  ok: false;
  status: number;
  error: string;
  message: string;
};

function safeEqualHex(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a, "utf8");
    const right = Buffer.from(b, "utf8");
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

/**
 * Authorize family setup actions with the one-time setup token.
 * Logs fail/success events (hashed IP when request provided).
 * DB fail-window + Day 8 Redis IP limits both apply.
 */
export async function authorizeSetupToken(input: {
  profileId: string;
  setupToken: string;
  /** When true, records SETUP_TOKEN_OK (use for sensitive finish steps). */
  recordSuccess?: boolean;
  /** Optional request for hashed IP / UA on SecurityEvent rows. */
  request?: Request;
}): Promise<SetupAuthSuccess | SetupAuthFailure> {
  const requestFields = input.request
    ? securityEventRequestFields(input.request)
    : {};

  if (!isMongoObjectId(input.profileId)) {
    return {
      ok: false,
      status: 400,
      error: "InvalidProfileId",
      message: "profileId must be a valid id.",
    };
  }

  const rate = await assertSetupNotRateLimited(input.profileId);
  if (!rate.ok) {
    return rate;
  }

  const setupToken = input.setupToken.trim();
  if (!setupToken) {
    await recordSetupTokenEvent({
      profileId: input.profileId,
      ok: false,
      reason: "missing_token",
      ...requestFields,
    });
    return {
      ok: false,
      status: 401,
      error: "MissingSetupToken",
      message: "setupToken is required.",
    };
  }

  const profile = await prisma.profile.findUnique({
    where: { id: input.profileId },
    select: {
      id: true,
      qrId: true,
      isSetupComplete: true,
      setupTokenHash: true,
      setupTokenExpiresAt: true,
      packageTier: true,
    },
  });

  if (!profile || !profile.setupTokenHash) {
    await recordSetupTokenEvent({
      profileId: input.profileId,
      ok: false,
      reason: "missing_or_cleared_hash",
      ...requestFields,
    });
    return {
      ok: false,
      status: 401,
      error: "InvalidSetupToken",
      message: "Setup token is invalid or profile was not found.",
    };
  }

  if (profile.isSetupComplete) {
    await recordSetupTokenEvent({
      profileId: profile.id,
      ok: false,
      reason: "already_complete",
      ...requestFields,
    });
    return {
      ok: false,
      status: 409,
      error: "SetupAlreadyComplete",
      message: "This profile setup is already complete.",
    };
  }

  if (
    profile.setupTokenExpiresAt &&
    profile.setupTokenExpiresAt.getTime() < Date.now()
  ) {
    await recordSetupTokenEvent({
      profileId: profile.id,
      ok: false,
      reason: "expired",
      ...requestFields,
    });
    return {
      ok: false,
      status: 401,
      error: "SetupTokenExpired",
      message: "This setup link has expired.",
    };
  }

  const providedHash = hashToken(setupToken);
  if (!safeEqualHex(providedHash, profile.setupTokenHash)) {
    await recordSetupTokenEvent({
      profileId: profile.id,
      ok: false,
      reason: "hash_mismatch",
      ...requestFields,
    });
    return {
      ok: false,
      status: 401,
      error: "InvalidSetupToken",
      message: "Setup token is invalid or profile was not found.",
    };
  }

  if (input.recordSuccess) {
    await recordSetupTokenEvent({
      profileId: profile.id,
      ok: true,
      reason: "authorized",
      ...requestFields,
    });
  }

  return {
    ok: true,
    profile: {
      id: profile.id,
      qrId: profile.qrId,
      isSetupComplete: profile.isSetupComplete,
      setupTokenExpiresAt: profile.setupTokenExpiresAt,
      packageTier: profile.packageTier,
    },
  };
}
