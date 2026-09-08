import { prisma } from "@/lib/prisma";

/**
 * Day 5 foundation for setup abuse protection.
 * Day 8 replaces/extends this with Redis sliding windows.
 */
export const SETUP_FAIL_WINDOW_MS = 15 * 60 * 1000;
export const SETUP_FAIL_MAX_ATTEMPTS = 20;

export type SetupRateLimitResult =
  | { ok: true }
  | {
      ok: false;
      status: 429;
      error: "SetupRateLimited";
      message: string;
    };

/**
 * Soft gate based on recent SETUP_TOKEN_FAIL events for a profile.
 * Missing profileId skips the check (unknown tokens still get auth failure).
 */
export async function assertSetupNotRateLimited(
  profileId: string | null | undefined,
): Promise<SetupRateLimitResult> {
  if (!profileId) {
    return { ok: true };
  }

  const since = new Date(Date.now() - SETUP_FAIL_WINDOW_MS);
  const fails = await prisma.securityEvent.count({
    where: {
      profileId,
      type: "SETUP_TOKEN_FAIL",
      createdAt: { gte: since },
    },
  });

  if (fails >= SETUP_FAIL_MAX_ATTEMPTS) {
    return {
      ok: false,
      status: 429,
      error: "SetupRateLimited",
      message:
        "Too many failed setup attempts. Please wait a few minutes and try again, or ask the temple for a new setup link.",
    };
  }

  return { ok: true };
}

export async function recordSetupTokenEvent(input: {
  profileId?: string | null;
  ok: boolean;
  reason?: string;
}) {
  try {
    await prisma.securityEvent.create({
      data: {
        profileId: input.profileId ?? undefined,
        type: input.ok ? "SETUP_TOKEN_OK" : "SETUP_TOKEN_FAIL",
        metadata: input.reason ? { reason: input.reason } : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to record setup token security event", error);
  }
}
