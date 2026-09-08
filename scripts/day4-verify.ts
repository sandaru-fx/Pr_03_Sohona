import { HeadBucketCommand } from "@aws-sdk/client-s3";
import {
  buildR2ObjectKey,
  isAppManagedR2ObjectKey,
  objectKeyBelongsToProfile,
} from "../lib/r2-object-key";
import { MEDIA_RULES, validateUploadRequest } from "../lib/media-rules";
import { isR2Configured, requireR2Config } from "../lib/r2-config";
import { getR2BucketName, getR2Client } from "../lib/r2";
import { mediaConfirmSchema } from "../lib/validators/media-confirm";
import { mediaPresignSchema } from "../lib/validators/media-presign";
import { authorizeSetupToken } from "../lib/setup-auth";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function runValidationAndKeyChecks() {
  const profileId = "507f1f77bcf86cd799439011";
  const otherProfileId = "507f1f77bcf86cd799439012";

  const okPhoto = validateUploadRequest({
    kind: "PHOTO",
    contentType: "image/jpeg",
    sizeBytes: 1_000_000,
    fileName: "../../evil.jpg",
  });
  assert(okPhoto.ok, "valid photo should pass");
  if (okPhoto.ok) {
    assert(okPhoto.fileName === "evil.jpg", "path traversal must be stripped");
  }

  const tooBig = validateUploadRequest({
    kind: "PHOTO",
    contentType: "image/jpeg",
    sizeBytes: MEDIA_RULES.PHOTO.maxBytes + 1,
    fileName: "big.jpg",
  });
  assert(!tooBig.ok && tooBig.error === "FileTooLarge", "oversized photo rejected");

  const badMime = validateUploadRequest({
    kind: "VIDEO",
    contentType: "application/pdf",
    sizeBytes: 1000,
    fileName: "clip.mp4",
  });
  assert(!badMime.ok && badMime.error === "InvalidContentType", "bad mime rejected");

  const badExt = validateUploadRequest({
    kind: "VOICE",
    contentType: "audio/mpeg",
    sizeBytes: 1000,
    fileName: "note.exe",
  });
  assert(!badExt.ok && badExt.error === "InvalidExtension", "bad extension rejected");

  const key = buildR2ObjectKey({
    profileId,
    kind: "PHOTO",
    fileName: "Family Photo (1).JPG",
    now: new Date("2026-09-08T00:00:00.000Z"),
  });

  assert(key.startsWith(`profiles/${profileId}/PHOTO/2026/09/`), "key prefix wrong");
  assert(isAppManagedR2ObjectKey(key), "generated key should match app pattern");
  assert(objectKeyBelongsToProfile(key, profileId, "PHOTO"), "owner profile should match");
  assert(
    !objectKeyBelongsToProfile(key, otherProfileId, "PHOTO"),
    "cross-profile key ownership must fail",
  );
  assert(
    !objectKeyBelongsToProfile(key, profileId, "VIDEO"),
    "cross-kind key ownership must fail",
  );
  assert(!key.includes(".."), "object key must not contain path traversal");

  let threw = false;
  try {
    buildR2ObjectKey({
      profileId: "not-valid",
      kind: "PHOTO",
      fileName: "a.jpg",
    });
  } catch {
    threw = true;
  }
  assert(threw, "invalid profileId must throw");

  const badPresign = mediaPresignSchema.safeParse({
    profileId,
    setupToken: "",
    kind: "PHOTO",
    contentType: "image/jpeg",
    sizeBytes: 100,
    fileName: "a.jpg",
  });
  assert(!badPresign.success, "empty setupToken must fail zod validation");

  const badConfirm = mediaConfirmSchema.safeParse({
    profileId,
    setupToken: "token",
    kind: "PHOTO",
    contentType: "image/jpeg",
    sizeBytes: 100,
    fileName: "a.jpg",
    // missing r2ObjectKey
  });
  assert(!badConfirm.success, "confirm without r2ObjectKey must fail");

  return key;
}

async function runAuthNegativeChecks() {
  const denied = await authorizeSetupToken({
    profileId: "507f1f77bcf86cd799439011",
    setupToken: "definitely-not-a-real-setup-token",
  });
  assert(!denied.ok, "bogus setup token must be rejected");
  assert(denied.status === 401, "bogus setup token should be 401");

  const badId = await authorizeSetupToken({
    profileId: "not-an-object-id",
    setupToken: "x",
  });
  assert(!badId.ok && badId.status === 400, "invalid profile id must be 400");
}

async function runLiveR2PrivacyChecks() {
  if (!isR2Configured()) {
    return {
      skipped: true as const,
      reason: "R2 env not configured — live unsigned-access check skipped",
    };
  }

  const config = requireR2Config();
  const client = getR2Client();
  const bucket = getR2BucketName();

  await client.send(new HeadBucketCommand({ Bucket: bucket }));

  // Unsigned fetch against the S3 API endpoint should not grant public read.
  const probeKey = `profiles/507f1f77bcf86cd799439011/PHOTO/2026/09/privacy-probe.bin`;
  const unsignedUrl = `${config.endpoint}/${bucket}/${probeKey}`;
  const response = await fetch(unsignedUrl, { method: "GET" });

  assert(
    response.status === 401 ||
      response.status === 403 ||
      response.status === 404 ||
      response.status === 400,
    `unsigned R2 GET should not succeed; got ${response.status}`,
  );
  assert(!response.ok, "unsigned R2 object GET must not be publicly readable");

  return {
    skipped: false as const,
    unsignedStatus: response.status,
    unsignedUrlHost: new URL(unsignedUrl).host,
    bucket,
  };
}

async function main() {
  const sampleKey = runValidationAndKeyChecks();
  await runAuthNegativeChecks();
  const live = await runLiveR2PrivacyChecks();

  console.log("Day 4 Phase 4.5 privacy verification passed.");
  console.log(
    JSON.stringify(
      {
        sampleKey,
        liveR2: live,
        manualChecklist: [
          "Create profile in admin → copy setup token once",
          "POST /api/media/presign without token → 401",
          "POST /api/media/presign with bad mime/size → 400",
          "PUT file to uploadUrl → R2 private object stored",
          "POST /api/media/confirm → MediaAsset row with r2ObjectKey only",
          "Open raw R2 URL in browser → should NOT show the file",
          "Admin UI still must not list/read private media bytes",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Day 4 privacy verification failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
