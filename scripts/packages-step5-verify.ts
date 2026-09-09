import {
  ADMIN_PROFILE_FORBIDDEN_FIELDS,
  adminProfileSelect,
} from "../lib/admin-profiles";
import {
  assertAvDurationWithinLimit,
  assertPhotoCountWithinLimit,
  assertStatementWordLimit,
} from "../lib/package-limits";
import {
  computePackageWindow,
  getCommentMaxWordsForIndex,
  getPackageDefinition,
  PACKAGE_CATALOG,
  PACKAGE_TIERS,
  SHARED_PACKAGE_LIMITS,
} from "../lib/packages";
import {
  MANAGE_CONTENT_FORBIDDEN_FIELDS,
  MANAGE_MEDIA_SELECT,
  MANAGE_STATEMENT_SELECT,
} from "../lib/manage-content";
import {
  PUBLIC_CONTENT_FORBIDDEN_FIELDS,
  PUBLIC_MEDIA_META_SELECT,
  PUBLIC_STATEMENT_SELECT,
} from "../lib/public-profile";
import { RATE_LIMIT_PRESETS } from "../lib/rate-limit-presets";
import { manageMediaConfirmSchema } from "../lib/validators/manage-media-confirm";
import { mediaConfirmSchema } from "../lib/validators/media-confirm";
import { publicCommentSchema } from "../lib/validators/public-comment";
import { countWords } from "../lib/word-count";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function words(n: number) {
  return Array.from({ length: n }, (_, i) => `w${i}`).join(" ");
}

