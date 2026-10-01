import type { MediaKind } from "@prisma/client";

/** Fields returned to the browser with a signed media URL — never include r2ObjectKey. */
export const PUBLIC_MEDIA_URL_MEDIA_FIELDS = [
  "id",
  "kind",
  "contentType",
  "sizeBytes",
  "originalName",
] as const;

export const PUBLIC_MEDIA_URL_FORBIDDEN_FIELDS = [
  "r2ObjectKey",
  "profileId",
  "hashedPin",
  "setupTokenHash",
  "manageTokenHash",
] as const;

export type PublicMediaUrlMedia = {
  id: string;
  kind: MediaKind;
  contentType: string;
  sizeBytes: number;
  originalName: string | null;
};

export function toPublicMediaUrlMedia(input: {
  id: string;
  kind: MediaKind;
  contentType: string;
  sizeBytes: number;
  originalName: string | null;
}): PublicMediaUrlMedia {
  return {
    id: input.id,
    kind: input.kind,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    originalName: input.originalName,
  };
}
