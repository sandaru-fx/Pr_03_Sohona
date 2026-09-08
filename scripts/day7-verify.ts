import { HeadBucketCommand } from "@aws-sdk/client-s3";
import {
  ADMIN_PROFILE_FORBIDDEN_FIELDS,
  adminProfileSelect,
} from "../lib/admin-profiles";
import { authorizePublicMediaAccess } from "../lib/public-media-access";
import {
  PUBLIC_MEDIA_URL_FORBIDDEN_FIELDS,
  PUBLIC_MEDIA_URL_MEDIA_FIELDS,
  toPublicMediaUrlMedia,
} from "../lib/public-media-response";
import {
  PUBLIC_CONTENT_FORBIDDEN_FIELDS,
  PUBLIC_MEDIA_META_SELECT,
} from "../lib/public-profile";
import { getR2BucketName, getR2Client } from "../lib/r2";
import { isR2Configured, requireR2Config } from "../lib/r2-config";
import { buildR2ObjectKey } from "../lib/r2-object-key";
import {
  assertSignableR2ObjectKey,
  clampSignedGetExpiresIn,
  R2_SIGNED_GET_EXPIRES_IN_SECONDS,
  R2_SIGNED_GET_MAX_EXPIRES_IN_SECONDS,
  R2_SIGNED_GET_MIN_EXPIRES_IN_SECONDS,
} from "../lib/r2-signed-get";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function runOfflineChecks() {
  assert(
    R2_SIGNED_GET_EXPIRES_IN_SECONDS === 90,
    "default signed GET TTL must stay 90s until reviewed",
  );
  assert(
    R2_SIGNED_GET_MIN_EXPIRES_IN_SECONDS === 30,
    "min signed GET TTL must stay 30s",
  );
  assert(
    R2_SIGNED_GET_MAX_EXPIRES_IN_SECONDS === 300,
    "max signed GET TTL must stay 300s",
  );
  assert(clampSignedGetExpiresIn(10) === 30, "TTL below min must clamp to 30");
  assert(clampSignedGetExpiresIn(999) === 300, "TTL above max must clamp to 300");
  assert(clampSignedGetExpiresIn(90) === 90, "default TTL must pass through");
  assert(
    clampSignedGetExpiresIn(Number.NaN) === 90,
    "NaN TTL must fall back to default",
  );

  const profileId = "507f1f77bcf86cd799439011";
  const key = buildR2ObjectKey({
    profileId,
    kind: "PHOTO",
    fileName: "family.jpg",
    now: new Date("2026-09-08T00:00:00.000Z"),
  });
  assert(
    assertSignableR2ObjectKey(key) === key,
    "app-managed key must be signable",
  );

  let threw = false;
  try {
    assertSignableR2ObjectKey("../etc/passwd");
  } catch {
    threw = true;
  }
  assert(threw, "path traversal key must be rejected");

  threw = false;
  try {
    assertSignableR2ObjectKey("public/not-managed.jpg");
  } catch {
    threw = true;
  }
  assert(threw, "non app-managed key must be rejected");

  for (const field of PUBLIC_MEDIA_URL_FORBIDDEN_FIELDS) {
    assert(
      !(PUBLIC_MEDIA_URL_MEDIA_FIELDS as readonly string[]).includes(field),
      `public media URL response must not include ${field}`,
    );
  }

  const safeMedia = toPublicMediaUrlMedia({
    id: profileId,
    kind: "PHOTO",
    contentType: "image/jpeg",
    sizeBytes: 1234,
    originalName: "family.jpg",
  });
  assert(
    !("r2ObjectKey" in safeMedia),
    "toPublicMediaUrlMedia must strip r2ObjectKey",
  );
  assert(
    Object.keys(safeMedia).sort().join(",") ===
      [...PUBLIC_MEDIA_URL_MEDIA_FIELDS].sort().join(","),
    "public media URL media fields must match allow-list",
  );

  for (const field of PUBLIC_CONTENT_FORBIDDEN_FIELDS) {
    assert(
      !(field in PUBLIC_MEDIA_META_SELECT),
      `public memorial media meta must not include ${field}`,
    );
  }

  for (const field of ADMIN_PROFILE_FORBIDDEN_FIELDS) {
    assert(
      !(field in adminProfileSelect),
      `adminProfileSelect must not include forbidden field: ${field}`,
    );
  }

  return key;
}

async function runAuthNegativeChecks() {
  const badId = await authorizePublicMediaAccess("not-an-id");
  assert(!badId.ok, "invalid media id must fail");
  assert(badId.status === 400, "invalid media id should be 400");

  const missing = await authorizePublicMediaAccess("507f1f77bcf86cd799439099");
  assert(!missing.ok, "unknown media id must fail");
  assert(missing.status === 404, "unknown media id should be 404");
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

  const probeKey =
    "profiles/507f1f77bcf86cd799439011/PHOTO/2026/09/day7-privacy-probe.bin";
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
    defaultExpiresIn: R2_SIGNED_GET_EXPIRES_IN_SECONDS,
  };
}

async function main() {
  const sampleKey = runOfflineChecks();
  await runAuthNegativeChecks();
  const live = await runLiveR2PrivacyChecks();

  console.log("Day 7 Phase 7.4 verification passed.");
  console.log(
    JSON.stringify(
      {
        sampleKey,
        signedGetTtlSeconds: R2_SIGNED_GET_EXPIRES_IN_SECONDS,
        liveR2: live,
        publicMediaUrlFields: [...PUBLIC_MEDIA_URL_MEDIA_FIELDS],
        manualChecklist: [
          "Open /p/{qrId} with access → media lazy-loads signed URL",
          "PIN-required profile without session → /api/public/media/[id]/url = 401",
          "Response JSON must not include r2ObjectKey",
          "Signed URL expires (~90s) then player retries",
          "Raw/unsigned R2 URL in browser must NOT show the file",
          "Admin UI/API still must not browse private media bytes",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Day 7 privacy verification failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
