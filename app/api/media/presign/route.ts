import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { validateUploadRequest } from "@/lib/media-rules";
import { assertMediaUploadAllowed } from "@/lib/package-limits";
import { isR2Configured } from "@/lib/r2-config";
import { getR2BucketName, getR2Client } from "@/lib/r2";
import { buildR2ObjectKey } from "@/lib/r2-object-key";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";
import { authorizeSetupToken } from "@/lib/setup-auth";
import { mediaPresignSchema } from "@/lib/validators/media-presign";

export const runtime = "nodejs";

const PRESIGN_EXPIRES_IN_SECONDS = 10 * 60; // 10 minutes

/**
 * POST /api/media/presign
 * Family setup-token auth → short-lived R2 PUT URL (private bucket).
 * File bytes never pass through the Next.js server.
 */
export async function POST(request: Request) {
  const ipLimited = await enforceIpRateLimit(request, "setupIp");
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

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "InvalidJSON", message: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const parsed = mediaPresignSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "ValidationError",
        message: "Invalid upload request.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const auth = await authorizeSetupToken({
    profileId: parsed.data.profileId,
    setupToken: parsed.data.setupToken,
    request,
  });

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error, message: auth.message },
      { status: auth.status },
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

  if (uploadCheck.kind === "PHOTO") {
    const photoLimit = await assertMediaUploadAllowed({
      profileId: auth.profile.id,
      tier: auth.profile.packageTier,
      kind: "PHOTO",
    });
    if (!photoLimit.ok) {
      return NextResponse.json(
        { error: photoLimit.error, message: photoLimit.message },
        { status: 400 },
      );
    }
  }

  const r2ObjectKey = buildR2ObjectKey({
    profileId: auth.profile.id,
    kind: uploadCheck.kind,
    fileName: uploadCheck.fileName,
  });

  try {
    const client = getR2Client();
    const bucket = getR2BucketName();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: r2ObjectKey,
      ContentType: uploadCheck.contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: PRESIGN_EXPIRES_IN_SECONDS,
    });

    return NextResponse.json(
      {
        uploadUrl,
        r2ObjectKey,
        method: "PUT",
        headers: {
          "Content-Type": uploadCheck.contentType,
        },
        expiresIn: PRESIGN_EXPIRES_IN_SECONDS,
        media: {
          kind: uploadCheck.kind,
          contentType: uploadCheck.contentType,
          sizeBytes: uploadCheck.sizeBytes,
          fileName: uploadCheck.fileName,
        },
        note: "Upload the file bytes directly to uploadUrl. Then confirm via Phase 4.4.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error) {
    console.error("Failed to create R2 presigned upload URL", error);
    return NextResponse.json(
      {
        error: "PresignFailed",
        message: "Could not create upload URL. Check R2 credentials/bucket.",
      },
      { status: 500 },
    );
  }
}
