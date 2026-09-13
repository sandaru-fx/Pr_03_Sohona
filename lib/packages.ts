/**
 * Package catalog — limits are identical across all tiers.
 */

export type PackageCommentSlotRule = {
  /** 1-based inclusive index range within the memorial's comment list. */
  fromIndex: number;
  toIndex: number;
  maxWords: number;
};

export type PackageLimits = {
  maxImages: number;
  maxVideoSeconds: number;
  maxAudioSeconds: number;
  maxStatementWords: number;
  maxComments: number;
  commentSlots: PackageCommentSlotRule[];
};

/** Shared limits for all dynamic packages. */
export const SHARED_PACKAGE_LIMITS: PackageLimits = {
  maxImages: 5,
  maxVideoSeconds: 60,
  maxAudioSeconds: 120,
  maxStatementWords: 500,
  maxComments: 10,
  commentSlots: [
    { fromIndex: 1, toIndex: 5, maxWords: 100 },
    { fromIndex: 6, toIndex: 10, maxWords: 150 },
  ],
};

export function getPackageLimits(): PackageLimits {
  return SHARED_PACKAGE_LIMITS;
}

/** Max words allowed for the Nth comment (1-based). Null if over maxComments. */
export function getCommentMaxWordsForIndex(
): number | null {
  const { maxComments, commentSlots } = SHARED_PACKAGE_LIMITS;
  if (oneBasedIndex < 1 || oneBasedIndex > maxComments) return null;
  const slot = commentSlots.find(
    (rule) => oneBasedIndex >= rule.fromIndex && oneBasedIndex <= rule.toIndex,
  );
  return slot?.maxWords ?? null;
}

/**
 * Retention window starts when family setup completes.
 */
export function computePackageWindow(
  startedAt: Date,
  retentionYears: number,
): { packageStartedAt: Date; packageEndsAt: Date; retentionYears: number } {
  const packageStartedAt = new Date(startedAt);
  const packageEndsAt = new Date(startedAt);
  packageEndsAt.setFullYear(packageEndsAt.getFullYear() + retentionYears);
  return { packageStartedAt, packageEndsAt, retentionYears };
}
