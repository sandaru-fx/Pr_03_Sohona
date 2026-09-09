import {
  ADMIN_PROFILE_FORBIDDEN_FIELDS,
  adminProfileSelect,
} from "../lib/admin-profiles";
import {
  computePackageWindow,
  getCommentMaxWordsForIndex,
  getPackageDefinition,
  PACKAGE_CATALOG,
  SHARED_PACKAGE_LIMITS,
} from "../lib/packages";
import { countWords, totalStatementWords } from "../lib/word-count";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(PACKAGE_CATALOG.A.retentionYears === 25, "A must be 25 years");
  assert(PACKAGE_CATALOG.B.retentionYears === 50, "B must be 50 years");
  assert(PACKAGE_CATALOG.C.retentionYears === 100, "C must be 100 years");

  for (const tier of ["A", "B", "C"] as const) {
    const limits = getPackageDefinition(tier).limits;
    assert(limits.maxImages === 5, `${tier} images must be 5`);
    assert(limits.maxVideoSeconds === 60, `${tier} video must be 60s`);
    assert(limits.maxAudioSeconds === 120, `${tier} audio must be 120s`);
    assert(limits.maxStatementWords === 500, `${tier} words must be 500`);
    assert(limits.maxComments === 10, `${tier} max comments must be 10`);
    assert(
      limits === SHARED_PACKAGE_LIMITS,
      `${tier} must share identical limits object`,
    );
  }

  assert(getCommentMaxWordsForIndex("A", 1) === 100, "comment 1 → 100 words");
  assert(getCommentMaxWordsForIndex("A", 5) === 100, "comment 5 → 100 words");
  assert(getCommentMaxWordsForIndex("A", 6) === 150, "comment 6 → 150 words");
  assert(getCommentMaxWordsForIndex("A", 10) === 150, "comment 10 → 150 words");
  assert(getCommentMaxWordsForIndex("A", 11) === null, "comment 11 blocked");

  const start = new Date("2026-01-15T00:00:00.000Z");
  const windowA = computePackageWindow(start, "A");
  assert(
    windowA.packageEndsAt.getUTCFullYear() === 2051,
    "A window must end +25 years",
  );
  const windowC = computePackageWindow(start, "C");
  assert(
    windowC.packageEndsAt.getUTCFullYear() === 2126,
    "C window must end +100 years",
  );

  assert(countWords("hello world") === 2, "english words");
  assert(countWords("සුභ උදෑසනක්") === 2, "sinhala words");
  assert(countWords("  ") === 0, "blank is zero");
  assert(
    totalStatementWords([{ body: "one two" }, { body: "three" }]) === 3,
    "statement total words",
  );

  assert(
    ADMIN_PROFILE_FORBIDDEN_FIELDS.includes("comments"),
    "admin must forbid comments relation",
  );
  assert(
    !("comments" in adminProfileSelect),
    "adminProfileSelect must not include comments",
  );
  assert(
    "packageTier" in adminProfileSelect,
    "admin may see packageTier",
  );

  console.log("Packages Step 1 verification passed.");
  console.log(
    JSON.stringify(
      {
        catalog: Object.fromEntries(
          Object.values(PACKAGE_CATALOG).map((item) => [
            item.tier,
            {
              retentionYears: item.retentionYears,
              maxImages: item.limits.maxImages,
              maxComments: item.limits.maxComments,
            },
          ]),
        ),
        adminSafeFields: Object.keys(adminProfileSelect),
        adminForbiddenIncludesComments: true,
      },
      null,
      2,
    ),
  );
}

main();
