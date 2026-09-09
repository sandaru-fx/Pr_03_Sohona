import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  authorizeManageSession,
  manageAuthErrorResponse,
} from "@/lib/manage-auth";
import { MANAGE_MEDIA_SELECT } from "@/lib/manage-content";
import { validateUploadRequest } from "@/lib/media-rules";
import { assertMediaUploadAllowed } from "@/lib/package-limits";
import { prisma } from "@/lib/prisma";
import { isR2Configured } from "@/lib/r2-config";
import { getR2BucketName, getR2Client } from "@/lib/r2";
import { objectKeyBelongsToProfile } from "@/lib/r2-object-key";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";
import { manageMediaConfirmSchema } from "@/lib/validators/manage-media-confirm";

export const runtime = "nodejs";

/**
 * POST /api/manage/media/confirm
 * After direct R2 upload during manage: verify object, save MediaAsset metadata.
 */
export async function POST(request: Request) {
  const ipLimited = await enforceIpRateLimit(request, "manageIp");
  if (ipLimited) return ipLimited;

  if (!isR2Configured()) {
    return NextResponse.json(
      {
        error: "R2NotConfigured",
        message:
          "Cloudflare R2 is not configured. Set R2_* vars in `.env` and run `npm run r2:check`.",
      },
      { status: 503 },
    );
  }

  const auth = await authorizeManageSession();
  if (!auth.ok) return manageAuthErrorResponse(auth);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "InvalidJSON", message: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const parsed = manageMediaConfirmSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "ValidationError",
        message: "Invalid confirm request.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const uploadCheck = validateUploadRequest({
    kind: parsed.data.kind,
    contentType: parsed.data.contentType,
    sizeBytes: parsed.data.sizeBytes,
    fileName: parsed.data.fileName,
  });

  if (!uploadCheck.ok) {
    return NextResponse.json(
      { error: uploadCheck.error, message: uploadCheck.message },
      { status: 400 },
    );
  }

  const durationSeconds =
    uploadCheck.kind === "PHOTO"
      ? null
      : Math.ceil(parsed.data.durationSeconds as number);

  const limitCheck = await assertMediaUploadAllowed({
    profileId: auth.profile.id,
    tier: auth.profile.packageTier,
    kind: uploadCheck.kind,
    durationSeconds,
  });
  if (!limitCheck.ok) {
    return NextResponse.json(
      { error: limitCheck.error, message: limitCheck.message },
      { status: 400 },
    );
  }

  const r2ObjectKey = parsed.data.r2ObjectKey.trim();
  if (
    !objectKeyBelongsToProfile(r2ObjectKey, auth.profile.id, uploadCheck.kind)
  ) {
    return NextResponse.json(
      {
        error: "InvalidObjectKey",
        message: "r2ObjectKey does not belong to this profile/kind.",
      },
      { status: 400 },
    );
  }

  try {
    const head = await getR2Client().send(
      new HeadObjectCommand({
        Bucket: getR2BucketName(),
        Key: r2ObjectKey,
      }),
    );

    if (
      typeof head.ContentLength === "number" &&
      head.ContentLength > 0 &&
      head.ContentLength !== uploadCheck.sizeBytes
    ) {
      return NextResponse.json(
        {
          error: "SizeMismatch",
          message: "Uploaded object size does not match the declared sizeBytes.",
        },
        { status: 400 },
      );
    }

    if (
      head.ContentType &&
      head.ContentType.split(";")[0]?.trim().toLowerCase() !==
        uploadCheck.contentType
    ) {
      return NextResponse.json(
        {
          error: "ContentTypeMismatch",
          message:
            "Uploaded object content type does not match the declared contentType.",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("R2 HeadObject failed during manage media confirm", error);
    return NextResponse.json(
      {
        error: "ObjectNotFound",
        message:
          "Upload was not found in private storage. Presign + PUT to R2 first.",
      },
      { status: 404 },
    );
  }

  try {
    const media = await prisma.mediaAsset.create({
      data: {
        profileId: auth.profile.id,
        kind: uploadCheck.kind,
        r2ObjectKey,
        contentType: uploadCheck.contentType,
        sizeBytes: uploadCheck.sizeBytes,
        durationSeconds,
        originalName: uploadCheck.fileName,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
      select: MANAGE_MEDIA_SELECT,
    });

    return NextResponse.json(
      { media },
      {
        status: 201,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "DuplicateObjectKey",
          message: "This r2ObjectKey is already registered.",
        },
        { status: 409 },
      );
    }

    console.error("Failed to confirm manage media asset", error);
    return NextResponse.json(
      { error: "ServerError", message: "Could not save media metadata." },
      { status: 500 },
    );
  }
}
