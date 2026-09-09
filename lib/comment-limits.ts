import type { PackageTier } from "@prisma/client";
import {
  getCommentMaxWordsForIndex,
  getPackageLimits,
} from "@/lib/packages";
import { prisma } from "@/lib/prisma";
import { countWords } from "@/lib/word-count";

export type CommentQuota = {
  used: number;
  max: number;
  /** Max words allowed for the next new comment, or null if full. */
  nextMaxWords: number | null;
};

export type CommentLimitResult =
  | { ok: true; wordCount: number; nextIndex: number; maxWords: number }
  | { ok: false; error: string; message: string };

export async function getCommentQuota(
  profileId: string,
  tier: PackageTier,
): Promise<CommentQuota> {
  const { maxComments } = getPackageLimits(tier);
  const used = await prisma.comment.count({ where: { profileId } });
  const nextMaxWords =
    used >= maxComments
      ? null
      : getCommentMaxWordsForIndex(tier, used + 1);

  return { used, max: maxComments, nextMaxWords };
}

/**
 * Validate a new comment against package slot + word rules.
 * Counts all comments (VISIBLE + HIDDEN) toward the package max.
 */
export async function assertCanCreateComment(input: {
  profileId: string;
  tier: PackageTier;
  body: string;
}): Promise<CommentLimitResult> {
  const { maxComments } = getPackageLimits(input.tier);
  const used = await prisma.comment.count({
    where: { profileId: input.profileId },
  });

  if (used >= maxComments) {
    return {
      ok: false,
      error: "CommentLimit",
      message: `This memorial already has the maximum of ${maxComments} comments.`,
    };
  }

  const nextIndex = used + 1;
  const maxWords = getCommentMaxWordsForIndex(input.tier, nextIndex);
  if (maxWords === null) {
    return {
      ok: false,
      error: "CommentLimit",
      message: `This memorial already has the maximum of ${maxComments} comments.`,
    };
  }

  const wordCount = countWords(input.body);
  if (wordCount < 1) {
    return {
      ok: false,
      error: "EmptyComment",
      message: "Comment cannot be empty.",
    };
  }

  if (wordCount > maxWords) {
    return {
      ok: false,
      error: "CommentWordLimit",
      message: `This comment slot allows at most ${maxWords} words (Sinhala or English). Yours has ${wordCount}.`,
    };
  }

  return { ok: true, wordCount, nextIndex, maxWords };
}
