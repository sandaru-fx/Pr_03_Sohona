import type { MediaKind, PackageTier } from "@prisma/client";
import { getPackageLimits } from "@/lib/packages";
import { prisma } from "@/lib/prisma";
import { totalStatementWords } from "@/lib/word-count";

export type LimitCheckResult =
  | { ok: true }
  | { ok: false; error: string; message: string };

export function assertStatementWordLimit(
  tier: PackageTier,
  statements: Array<{ body: string }>,
): LimitCheckResult & { usedWords?: number; maxWords?: number } {
  const { maxStatementWords } = getPackageLimits();
  const usedWords = totalStatementWords(statements);
  if (usedWords > maxStatementWords) {
    return {
      ok: false,
      error: "StatementWordLimit",
      message: `Statements total ${usedWords} words; package limit is ${maxStatementWords} words (Sinhala or English).`,
      usedWords,
      maxWords: maxStatementWords,
    };
  }
  return { ok: true, usedWords, maxWords: maxStatementWords };
}

/** Pure photo-count check (no DB) — used by APIs + Step 5 verify. */
export function assertPhotoCountWithinLimit(
  photoCount: number,
  maxImages: number,
): LimitCheckResult {
  if (photoCount >= maxImages) {
    return {
      ok: false,
      error: "PhotoLimit",
      message: `This package allows at most ${maxImages} images.`,
    };
  }
  return { ok: true };
}

/** Pure VIDEO/VOICE duration check (no DB). */
export function assertAvDurationWithinLimit(input: {
  kind: Extract<MediaKind, "VIDEO" | "VOICE">;
  durationSeconds: number | null | undefined;
  maxSeconds: number;
}): LimitCheckResult {
  const duration = input.durationSeconds;

  if (
    typeof duration !== "number" ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return {
      ok: false,
      error: "DurationRequired",
      message: `${input.kind} uploads must include a positive durationSeconds value.`,
    };
  }

  const rounded = Math.ceil(duration);
  if (rounded > input.maxSeconds) {
    const label = input.kind === "VIDEO" ? "video" : "audio";
    const minutes = Math.round(input.maxSeconds / 60);
    return {
      ok: false,
      error: "DurationLimit",
      message: `This package allows ${label} up to ${minutes} minute${minutes === 1 ? "" : "s"} (${input.maxSeconds}s). This file is about ${rounded}s.`,
    };
  }

  return { ok: true };
}

/**
 * Enforce package media rules before saving a new MediaAsset.
 * Photos: max count. Video/voice: duration seconds.
 */
export async function assertMediaUploadAllowed(input: {
  profileId: string;
  tier: PackageTier;
  kind: MediaKind;
  durationSeconds?: number | null;
}): Promise<LimitCheckResult> {
  const limits = getPackageLimits();

  if (input.kind === "PHOTO") {
    const photoCount = await prisma.mediaAsset.count({
      where: { profileId: input.profileId, kind: "PHOTO" },
    });
    return assertPhotoCountWithinLimit(photoCount, limits.maxImages);
  }

  const maxSeconds =
    input.kind === "VIDEO" ? limits.maxVideoSeconds : limits.maxAudioSeconds;

  return assertAvDurationWithinLimit({
    kind: input.kind,
    durationSeconds: input.durationSeconds,
    maxSeconds,
  });
}
