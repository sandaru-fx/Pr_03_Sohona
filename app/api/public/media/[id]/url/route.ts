import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizePublicMediaAccess } from "@/lib/public-media-access";
import { toPublicMediaUrlMedia } from "@/lib/public-media-response";
import { isR2Configured } from "@/lib/r2-config";
import {
  getSignedR2GetUrl,
  R2_SIGNED_GET_EXPIRES_IN_SECONDS,
} from "@/lib/r2-signed-get";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/public/media/[id]/url
 * After public memorial access is granted, issue a short-lived signed R2 GET URL.
 * Never returns r2ObjectKey to the client.
 */
export async function GET(_request: Request, context: RouteContext) {
  if (!isR2Configured()) {
    return NextResponse.json(
      {
        error: "R2NotConfigured",
        message:
          "Media storage is not connected yet. Statements still work; media playback needs R2.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  const { id } = await context.params;
  const auth = await authorizePublicMediaAccess(id);

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error, message: auth.message },
      {
        status: auth.status,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  try {
    const signed = await getSignedR2GetUrl({
      r2ObjectKey: auth.media.r2ObjectKey,
      expiresIn: R2_SIGNED_GET_EXPIRES_IN_SECONDS,
    });

    await prisma.securityEvent.create({
      data: {
        profileId: auth.profile.id,
        type: "MEDIA_SIGNED_URL_ISSUED",
        metadata: {
          source: "public_view",
          mediaId: auth.media.id,
          kind: auth.media.kind,
          expiresIn: signed.expiresIn,
        },
      },
    });

    return NextResponse.json(
      {
        url: signed.url,
        expiresIn: signed.expiresIn,
        media: toPublicMediaUrlMedia(auth.media),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error) {
    console.error("Failed to create signed media GET URL", error);
    return NextResponse.json(
      {
        error: "SignFailed",
        message: "Could not create a media view link. Please try again.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }
}
