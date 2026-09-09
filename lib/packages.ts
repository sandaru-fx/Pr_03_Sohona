import type { PackageTier } from "@prisma/client";

/**
 * Package catalog — single source of truth for A / B / C.
 * Content limits are identical; retention years differ.
 */

export const PACKAGE_TIERS = ["A", "B", "C"] as const;

export type PackageTierId = (typeof PACKAGE_TIERS)[number];

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

export type PackageDefinition = {
  tier: PackageTierId;
  retentionYears: number;
  label: string;
  limits: PackageLimits;
};

/** Shared limits for A / B / C (client-approved). */
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

export const PACKAGE_CATALOG: Record<PackageTierId, PackageDefinition> = {
  A: {
    tier: "A",
    retentionYears: 25,
    label: "Package A · 25 years",
    limits: SHARED_PACKAGE_LIMITS,
  },
  B: {
    tier: "B",
    retentionYears: 50,
    label: "Package B · 50 years",
    limits: SHARED_PACKAGE_LIMITS,
  },
  C: {
    tier: "C",
    retentionYears: 100,
    label: "Package C · 100 years",
    limits: SHARED_PACKAGE_LIMITS,
  },
};

export function isPackageTier(value: string): value is PackageTierId {
  return (PACKAGE_TIERS as readonly string[]).includes(value);
}

export function getPackageDefinition(
  tier: PackageTier | PackageTierId,
): PackageDefinition {
  return PACKAGE_CATALOG[tier as PackageTierId];
}

export function getPackageLimits(
  tier: PackageTier | PackageTierId,
): PackageLimits {
  return getPackageDefinition(tier).limits;
}

/** Max words allowed for the Nth comment (1-based). Null if over maxComments. */
export function getCommentMaxWordsForIndex(
  tier: PackageTier | PackageTierId,
  oneBasedIndex: number,
): number | null {
  const { maxComments, commentSlots } = getPackageLimits(tier);
  if (oneBasedIndex < 1 || oneBasedIndex > maxComments) return null;
  const slot = commentSlots.find(
    (rule) => oneBasedIndex >= rule.fromIndex && oneBasedIndex <= rule.toIndex,
  );
  return slot?.maxWords ?? null;
}

/**
 * Retention window starts when family setup completes (Step 1 default).
 */
export function computePackageWindow(
  startedAt: Date,
  tier: PackageTier | PackageTierId,
): { packageStartedAt: Date; packageEndsAt: Date; retentionYears: number } {
  const { retentionYears } = getPackageDefinition(tier);
  const packageStartedAt = new Date(startedAt);
  const packageEndsAt = new Date(startedAt);
  packageEndsAt.setFullYear(packageEndsAt.getFullYear() + retentionYears);
  return { packageStartedAt, packageEndsAt, retentionYears };
}
