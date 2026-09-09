import { prisma } from "@/lib/prisma";

export const MANAGE_STATEMENT_SELECT = {
  id: true,
  body: true,
  sortOrder: true,
  updatedAt: true,
} as const;

export const MANAGE_MEDIA_SELECT = {
  id: true,
  kind: true,
  contentType: true,
  sizeBytes: true,
  originalName: true,
  sortOrder: true,
  createdAt: true,
} as const;

/** Runtime guard — owner content payloads must never leak these. */
export const MANAGE_CONTENT_FORBIDDEN_FIELDS = [
  "hashedPin",
  "setupTokenHash",
  "manageTokenHash",
  "r2ObjectKey",
  "failedPinAttempts",
  "pinLockedUntil",
  "securityEvents",
  "comments",
] as const;

export type ManageOwnerContent = {
  profile: {
    id: string;
    displayName: string;
    qrId: string;
    isPublicPinRequired: boolean;
  };
  statements: Array<{
    id: string;
    body: string;
    sortOrder: number;
    updatedAt: Date;
  }>;
  media: Array<{
    id: string;
    kind: "PHOTO" | "VIDEO" | "VOICE";
    contentType: string;
    sizeBytes: number;
    originalName: string | null;
    sortOrder: number;
    createdAt: Date;
  }>;
};

/**
 * Load private memorial content for an authenticated manage session.
 * Never returns token hashes, PIN hashes, or r2ObjectKey.
 */
export async function loadManageOwnerContent(
  profileId: string,
): Promise<ManageOwnerContent | null> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      displayName: true,
      qrId: true,
      isPublicPinRequired: true,
      isSetupComplete: true,
      manageTokenHash: true,
      hashedPin: true,
    },
  });

  if (
    !profile ||
    !profile.isSetupComplete ||
    !profile.manageTokenHash ||
    !profile.hashedPin
  ) {
    return null;
  }

  const [statements, media] = await Promise.all([
    prisma.statement.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: "asc" },
      select: MANAGE_STATEMENT_SELECT,
    }),
    prisma.mediaAsset.findMany({
      where: { profileId: profile.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: MANAGE_MEDIA_SELECT,
    }),
  ]);

  return {
    profile: {
      id: profile.id,
      displayName: profile.displayName,
      qrId: profile.qrId,
      isPublicPinRequired: profile.isPublicPinRequired,
    },
    statements,
    media,
  };
}
