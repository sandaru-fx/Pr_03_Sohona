import { prisma } from "@/lib/prisma";
import { isPinLocked } from "@/lib/public-pin-lock";
import { hashToken } from "@/lib/tokens";

export type ManageGateProfile = {
  id: string;
  displayName: string;
  qrId: string;
  isPublicPinRequired: boolean;
  isSetupComplete: boolean;
};

export type ManagePinLockState = {
  lockedUntil: Date;
};

export type ManageGateResult =
  | {
      status: "invalid";
      message: string;
    }
  | {
      status: "ready";
      profile: ManageGateProfile;
      pinLock: ManagePinLockState | null;
      message: string;
    };

/**
 * Resolve a manage-link token into a Day 9 gate state.
 * Looks up by manageTokenHash only. Never returns token hashes or PIN hashes.
 */
export async function resolveManageGate(
  rawToken: string,
): Promise<ManageGateResult> {
  const token = rawToken.trim();
  if (!token || token.length > 256) {
    return {
      status: "invalid",
      message: "This manage link is invalid.",
    };
  }

  const manageTokenHash = hashToken(token);

  const profile = await prisma.profile.findFirst({
    where: { manageTokenHash },
    select: {
      id: true,
      displayName: true,
      qrId: true,
      isPublicPinRequired: true,
      isSetupComplete: true,
      hashedPin: true,
      pinLockedUntil: true,
      manageTokenHash: true,
    },
  });

  if (!profile || !profile.manageTokenHash || !profile.isSetupComplete) {
    return {
      status: "invalid",
      message:
        "This manage link is invalid or no longer active. If you still need access, ask the temple for help recovering your memorial setup.",
    };
  }

  if (!profile.hashedPin) {
    return {
      status: "invalid",
      message:
        "This memorial is not ready to manage yet. Complete family setup first.",
    };
  }

  const pinLock = isPinLocked(profile.pinLockedUntil)
    ? { lockedUntil: profile.pinLockedUntil as Date }
    : null;

  return {
    status: "ready",
    profile: {
      id: profile.id,
      displayName: profile.displayName,
      qrId: profile.qrId,
      isPublicPinRequired: profile.isPublicPinRequired,
      isSetupComplete: profile.isSetupComplete,
    },
    pinLock,
    message: pinLock
      ? "Too many incorrect PIN attempts. Please try again later."
      : "Enter your memorial PIN to manage private content. The manage link alone is never enough.",
  };
}