function main() {
  // --- Catalog lock ---
  assert(PACKAGE_CATALOG.A.retentionYears === 25, "A = 25y");
  assert(PACKAGE_CATALOG.B.retentionYears === 50, "B = 50y");
  assert(PACKAGE_CATALOG.C.retentionYears === 100, "C = 100y");
  for (const tier of PACKAGE_TIERS) {
    assert(
      getPackageDefinition(tier).limits === SHARED_PACKAGE_LIMITS,
      `${tier} must share identical limits`,
    );
  }

  const window = computePackageWindow(new Date("2026-01-01T00:00:00.000Z"), "B");
  assert(window.packageEndsAt.getUTCFullYear() === 2076, "B ends +50y");

  // --- Admin privacy ---
  for (const field of [
    "statements",
    "mediaAssets",
    "comments",
    "hashedPin",
    "setupTokenHash",
    "manageTokenHash",
  ] as const) {
    assert(
      ADMIN_PROFILE_FORBIDDEN_FIELDS.includes(field),
      `admin forbidden must include ${field}`,
    );
    assert(
      !(field in adminProfileSelect),
      `adminProfileSelect must not include ${field}`,
    );
  }
  assert("packageTier" in adminProfileSelect, "admin may see packageTier");

  // --- Public / manage payload privacy ---
  for (const field of PUBLIC_CONTENT_FORBIDDEN_FIELDS) {
    assert(
      !(field in PUBLIC_STATEMENT_SELECT),
      `public statements must not include ${field}`,
    );
    assert(
      !(field in PUBLIC_MEDIA_META_SELECT),
      `public media must not include ${field}`,
    );
  }
  assert(
    !("r2ObjectKey" in PUBLIC_MEDIA_META_SELECT),
    "public media must never expose r2ObjectKey",
  );
  for (const field of MANAGE_CONTENT_FORBIDDEN_FIELDS) {
    assert(
      !(field in MANAGE_STATEMENT_SELECT),
      `manage statements must not include ${field}`,
    );
    assert(
      !(field in MANAGE_MEDIA_SELECT),
      `manage media must not include ${field}`,
    );
  }

  // --- Statement edge cases ---
  const atCap = assertStatementWordLimit("A", [{ body: words(500) }]);
  assert(atCap.ok, "exactly 500 words must pass");
  const overWords = assertStatementWordLimit("A", [{ body: words(501) }]);
  assert(
    !overWords.ok && overWords.error === "StatementWordLimit",
    "501 words must fail",
  );

  // --- Media edge cases ---
  const photoOk = assertPhotoCountWithinLimit(4, SHARED_PACKAGE_LIMITS.maxImages);
  assert(photoOk.ok, "4 photos must be allowed");
  const photoBlocked = assertPhotoCountWithinLimit(
    5,
    SHARED_PACKAGE_LIMITS.maxImages,
  );
  assert(
    !photoBlocked.ok && photoBlocked.error === "PhotoLimit",
    "6th photo (count=5) must fail",
  );

  const videoOk = assertAvDurationWithinLimit({
    kind: "VIDEO",
    durationSeconds: 60,
    maxSeconds: SHARED_PACKAGE_LIMITS.maxVideoSeconds,
  });
  assert(videoOk.ok, "60s video must pass");
  const videoOver = assertAvDurationWithinLimit({
    kind: "VIDEO",
    durationSeconds: 60.1,
    maxSeconds: SHARED_PACKAGE_LIMITS.maxVideoSeconds,
  });
  assert(
    !videoOver.ok && videoOver.error === "DurationLimit",
    "video over 60s must fail",
  );

  const audioOk = assertAvDurationWithinLimit({
    kind: "VOICE",
    durationSeconds: 120,
    maxSeconds: SHARED_PACKAGE_LIMITS.maxAudioSeconds,
  });
  assert(audioOk.ok, "120s audio must pass");
  const audioOver = assertAvDurationWithinLimit({
    kind: "VOICE",
    durationSeconds: 121,
    maxSeconds: SHARED_PACKAGE_LIMITS.maxAudioSeconds,
  });
  assert(
    !audioOver.ok && audioOver.error === "DurationLimit",
    "121s audio must fail",
  );

  const videoConfirm = mediaConfirmSchema.safeParse({
    profileId: "507f1f77bcf86cd799439011",
    setupToken: "token",
    kind: "VIDEO",
    contentType: "video/mp4",
    sizeBytes: 100,
    fileName: "x.mp4",
    r2ObjectKey: "profiles/507f1f77bcf86cd799439011/VIDEO/2026/09/x.mp4",
    durationSeconds: 30,
  });
  assert(videoConfirm.success, "video confirm with duration must pass");
  const voiceMissing = manageMediaConfirmSchema.safeParse({
    kind: "VOICE",
    contentType: "audio/mpeg",
    sizeBytes: 100,
    fileName: "x.mp3",
    r2ObjectKey: "profiles/507f1f77bcf86cd799439011/VOICE/2026/09/x.mp3",
  });
  assert(!voiceMissing.success, "voice without duration must fail zod");

  // --- Comment edge cases ---
  assert(getCommentMaxWordsForIndex("C", 5) === 100, "comment 5 = 100");
  assert(getCommentMaxWordsForIndex("C", 6) === 150, "comment 6 = 150");
  assert(getCommentMaxWordsForIndex("C", 11) === null, "comment 11 blocked");
  assert(countWords(words(100)) === 100, "100 words counted");
  assert(countWords(words(101)) === 101, "101 words counted");
  assert(
    publicCommentSchema.safeParse({ qrId: "x", body: "hello" }).success,
    "public comment schema ok",
  );
  assert(
    !publicCommentSchema.safeParse({ qrId: "x", body: "  " }).success,
    "blank public comment fails",
  );

  // --- Rate limit preset ---
  assert(
    RATE_LIMIT_PRESETS.publicCommentIp.max === 20,
    "public comment IP max must be 20",
  );
  assert(
    RATE_LIMIT_PRESETS.publicCommentIp.windowMs === 15 * 60 * 1000,
    "public comment window must be 15m",
  );

  console.log("Packages Step 5 hardening verification passed.");
  console.log(
    JSON.stringify(
      {
        tiers: PACKAGE_TIERS,
        limits: SHARED_PACKAGE_LIMITS,
        privacy: {
          adminNeverSees: ["statements", "mediaAssets", "comments"],
          publicNeverSees: [...PUBLIC_CONTENT_FORBIDDEN_FIELDS],
        },
        edgeCases: {
          statementWordsAtCap: 500,
          statementWordsOver: 501,
          photoAtCap: 5,
          videoSecondsAtCap: 60,
          audioSecondsAtCap: 120,
          commentsMax: 10,
        },
      },
      null,
      2,
    ),
  );
}

main();
