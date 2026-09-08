import {
  ADMIN_PROFILE_FORBIDDEN_FIELDS,
  adminProfileSelect,
} from "../lib/admin-profiles";
import {
  generateQrId,
  generateSetupToken,
  getSetupTokenExpiry,
  hashToken,
  SETUP_TOKEN_TTL_DAYS,
} from "../lib/tokens";
import { isMongoObjectId } from "../lib/object-id";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const qrId = generateQrId();
  const setupToken = generateSetupToken();
  const hash = hashToken(setupToken);
  const hashAgain = hashToken(setupToken);
  const expires = getSetupTokenExpiry(new Date("2026-01-01T00:00:00.000Z"));

  assert(qrId.length >= 20, `qrId too short: ${qrId.length}`);
  assert(!qrId.includes("+") && !qrId.includes("/"), "qrId must be URL-safe");
  assert(setupToken.length >= 40, `setupToken too short: ${setupToken.length}`);
  assert(hash === hashAgain, "token hash must be deterministic");
  assert(hash !== setupToken, "setup token must never equal its hash");
  assert(hash.length === 64, "sha256 hex length must be 64");
  assert(SETUP_TOKEN_TTL_DAYS === 7, "setup TTL must remain 7 days for Day 3");
  assert(
    expires.toISOString() === "2026-01-08T00:00:00.000Z",
    "setup expiry offset incorrect",
  );
  assert(isMongoObjectId("507f1f77bcf86cd799439011"), "valid ObjectId rejected");
  assert(!isMongoObjectId("not-an-id"), "invalid ObjectId accepted");
  assert(!isMongoObjectId("507f1f77bcf86cd79943901"), "short ObjectId accepted");

  for (const field of ADMIN_PROFILE_FORBIDDEN_FIELDS) {
    assert(
      !(field in adminProfileSelect),
      `adminProfileSelect must not include forbidden field: ${field}`,
    );
  }

  console.log("Day 3 Phase 3.5 verification passed.");
  console.log(
    JSON.stringify(
      {
        qrIdLength: qrId.length,
        setupTokenLength: setupToken.length,
        hashLength: hash.length,
        setupTtlDays: SETUP_TOKEN_TTL_DAYS,
        adminSafeFields: Object.keys(adminProfileSelect),
      },
      null,
      2,
    ),
  );
}

main();
