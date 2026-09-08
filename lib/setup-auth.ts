import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { isMongoObjectId } from "@/lib/object-id";
import { hashToken } from "@/lib/tokens";

export type SetupAuthSuccess = {
  ok: true;
  profile: {
    id: string;
    qrId: string;
    isSetupComplete: boolean;
    setupTokenExpiresAt: Date | null;
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
 * Used by Day 4 media presign until Day 5 completes the full setup UI.
 */
export async function authorizeSetupToken(input: {
  profileId: string;
  setupToken: string;
}): Promise<SetupAuthSuccess | SetupAuthFailure> {
  if (!isMongoObjectId(input.profileId)) {
    return {
      ok: false,
      status: 400,
      error: "InvalidProfileId",
      message: "profileId must be a valid id.",
    };
  }

  const setupToken = input.setupToken.trim();
  if (!setupToken) {
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
    },
  });

  if (!profile || !profile.setupTokenHash) {
    return {
      ok: false,
      status: 401,
      error: "InvalidSetupToken",
      message: "Setup token is invalid or profile was not found.",
    };
  }

  if (profile.isSetupComplete) {
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
    return {
      ok: false,
      status: 401,
      error: "SetupTokenExpired",
      message: "This setup link has expired.",
    };
  }

  const providedHash = hashToken(setupToken);
  if (!safeEqualHex(providedHash, profile.setupTokenHash)) {
    return {
      ok: false,
      status: 401,
      error: "InvalidSetupToken",
      message: "Setup token is invalid or profile was not found.",
    };
  }

  return {
    ok: true,
    profile: {
      id: profile.id,
      qrId: profile.qrId,
      isSetupComplete: profile.isSetupComplete,
      setupTokenExpiresAt: profile.setupTokenExpiresAt,
    },
  };
}
