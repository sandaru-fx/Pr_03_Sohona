import { ADMIN_PROFILE_FORBIDDEN_FIELDS, adminProfileSelect } from "../lib/admin-profiles";
import {
  getCommentMaxWordsForIndex,
  SHARED_PACKAGE_LIMITS,
} from "../lib/packages";
import { publicCommentSchema } from "../lib/validators/public-comment";
import { countWords } from "../lib/word-count";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(
    ADMIN_PROFILE_FORBIDDEN_FIELDS.includes("comments"),
    "admin must forbid comments",
  );
  assert(
    !("comments" in adminProfileSelect),
    "adminProfileSelect must never include comments",
  );

  assert(getCommentMaxWordsForIndex(1) === 100, "slot 1 = 100");
  assert(getCommentMaxWordsForIndex(5) === 100, "slot 5 = 100");
  assert(getCommentMaxWordsForIndex(6) === 150, "slot 6 = 150");
  assert(getCommentMaxWordsForIndex(10) === 150, "slot 10 = 150");
  assert(getCommentMaxWordsForIndex(11) === null, "slot 11 blocked");

  const ok = publicCommentSchema.safeParse({
    qrId: "demo-qr",
    body: "A kind memory.",
  });
  assert(ok.success, "valid public comment must pass");

  const empty = publicCommentSchema.safeParse({ qrId: "demo-qr", body: "   " });
  assert(!empty.success, "blank comment must fail");

  const words = countWords(
    Array.from({ length: 101 }, (_, i) => `w${i}`).join(" "),
  );
  assert(words === 101, "101 tokens counted");
  assert(
    words > (getCommentMaxWordsForIndex(1) as number),
    "101 words exceeds first-slot limit",
  );

  assert(
    SHARED_PACKAGE_LIMITS.maxComments === 10,
    "max comments must stay 10",
  );

  console.log("Packages Step 4 verification passed.");
  console.log(
    JSON.stringify(
      {
        maxComments: SHARED_PACKAGE_LIMITS.maxComments,
        commentSlots: SHARED_PACKAGE_LIMITS.commentSlots,
        adminNeverSeesComments: true,
        publicCommentApi: "/api/public/comments",
        manageCommentDeleteApi: "/api/manage/comments/[id]",
      },
      null,
      2,
    ),
  );
}

main();
