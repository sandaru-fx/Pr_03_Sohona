import {
  ADMIN_PROFILE_FORBIDDEN_FIELDS,
  adminProfileSelect,
} from "../lib/admin-profiles";
import {
  MANAGE_CONTENT_FORBIDDEN_FIELDS,
  MANAGE_MEDIA_SELECT,
  MANAGE_STATEMENT_SELECT,
} from "../lib/manage-content";
import {
  createManageSessionValue,
  getManageCookieSecurity,
  MANAGE_SESSION_COOKIE,
  MANAGE_SESSION_TTL_SECONDS,
  parseManageSessionValue,
} from "../lib/manage-session";
import {
  PUBLIC_PIN_LOCK_MS,
  PUBLIC_PIN_MAX_ATTEMPTS,
} from "../lib/public-pin-lock";
import {
  PUBLIC_VIEW_COOKIE,
  PUBLIC_VIEW_SESSION_TTL_SECONDS,
} from "../lib/public-view-session";
import { RATE_LIMIT_PRESETS } from "../lib/rate-limit-presets";
import { manageMediaConfirmSchema } from "../lib/validators/manage-media-confirm";
import { manageMediaPresignSchema } from "../lib/validators/manage-media-presign";
import { managePinSchema } from "../lib/validators/manage-pin";
import { manageSettingsSchema } from "../lib/validators/manage-settings";
import { manageStatementsSchema } from "../lib/validators/manage-statements";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = "day9-verify-test-secret-do-not-use-in-prod";
  }

  // --- Validators ---
  const pinOk = managePinSchema.safeParse({
    manageToken: "a".repeat(43),
    pin: "123456",
  });
  assert(pinOk.success, "valid manage PIN payload must pass");

  const pinShort = managePinSchema.safeParse({
    manageToken: "token",
    pin: "12345",
  });
  assert(!pinShort.success, "5-digit manage PIN must fail");

  const pinNoToken = managePinSchema.safeParse({
    manageToken: "   ",
    pin: "123456",
  });
  assert(!pinNoToken.success, "blank manageToken must fail");

  const statementsOk = manageStatementsSchema.safeParse({
    statements: [{ body: "Remember kindness." }],
  });
  assert(statementsOk.success, "valid statements payload must pass");

  const statementsEmptyBody = manageStatementsSchema.safeParse({
    statements: [{ body: "   " }],
  });
  assert(!statementsEmptyBody.success, "empty statement body must fail");

  const settingsOk = manageSettingsSchema.safeParse({
    isPublicPinRequired: true,
  });
  assert(settingsOk.success, "settings toggle must pass");

  const settingsNameBlocked = manageSettingsSchema.safeParse({
    isPublicPinRequired: false,
    displayName: "Hacked Name",
  });
  assert(
    !settingsNameBlocked.success,
    "displayName must be rejected on settings (read-only)",
  );

  const presignOk = manageMediaPresignSchema.safeParse({
    kind: "PHOTO",
    contentType: "image/jpeg",
    sizeBytes: 1024,
    fileName: "memory.jpg",
  });
  assert(presignOk.success, "manage media presign payload must pass");
  assert(
    !("setupToken" in (presignOk.data as object)),
    "manage presign must not carry setupToken",
  );

  const confirmOk = manageMediaConfirmSchema.safeParse({
    kind: "VOICE",
    contentType: "audio/mpeg",
    sizeBytes: 2048,
    fileName: "voice.mp3",
    r2ObjectKey: "profiles/507f1f77bcf86cd799439011/VOICE/2026/09/x-voice.mp3",
    durationSeconds: 45,
  });
  assert(confirmOk.success, "manage media confirm payload must pass");

  const confirmMissingDuration = manageMediaConfirmSchema.safeParse({
    kind: "VOICE",
    contentType: "audio/mpeg",
    sizeBytes: 2048,
    fileName: "voice.mp3",
    r2ObjectKey: "profiles/507f1f77bcf86cd799439011/VOICE/2026/09/x-voice.mp3",
  });
  assert(
    !confirmMissingDuration.success,
    "VOICE confirm without durationSeconds must fail",
  );

  // --- Session cookie (separate from public view) ---
  assert(
    MANAGE_SESSION_TTL_SECONDS === 4 * 60 * 60,
    "manage session TTL must be 4 hours",
  );
  assert(MANAGE_SESSION_COOKIE === "sohona_manage", "manage cookie name drift");
  assert(
    (MANAGE_SESSION_COOKIE as string) !== PUBLIC_VIEW_COOKIE,
    "manage cookie must differ from public view cookie",
  );
  assert(
    MANAGE_SESSION_TTL_SECONDS !== PUBLIC_VIEW_SESSION_TTL_SECONDS,
    "manage TTL must differ from public view TTL",
  );

  const profileId = "507f1f77bcf86cd799439011";
  const otherId = "507f1f77bcf86cd799439012";
  const { value, maxAge } = createManageSessionValue(profileId);
  assert(maxAge === MANAGE_SESSION_TTL_SECONDS, "manage session maxAge mismatch");
  assert(value.includes("."), "manage session value must be payload.sig");

  const session = parseManageSessionValue(value);
  assert(session?.profileId === profileId, "session must bind to profileId");
  assert(typeof session?.exp === "number", "session must include exp");

  const tampered = `${value.slice(0, -2)}aa`;
  assert(
    parseManageSessionValue(tampered) === null,
    "tampered manage session must be rejected",
  );
  assert(
    parseManageSessionValue("not-a-session") === null,
    "garbage manage session must be rejected",
  );

  const cross = parseManageSessionValue(value);
  assert(
    cross?.profileId !== otherId,
    "manage session must not match other profileId",
  );

  const cookieSecurity = getManageCookieSecurity();
  assert(cookieSecurity.httpOnly === true, "manage cookie must be httpOnly");
  assert(cookieSecurity.sameSite === "lax", "manage cookie SameSite must be Lax");
  assert(cookieSecurity.path === "/", "manage cookie path must be /");
  assert(
    typeof cookieSecurity.secure === "boolean",
    "manage cookie secure flag must be boolean",
  );

  // --- Shared PIN lock + manage rate limit ---
  assert(PUBLIC_PIN_MAX_ATTEMPTS === 5, "PIN max attempts must stay 5");
  assert(
    PUBLIC_PIN_LOCK_MS === 15 * 60 * 1000,
    "PIN lock window must stay 15 minutes",
  );
  assert(RATE_LIMIT_PRESETS.manageIp.max === 60, "manage IP max must be 60");
  assert(
    RATE_LIMIT_PRESETS.manageIp.windowMs === 15 * 60 * 1000,
    "manage IP window must be 15m",
  );

  // --- Privacy selects ---
  for (const field of MANAGE_CONTENT_FORBIDDEN_FIELDS) {
    assert(
      !(field in MANAGE_STATEMENT_SELECT),
      `manage statement select must not include ${field}`,
    );
    assert(
      !(field in MANAGE_MEDIA_SELECT),
      `manage media select must not include ${field}`,
    );
  }
  assert(
    !("r2ObjectKey" in MANAGE_MEDIA_SELECT),
    "manage media list must never expose r2ObjectKey",
  );

  for (const field of ADMIN_PROFILE_FORBIDDEN_FIELDS) {
    assert(
      !(field in adminProfileSelect),
      `adminProfileSelect must not include forbidden field: ${field}`,
    );
  }

  console.log("Day 9 Phase 9.6 verification passed.");
  console.log(
    JSON.stringify(
      {
        manageSessionTtlHours: MANAGE_SESSION_TTL_SECONDS / 3600,
        cookie: {
          name: MANAGE_SESSION_COOKIE,
          ...cookieSecurity,
        },
        publicViewCookie: PUBLIC_VIEW_COOKIE,
        pinLock: {
          maxAttempts: PUBLIC_PIN_MAX_ATTEMPTS,
          lockMinutes: PUBLIC_PIN_LOCK_MS / 60000,
        },
        manageIpPreset: RATE_LIMIT_PRESETS.manageIp,
        manageStatementFields: Object.keys(MANAGE_STATEMENT_SELECT),
        manageMediaFields: Object.keys(MANAGE_MEDIA_SELECT),
        manualChecklist: [
          "Manage link alone → PIN form (no edit UI)",
          "Correct PIN → 4h sohona_manage session + dashboard",
          "Wrong PIN ×5 → shared 15m lock with public view",
          "Logout clears manage cookie only (public view untouched)",
          "Settings can toggle isPublicPinRequired; displayName stays read-only",
          "Media delete removes DB row + best-effort R2 object",
          "Light site pages: /, /about, /packages, /contact",
        ],
      },
      null,
      2,
    ),
  );
}

main();
