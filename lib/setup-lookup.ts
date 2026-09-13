import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

export type SetupGateProfile = {
  id: string;
  displayName: string;
  qrId: string;
  isSetupComplete: boolean;
  setupTokenExpiresAt: Date | null;
  setupUsedAt: Date | null;
  hasPin: boolean;
  packageTier: "A" | "B" | "C";
};

export type SetupStatementItem = {
  id: string;
  body: string;
  sortOrder: number;
};

export type SetupMediaItem = {
  id: string;
  kind: "PHOTO" | "VIDEO" | "VOICE";
  originalName: string | null;
  sizeBytes: number;
  contentType: string;
  durationSeconds: number | null;
  createdAt: Date;
};

export type SetupGateResult =
  | {
      status: "valid";
      profile: SetupGateProfile;
      statements: SetupStatementItem[];
      media: SetupMediaItem[];
    }
  | {
      status: "invalid" | "expired" | "used";
      profile?: SetupGateProfile;
      message: string;
    };

/**
 * Resolve a raw setup-token URL into a page gate state.
 * Looks up by token hash only (no profileId in the URL).
 */
export async function resolveSetupGate(
  rawToken: string,
): Promise<SetupGateResult> {
  const token = rawToken.trim();
  if (!token) {
    return {
      status: "invalid",
      message: "This setup link is invalid.",
    };
  }

  const setupTokenHash = hashToken(token);

  const profile = await prisma.profile.findFirst({
    where: { setupTokenHash },
    select: {
      id: true,
      displayName: true,
      qrId: true,
      isSetupComplete: true,
      setupTokenExpiresAt: true,
      setupUsedAt: true,
      setupTokenHash: true,
      hashedPin: true,
      packageId: true,
      statements: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, body: true, sortOrder: true },
      },
      mediaAssets: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          kind: true,
          originalName: true,
          sizeBytes: true,
          contentType: true,
          durationSeconds: true,
          createdAt: true,
        },
      },
    },
  });

  if (!profile) {
    return {
      status: "invalid",
      message:
        "This setup link is invalid or has already been used. Ask the temple for a new link if you still need access.",
    };
  }

  const gateProfile: SetupGateProfile = {
    id: profile.id,
    displayName: profile.displayName,
    qrId: profile.qrId,
    isSetupComplete: profile.isSetupComplete,
    setupTokenExpiresAt: profile.setupTokenExpiresAt,
    setupUsedAt: profile.setupUsedAt,
    hasPin: Boolean(profile.hashedPin),
    packageTier: profile.packageId,
  };

  if (profile.isSetupComplete) {
    return {
      status: "used",
      profile: gateProfile,
      message:
        "This memorial profile has already been set up. The one-time setup link can no longer be used.",
    };
  }

  if (
    profile.setupTokenExpiresAt &&
    profile.setupTokenExpiresAt.getTime() < Date.now()
  ) {
    return {
      status: "expired",
      profile: gateProfile,
      message:
        "This setup link has expired. Please contact the temple to request a new setup link.",
    };
  }

  return {
    status: "valid",
    profile: gateProfile,
    statements: profile.statements,
    media: profile.mediaAssets,
  };
}
