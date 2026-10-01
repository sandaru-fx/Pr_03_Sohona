import {
  ADMIN_PROFILE_FORBIDDEN_FIELDS,
  adminProfileSelect,
} from "../lib/admin-profiles";
import { isValidPin } from "../lib/pin";
import {
  SETUP_FAIL_MAX_ATTEMPTS,
  SETUP_FAIL_WINDOW_MS,
} from "../lib/setup-rate-limit";
import {
  generateManageToken,
  generateSetupToken,
  hashToken,
} from "../lib/tokens";
import { setupCompleteSchema } from "../lib/validators/setup-complete";
import { setupPinSchema } from "../lib/validators/setup-pin";
import { setupStatementsSchema } from "../lib/validators/setup-statements";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(isValidPin("123456"), "6-digit PIN must be valid");
  assert(!isValidPin("12345"), "5-digit PIN must be rejected");
  assert(!isValidPin("1234567"), "7-digit PIN must be rejected");
  assert(!isValidPin("12ab56"), "non-numeric PIN must be rejected");

  const pinOk = setupPinSchema.safeParse({
    profileId: "507f1f77bcf86cd799439011",
    setupToken: "token",
    pin: "654321",
    confirmPin: "654321",
    isPublicPinRequired: true,
  });
  assert(pinOk.success, "matching 6-digit PIN setup payload must pass");

  const pinMismatch = setupPinSchema.safeParse({
    profileId: "507f1f77bcf86cd799439011",
    setupToken: "token",
    pin: "654321",
    confirmPin: "111111",
    isPublicPinRequired: false,
  });
  assert(!pinMismatch.success, "PIN mismatch must fail validation");

  const statementsOk = setupStatementsSchema.safeParse({
    profileId: "507f1f77bcf86cd799439011",
    setupToken: "token",
    statements: [{ body: "Remember kindness." }, { body: "  " }],
  });
  assert(
    !statementsOk.success,
    "blank statement body must fail validation (trim + min)",
  );

  const statementsClean = setupStatementsSchema.safeParse({
    profileId: "507f1f77bcf86cd799439011",
    setupToken: "token",
    statements: [{ body: "Remember kindness." }],
  });
  assert(statementsClean.success, "valid statements payload must pass");

  const completeOk = setupCompleteSchema.safeParse({
    profileId: "507f1f77bcf86cd799439011",
    setupToken: "abc",
  });
  assert(completeOk.success, "complete payload must pass");

  const completeBad = setupCompleteSchema.safeParse({
    profileId: "",
    setupToken: "abc",
  });
  assert(!completeBad.success, "empty profileId must fail complete validation");

  const setupToken = generateSetupToken();
  const manageToken = generateManageToken();
  assert(setupToken.length >= 40, "setup token too short");
  assert(manageToken.length >= 40, "manage token too short");
  assert(setupToken !== manageToken, "tokens must be unique draws");
  assert(
    hashToken(manageToken) !== manageToken,
    "manage token must never equal its hash",
  );
  assert(hashToken(manageToken).length === 64, "manage hash must be sha256 hex");
  assert(
    hashToken(manageToken) === hashToken(manageToken),
    "manage hash must be deterministic",
  );

  for (const field of ADMIN_PROFILE_FORBIDDEN_FIELDS) {
    assert(
      !(field in adminProfileSelect),
      `adminProfileSelect must not include forbidden field: ${field}`,
    );
  }
  assert(
    !("statements" in adminProfileSelect),
    "admin select must not include statements",
  );
  assert(
    !("mediaAssets" in adminProfileSelect),
    "admin select must not include mediaAssets",
  );

  assert(
    SETUP_FAIL_MAX_ATTEMPTS === 20,
    "setup fail threshold foundation must stay 20 until Day 8 review",
  );
  assert(
    SETUP_FAIL_WINDOW_MS === 15 * 60 * 1000,
    "setup fail window foundation must stay 15 minutes until Day 8 review",
  );

  console.log("Day 5 Phase 5.5 verification passed.");
  console.log(
    JSON.stringify(
      {
        pinDigits: 6,
        manageTokenLength: manageToken.length,
        manageHashLength: hashToken(manageToken).length,
        setupFailMax: SETUP_FAIL_MAX_ATTEMPTS,
        setupFailWindowMinutes: SETUP_FAIL_WINDOW_MS / 60000,
        adminSafeFields: Object.keys(adminProfileSelect),
        adminForbiddenFields: [...ADMIN_PROFILE_FORBIDDEN_FIELDS],
      },
      null,
      2,
    ),
  );
}

main();
