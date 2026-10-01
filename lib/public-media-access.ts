import type { MediaKind } from "@prisma/client";
import { isMongoObjectId } from "@/lib/object-id";
import { prisma } from "@/lib/prisma";
import { hasValidPublicViewSession } from "@/lib/public-view-session";
import { objectKeyBelongsToProfile } from "@/lib/r2-object-key";

export type PublicMediaAccessSuccess = {
  ok: true;
  media: {
    id: string;
    profileId: string;
    kind: MediaKind;
    r2ObjectKey: string;
    contentType: string;
    sizeBytes: number;
    originalName: string | null;
  };
  profile: {
    id: string;
    qrId: string;
    displayName: string;
    isPublicPinRequired: boolean;
  };
};

export type PublicMediaAccessFailure = {
  ok: false;
  status: number;
  error: string;
  message: string;
};

/**
 * Authorize issuing a short-lived signed media URL for the public memorial page.
 * Open profiles: allowed after setup complete.
 * PIN-required profiles: require a valid public view session for that qrId.
 */
export async function authorizePublicMediaAccess(
  mediaId: string,
): Promise<PublicMediaAccessSuccess | PublicMediaAccessFailure> {
  if (!isMongoObjectId(mediaId)) {
    return {
      ok: false,
      status: 400,
      error: "InvalidMediaId",
      message: "media id must be a valid id.",
    };
  }

  const media = await prisma.mediaAsset.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      profileId: true,
      kind: true,
      r2ObjectKey: true,
      contentType: true,
      sizeBytes: true,
      originalName: true,
      profile: {
        select: {
          id: true,
          qrId: true,
          displayName: true,
          isSetupComplete: true,
          isPublicPinRequired: true,
        },
      },
    },
  });

  if (!media || !media.profile.isSetupComplete) {
    return {
      ok: false,
      status: 404,
      error: "NotFound",
      message: "Media was not found.",
    };
  }

  if (
    !objectKeyBelongsToProfile(
      media.r2ObjectKey,
      media.profileId,
      media.kind,
    )
  ) {
    return {
      ok: false,
      status: 400,
      error: "InvalidObjectKey",
      message: "Media object key does not belong to this profile.",
    };
  }

  if (media.profile.isPublicPinRequired) {
    const allowed = await hasValidPublicViewSession(media.profile.qrId);
    if (!allowed) {
      return {
        ok: false,
        status: 401,
        error: "PinSessionRequired",
        message: "Enter the memorial PIN before viewing media.",
      };
    }
  }

  return {
    ok: true,
    media: {
      id: media.id,
      profileId: media.profileId,
      kind: media.kind,
      r2ObjectKey: media.r2ObjectKey,
      contentType: media.contentType,
      sizeBytes: media.sizeBytes,
      originalName: media.originalName,
    },
    profile: {
      id: media.profile.id,
      qrId: media.profile.qrId,
      displayName: media.profile.displayName,
      isPublicPinRequired: media.profile.isPublicPinRequired,
    },
  };
}
