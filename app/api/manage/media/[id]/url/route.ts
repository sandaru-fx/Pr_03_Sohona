import { NextResponse } from "next/server";
import {
  authorizeManageSession,
  manageAuthErrorResponse,
} from "@/lib/manage-auth";
import { isMongoObjectId } from "@/lib/object-id";
import { prisma } from "@/lib/prisma";
import { toPublicMediaUrlMedia } from "@/lib/public-media-response";
import { isR2Configured } from "@/lib/r2-config";
import {
  getSignedR2GetUrl,
  R2_SIGNED_GET_EXPIRES_IN_SECONDS,
} from "@/lib/r2-signed-get";
import { objectKeyBelongsToProfile } from "@/lib/r2-object-key";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";
import { securityEventRequestFields } from "@/lib/request-identity";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/manage/media/[id]/url
 * Issue a short-lived signed R2 GET URL for owner preview during manage.
 */
export async function GET(request: Request, context: RouteContext) {
  const ipLimited = await enforceIpRateLimit(request, "mediaUrlIp");
  if (ipLimited) return ipLimited;

  if (!isR2Configured()) {
    return NextResponse.json(
      {
        error: "R2NotConfigured",
        message:
          "Media storage is not connected yet. Statements still work; media preview needs R2.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  const auth = await authorizeManageSession();
  if (!auth.ok) return manageAuthErrorResponse(auth);

  const { id } = await context.params;
  if (!isMongoObjectId(id)) {
    return NextResponse.json(
      { error: "InvalidMediaId", message: "media id must be a valid id." },
      { status: 400 },
    );
  }

  const media = await prisma.mediaAsset.findFirst({
    where: { id, profileId: auth.profile.id },
    select: {
      id: true,
      profileId: true,
      kind: true,
      r2ObjectKey: true,
      contentType: true,
      sizeBytes: true,
      originalName: true,
    },
  });

  if (!media) {
    return NextResponse.json(
      { error: "NotFound", message: "Media was not found." },
      {
        status: 404,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  if (
    !objectKeyBelongsToProfile(media.r2ObjectKey, media.profileId, media.kind)
  ) {
    return NextResponse.json(
      {
        error: "InvalidObjectKey",
        message: "Media object key does not belong to this profile.",
      },
      { status: 400 },
    );
  }

  try {
    const signed = await getSignedR2GetUrl({
      r2ObjectKey: media.r2ObjectKey,
      expiresIn: R2_SIGNED_GET_EXPIRES_IN_SECONDS,
    });

    await prisma.securityEvent.create({
      data: {
        profileId: auth.profile.id,
        type: "MEDIA_SIGNED_URL_ISSUED",
        ...securityEventRequestFields(request),
        metadata: {
          source: "manage",
          mediaId: media.id,
          kind: media.kind,
          expiresIn: signed.expiresIn,
        },
      },
    });

    return NextResponse.json(
      {
        url: signed.url,
        expiresIn: signed.expiresIn,
        media: toPublicMediaUrlMedia(media),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error) {
    console.error("Failed to issue manage media signed URL", error);
    return NextResponse.json(
      {
        error: "SignFailed",
        message: "Could not create a media preview URL.",
      },
      { status: 500 },
    );
  }
}
