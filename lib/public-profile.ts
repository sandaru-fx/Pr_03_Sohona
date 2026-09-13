import { getCommentQuota, type CommentQuota } from "@/lib/comment-limits";
import { prisma } from "@/lib/prisma";
import { isPinLocked } from "@/lib/public-pin-lock";

export type PublicProfileSummary = {
  id: string;
  displayName: string;
  qrId: string;
  isPublicPinRequired: boolean;
  packageTier: "A" | "B" | "C";
};

export type PublicStatementItem = {
  id: string;
  body: string;
  sortOrder: number;
};

export type PublicMediaMetaItem = {
  id: string;
  kind: "PHOTO" | "VIDEO" | "VOICE";
  originalName: string | null;
  sizeBytes: number;
  contentType: string;
};

export type PublicCommentItem = {
  id: string;
  body: string;
  wordCount: number;
  createdAt: Date;
};

export type PublicMemorialContent = {
  statements: PublicStatementItem[];
  media: PublicMediaMetaItem[];
  comments: PublicCommentItem[];
  commentQuota: CommentQuota;
};

export type PublicPinLockState = {
  lockedUntil: Date;
};

export type PublicProfileGateResult =
  | {
      status: "not_found";
      message: string;
    }
  | {
      status: "not_ready";
      profile: Pick<PublicProfileSummary, "displayName" | "qrId">;
      message: string;
    }
  | {
      status: "ready";
      profile: PublicProfileSummary;
      access: "open" | "pin_required";
      message: string;
      pinLock: PublicPinLockState | null;
    };

/**
 * Resolve a public QR route into a Day 6 gate state.
 * Never returns PIN hashes, setup/manage tokens, or private admin fields.
 */
export async function resolvePublicProfileGate(
  rawQrId: string,
): Promise<PublicProfileGateResult> {
  const qrId = rawQrId.trim();
  if (!qrId || qrId.length > 128) {
    return {
      status: "not_found",
      message: "This memorial link is invalid.",
    };
  }

  const profile = await prisma.profile.findUnique({
    where: { qrId },
    select: {
      id: true,
      displayName: true,
      qrId: true,
      isSetupComplete: true,
      isPublicPinRequired: true,
      packageId: true,
      pinLockedUntil: true,
    },
  });

  if (!profile) {
    return {
      status: "not_found",
      message:
        "This memorial could not be found. The QR code may be incorrect or no longer active.",
    };
  }

  if (!profile.isSetupComplete) {
    return {
      status: "not_ready",
      profile: {
        displayName: profile.displayName,
        qrId: profile.qrId,
      },
      message:
        "This memorial is not ready yet. The family is still completing setup.",
    };
  }

  const access = profile.isPublicPinRequired ? "pin_required" : "open";
  const pinLock =
    access === "pin_required" && isPinLocked(profile.pinLockedUntil)
      ? { lockedUntil: profile.pinLockedUntil as Date }
      : null;

  return {
    status: "ready",
    profile: {
      id: profile.id,
      displayName: profile.displayName,
      qrId: profile.qrId,
      isPublicPinRequired: profile.isPublicPinRequired,
      packageTier: profile.packageId,
    },
    access,
    pinLock,
    message:
      access === "pin_required"
        ? pinLock
          ? "Too many incorrect PIN attempts. Please try again later."
          : "This memorial is protected with a PIN."
        : "This memorial is ready to view.",
  };
}

/**
 * Load view-only memorial content after access is granted.
 * Never includes r2ObjectKey — signed media URLs are Day 7.
 */
export const PUBLIC_STATEMENT_SELECT = {
  id: true,
  body: true,
  sortOrder: true,
} as const;

export const PUBLIC_MEDIA_META_SELECT = {
  id: true,
  kind: true,
  originalName: true,
  sizeBytes: true,
  contentType: true,
} as const;

export const PUBLIC_COMMENT_SELECT = {
  id: true,
  body: true,
  wordCount: true,
  createdAt: true,
} as const;

/** Guarded by day6:verify — never select these for public memorial payloads. */
export const PUBLIC_CONTENT_FORBIDDEN_FIELDS = [
  "hashedPin",
  "setupTokenHash",
  "manageTokenHash",
  "r2ObjectKey",
  "failedPinAttempts",
  "pinLockedUntil",
] as const;

export async function loadPublicMemorialContent(
  profileId: string,
): Promise<PublicMemorialContent> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { packageId: true },
  });

  const tier = profile?.packageTier ?? "A";

  const [statements, media, comments, commentQuota] = await Promise.all([
    prisma.statement.findMany({
      where: { profileId },
      orderBy: { sortOrder: "asc" },
      select: PUBLIC_STATEMENT_SELECT,
    }),
    prisma.mediaAsset.findMany({
      where: { profileId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: PUBLIC_MEDIA_META_SELECT,
    }),
    prisma.comment.findMany({
      where: { profileId, status: "VISIBLE" },
      orderBy: { createdAt: "asc" },
      select: PUBLIC_COMMENT_SELECT,
    }),
    getCommentQuota(profileId, tier),
  ]);

  return { statements, media, comments, commentQuota };
}

export function canViewPublicContent(
  result: PublicProfileGateResult,
  hasViewSession: boolean,
): boolean {
  if (result.status !== "ready") return false;
  if (result.access === "open") return true;
  return hasViewSession;
}
