import {
  ADMIN_PROFILE_FORBIDDEN_FIELDS,
  adminProfileSelect,
} from "../lib/admin-profiles";
import {
  isPinLocked,
  PUBLIC_PIN_LOCK_MS,
  PUBLIC_PIN_MAX_ATTEMPTS,
} from "../lib/public-pin-lock";
import {
  canViewPublicContent,
  PUBLIC_CONTENT_FORBIDDEN_FIELDS,
  PUBLIC_MEDIA_META_SELECT,
  PUBLIC_STATEMENT_SELECT,
  type PublicProfileGateResult,
} from "../lib/public-profile";
import {
  createPublicViewSessionValue,
  getPublicViewCookieSecurity,
  parsePublicViewSessionValue,
  PUBLIC_VIEW_COOKIE,
  PUBLIC_VIEW_SESSION_TTL_SECONDS,
} from "../lib/public-view-session";
import { publicPinSchema } from "../lib/validators/public-pin";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = "day6-verify-test-secret-do-not-use-in-prod";
  }

  const pinOk = publicPinSchema.safeParse({
    qrId: "testQrIdValue1234567890",
    pin: "123456",
  });
  assert(pinOk.success, "valid public PIN payload must pass");

  const pinBad = publicPinSchema.safeParse({
    qrId: "testQrIdValue1234567890",
    pin: "12345",
  });
  assert(!pinBad.success, "5-digit public PIN must fail");

  const pinEmptyQr = publicPinSchema.safeParse({
    qrId: "  ",
    pin: "123456",
  });
  assert(!pinEmptyQr.success, "blank qrId must fail");

  assert(PUBLIC_PIN_MAX_ATTEMPTS === 5, "public PIN max attempts must be 5");
  assert(
    PUBLIC_PIN_LOCK_MS === 15 * 60 * 1000,
    "public PIN lock window must be 15 minutes",
  );
  assert(
    PUBLIC_VIEW_SESSION_TTL_SECONDS === 12 * 60 * 60,
    "public view session TTL must be 12 hours",
  );
  assert(PUBLIC_VIEW_COOKIE === "sohona_public_view", "cookie name drift");

  const future = new Date(Date.now() + 60_000);
  const past = new Date(Date.now() - 60_000);
  assert(isPinLocked(future), "future lock must be active");
  assert(!isPinLocked(past), "expired lock must be inactive");
  assert(!isPinLocked(null), "null lock must be inactive");

  const qrId = "qr-day6-verify-aaaaaaaa";
  const otherQr = "qr-day6-verify-bbbbbbbb";
  const { value, maxAge } = createPublicViewSessionValue(qrId);
  assert(maxAge === PUBLIC_VIEW_SESSION_TTL_SECONDS, "session maxAge mismatch");
  assert(value.includes("."), "session value must be payload.sig");

  const session = parsePublicViewSessionValue(value);
  assert(session?.qrId === qrId, "session must bind to qrId");
  assert(typeof session?.exp === "number", "session must include exp");

  const tampered = `${value.slice(0, -2)}aa`;
  assert(
    parsePublicViewSessionValue(tampered) === null,
    "tampered session must be rejected",
  );
  assert(
    parsePublicViewSessionValue("not-a-session") === null,
    "garbage session must be rejected",
  );

  const cross = parsePublicViewSessionValue(value);
  assert(cross?.qrId !== otherQr, "session must not match other qrId");

  const cookieSecurity = getPublicViewCookieSecurity();
  assert(cookieSecurity.httpOnly === true, "cookie must be httpOnly");
  assert(cookieSecurity.sameSite === "lax", "cookie SameSite must be Lax");
  assert(cookieSecurity.path === "/", "cookie path must be /");
  assert(
    typeof cookieSecurity.secure === "boolean",
    "cookie secure flag must be boolean",
  );

  for (const field of PUBLIC_CONTENT_FORBIDDEN_FIELDS) {
    assert(
      !(field in PUBLIC_STATEMENT_SELECT),
      `statement select must not include ${field}`,
    );
    assert(
      !(field in PUBLIC_MEDIA_META_SELECT),
      `media select must not include ${field}`,
    );
  }
  assert(
    !("r2ObjectKey" in PUBLIC_MEDIA_META_SELECT),
    "public media must never expose r2ObjectKey",
  );

  for (const field of ADMIN_PROFILE_FORBIDDEN_FIELDS) {
    assert(
      !(field in adminProfileSelect),
      `adminProfileSelect must not include forbidden field: ${field}`,
    );
  }

  const openReady: PublicProfileGateResult = {
    status: "ready",
    profile: {
      id: "507f1f77bcf86cd799439011",
      displayName: "Test",
      qrId,
      isPublicPinRequired: false,
      packageTier: "A",
    },
    access: "open",
    pinLock: null,
    message: "open",
  };
  const pinReady: PublicProfileGateResult = {
    ...openReady,
    access: "pin_required",
    profile: { ...openReady.profile, isPublicPinRequired: true },
    message: "pin",
  };

  assert(canViewPublicContent(openReady, false), "open access needs no session");
  assert(
    !canViewPublicContent(pinReady, false),
    "pin_required without session must block",
  );
  assert(
    canViewPublicContent(pinReady, true),
    "pin_required with session must allow",
  );
  assert(
    !canViewPublicContent({ status: "not_found", message: "x" }, true),
    "not_found must never allow content",
  );

  console.log("Day 6 Phase 6.5 verification passed.");
  console.log(
    JSON.stringify(
      {
        publicPinMaxAttempts: PUBLIC_PIN_MAX_ATTEMPTS,
        publicPinLockMinutes: PUBLIC_PIN_LOCK_MS / 60000,
        sessionTtlHours: PUBLIC_VIEW_SESSION_TTL_SECONDS / 3600,
        cookie: {
          name: PUBLIC_VIEW_COOKIE,
          ...cookieSecurity,
        },
        publicStatementFields: Object.keys(PUBLIC_STATEMENT_SELECT),
        publicMediaFields: Object.keys(PUBLIC_MEDIA_META_SELECT),
        adminSafeFields: Object.keys(adminProfileSelect),
      },
      null,
      2,
    ),
  );
}

main();
