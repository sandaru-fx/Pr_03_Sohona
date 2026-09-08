import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import {
  authorizeManageSession,
  manageAuthErrorResponse,
} from "@/lib/manage-auth";
import { isMongoObjectId } from "@/lib/object-id";
import { prisma } from "@/lib/prisma";
import { isR2Configured } from "@/lib/r2-config";
import { getR2BucketName, getR2Client } from "@/lib/r2";
import { objectKeyBelongsToProfile } from "@/lib/r2-object-key";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * DELETE /api/manage/media/[id]
 * Remove media metadata and best-effort delete the private R2 object.
 */
export async function DELETE(request: Request, context: RouteContext) {
  const ipLimited = await enforceIpRateLimit(request, "manageIp");
  if (ipLimited) return ipLimited;

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
      originalName: true,
    },
  });

  if (!media) {
    return NextResponse.json(
      { error: "NotFound", message: "Media was not found." },
      { status: 404 },
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

  await prisma.mediaAsset.delete({ where: { id: media.id } });

  if (isR2Configured()) {
    try {
      await getR2Client().send(
        new DeleteObjectCommand({
          Bucket: getR2BucketName(),
          Key: media.r2ObjectKey,
        }),
      );
    } catch (error) {
      console.error("R2 DeleteObject failed after manage media delete", error);
    }
  }

  return NextResponse.json(
    {
      ok: true,
      deletedId: media.id,
      originalName: media.originalName,
      message: "Media removed from this memorial.",
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
