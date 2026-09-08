import { randomUUID } from "crypto";
import type { MediaKind } from "@prisma/client";
import { isMongoObjectId } from "@/lib/object-id";
import { sanitizeFileName } from "@/lib/media-rules";

export type BuildObjectKeyInput = {
  profileId: string;
  kind: MediaKind;
  fileName: string;
  now?: Date;
};

/**
 * Private R2 object key convention:
 * profiles/{profileId}/{KIND}/{yyyy}/{mm}/{uuid}-{safeFileName}
 *
 * Never store or return a permanent public URL for these keys.
 */
export function buildR2ObjectKey(input: BuildObjectKeyInput): string {
  if (!isMongoObjectId(input.profileId)) {
    throw new Error("profileId must be a valid Mongo ObjectId.");
  }

  const now = input.now ?? new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName = sanitizeFileName(input.fileName);
  const id = randomUUID();

  return `profiles/${input.profileId}/${input.kind}/${yyyy}/${mm}/${id}-${safeName}`;
}

/** Quick shape check for keys created by this app. */
export function isAppManagedR2ObjectKey(key: string): boolean {
  return /^profiles\/[a-f\d]{24}\/(PHOTO|VIDEO|VOICE)\/\d{4}\/\d{2}\/[0-9a-f-]+-/i.test(
    key,
  );
}

/** Ensure the key is under the expected profile + kind prefix. */
export function objectKeyBelongsToProfile(
  key: string,
  profileId: string,
  kind: MediaKind,
): boolean {
  if (!isMongoObjectId(profileId)) return false;
  if (!isAppManagedR2ObjectKey(key)) return false;
  return key.startsWith(`profiles/${profileId}/${kind}/`);
}
