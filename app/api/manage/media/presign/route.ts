import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import {
  authorizeManageSession,
  manageAuthErrorResponse,
} from "@/lib/manage-auth";
import { validateUploadRequest } from "@/lib/media-rules";
import { isR2Configured } from "@/lib/r2-config";
import { getR2BucketName, getR2Client } from "@/lib/r2";
import { buildR2ObjectKey } from "@/lib/r2-object-key";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";
import { manageMediaPresignSchema } from "@/lib/validators/manage-media-presign";

export const runtime = "nodejs";

const PRESIGN_EXPIRES_IN_SECONDS = 10 * 60;

/**
 * POST /api/manage/media/presign
 * Manage-session auth → short-lived R2 PUT URL (private bucket).
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

  const parsed = manageMediaPresignSchema.safeParse(json);
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
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error) {
    console.error("Failed to create manage R2 presigned upload URL", error);
    return NextResponse.json(
      {
        error: "PresignFailed",
        message: "Could not create upload URL. Check R2 credentials/bucket.",
      },
      { status: 500 },
    );
  }
}
