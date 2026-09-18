import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  authorizeManageSession,
  manageAuthErrorResponse,
} from "@/lib/manage-auth";
import { validateUploadRequest } from "@/lib/media-rules";
import { assertMediaUploadAllowed } from "@/lib/package-limits";
import { prisma } from "@/lib/prisma";
import { isR2Configured } from "@/lib/r2-config";
import { getR2BucketName, getR2Client } from "@/lib/r2";
import { buildR2ObjectKey } from "@/lib/r2-object-key";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";

export const runtime = "nodejs";

/**
 * POST /api/manage/media/upload
 * Server-side proxy upload for manage flow: file goes Browser → Next.js → R2.
 * Eliminates CORS issues with direct-to-R2 presigned uploads.
 * Accepts multipart/form-data with fields: kind, file, durationSeconds (optional).
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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "InvalidForm", message: "Request must be multipart/form-data." },
      { status: 400 },
    );
  }

  const kind = formData.get("kind");
  const file = formData.get("file");
  const durationSecondsRaw = formData.get("durationSeconds");

  if (typeof kind !== "string" || !(file instanceof File)) {
    return NextResponse.json(
      {
        error: "MissingFields",
        message: "kind (string) and file (File) are required.",
      },
      { status: 400 },
    );
  }

  const uploadCheck = validateUploadRequest({
    kind,
    contentType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    fileName: file.name,
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
      : durationSecondsRaw
        ? Math.ceil(Number(durationSecondsRaw))
        : null;

  const limitCheck = await assertMediaUploadAllowed({
    profileId: auth.profile.id,
    kind: uploadCheck.kind,
    durationSeconds,
  });
  if (!limitCheck.ok) {
    return NextResponse.json(
      { error: limitCheck.error, message: limitCheck.message },
      { status: 400 },
    );
  }

  const r2ObjectKey = buildR2ObjectKey({
    profileId: auth.profile.id,
    kind: uploadCheck.kind,
    fileName: uploadCheck.fileName,
  });

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const client = getR2Client();
    const bucket = getR2BucketName();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: r2ObjectKey,
        Body: fileBuffer,
        ContentType: uploadCheck.contentType,
      }),
    );
  } catch (error) {
    console.error("R2 PutObject failed during manage server-side upload", error);
    return NextResponse.json(
      {
        error: "UploadFailed",
        message: "Could not upload file to storage. Please try again.",
      },
      { status: 500 },
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
        sortOrder: 0,
      },
      select: {
        id: true,
        profileId: true,
        kind: true,
        contentType: true,
        sizeBytes: true,
        durationSeconds: true,
        originalName: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { media },
      { status: 201, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "DuplicateObjectKey", message: "This file is already registered." },
        { status: 409 },
      );
    }
    console.error("Failed to save manage media metadata after upload", error);
    return NextResponse.json(
      { error: "ServerError", message: "File uploaded but metadata save failed." },
      { status: 500 },
    );
  }
}
