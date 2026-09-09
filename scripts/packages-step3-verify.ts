import { assertStatementWordLimit } from "../lib/package-limits";
import { SHARED_PACKAGE_LIMITS } from "../lib/packages";
import { manageMediaConfirmSchema } from "../lib/validators/manage-media-confirm";
import { mediaConfirmSchema } from "../lib/validators/media-confirm";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const under = assertStatementWordLimit("A", [
    { body: "one two three" },
    { body: "four five" },
  ]);
  assert(under.ok, "under word limit must pass");
  assert(under.usedWords === 5, "used words should be 5");
  assert(
    under.maxWords === SHARED_PACKAGE_LIMITS.maxStatementWords,
    "max words must match shared limits",
  );

  const overBody = Array.from({ length: 501 }, (_, i) => `w${i}`).join(" ");
  const over = assertStatementWordLimit("B", [{ body: overBody }]);
  assert(!over.ok && over.error === "StatementWordLimit", "501 words must fail");

  const photoConfirm = mediaConfirmSchema.safeParse({
    profileId: "507f1f77bcf86cd799439011",
    setupToken: "token",
    kind: "PHOTO",
    contentType: "image/jpeg",
    sizeBytes: 100,
    fileName: "a.jpg",
    r2ObjectKey: "profiles/507f1f77bcf86cd799439011/PHOTO/2026/09/x.jpg",
  });
  assert(photoConfirm.success, "PHOTO confirm without duration must pass");

  const videoOk = mediaConfirmSchema.safeParse({
    profileId: "507f1f77bcf86cd799439011",
    setupToken: "token",
    kind: "VIDEO",
    contentType: "video/mp4",
    sizeBytes: 1000,
    fileName: "clip.mp4",
    r2ObjectKey: "profiles/507f1f77bcf86cd799439011/VIDEO/2026/09/x.mp4",
    durationSeconds: 59,
  });
  assert(videoOk.success, "VIDEO with duration must pass");

  const videoMissing = mediaConfirmSchema.safeParse({
    profileId: "507f1f77bcf86cd799439011",
    setupToken: "token",
    kind: "VIDEO",
    contentType: "video/mp4",
    sizeBytes: 1000,
    fileName: "clip.mp4",
    r2ObjectKey: "profiles/507f1f77bcf86cd799439011/VIDEO/2026/09/x.mp4",
  });
  assert(!videoMissing.success, "VIDEO without duration must fail");

  const manageVoice = manageMediaConfirmSchema.safeParse({
    kind: "VOICE",
    contentType: "audio/mpeg",
    sizeBytes: 2048,
    fileName: "voice.mp3",
    r2ObjectKey: "profiles/507f1f77bcf86cd799439011/VOICE/2026/09/x.mp3",
    durationSeconds: 120,
  });
  assert(manageVoice.success, "manage VOICE with duration must pass");

  console.log("Packages Step 3 verification passed.");
  console.log(
    JSON.stringify(
      {
        maxImages: SHARED_PACKAGE_LIMITS.maxImages,
        maxVideoSeconds: SHARED_PACKAGE_LIMITS.maxVideoSeconds,
        maxAudioSeconds: SHARED_PACKAGE_LIMITS.maxAudioSeconds,
        maxStatementWords: SHARED_PACKAGE_LIMITS.maxStatementWords,
      },
      null,
      2,
    ),
  );
}

main();
