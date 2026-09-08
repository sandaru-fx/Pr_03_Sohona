import {
  ADMIN_PROFILE_FORBIDDEN_FIELDS,
  adminProfileSelect,
} from "../lib/admin-profiles";
import { isPinLocked, PUBLIC_PIN_MAX_ATTEMPTS } from "../lib/public-pin-lock";
import { rateLimit } from "../lib/rate-limit";
import { RATE_LIMIT_PRESETS } from "../lib/rate-limit-presets";
import { isRedisConfigured } from "../lib/redis-config";
import { getClientIp } from "../lib/request-ip";
import {
  getRequestIdentity,
  hashIp,
  rateLimitKey,
  securityEventRequestFields,
} from "../lib/request-identity";
import {
  SETUP_FAIL_MAX_ATTEMPTS,
  SETUP_FAIL_WINDOW_MS,
} from "../lib/setup-rate-limit";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function mainOffline() {
  if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = "day8-verify-test-secret-do-not-use-in-prod";
  }

  assert(RATE_LIMIT_PRESETS.publicPinIp.max === 10, "public PIN IP max must be 10");
  assert(
    RATE_LIMIT_PRESETS.publicPinIp.windowMs === 15 * 60 * 1000,
    "public PIN IP window must be 15m",
  );
  assert(
    RATE_LIMIT_PRESETS.publicPinProfile.max === 20,
    "public PIN profile soft max must be 20",
  );
  assert(RATE_LIMIT_PRESETS.setupIp.max === 30, "setup IP max must be 30");
  assert(RATE_LIMIT_PRESETS.mediaUrlIp.max === 60, "media URL IP max must be 60");
  assert(RATE_LIMIT_PRESETS.adminIp.max === 120, "admin IP max must be 120");

  assert(PUBLIC_PIN_MAX_ATTEMPTS === 5, "DB PIN lock max must remain 5");
  assert(
    SETUP_FAIL_MAX_ATTEMPTS === 20,
    "setup DB fail max must remain 20",
  );
  assert(
    SETUP_FAIL_WINDOW_MS === 15 * 60 * 1000,
    "setup DB fail window must remain 15m",
  );

  const future = new Date(Date.now() + 60_000);
  assert(isPinLocked(future), "DB pin lock must still work");

  const ip = "203.0.113.10";
  const hashA = hashIp(ip);
  const hashB = hashIp(ip);
  assert(hashA === hashB, "ip hash must be deterministic");
  assert(hashA !== ip, "ip hash must never equal raw IP");
  assert(hashA.length === 64, "ip hash must be sha256 hex");

  const req = new Request("http://localhost/api/public/pin", {
    headers: {
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      "user-agent": "SohonaVerify/1.0",
    },
  });
  assert(getClientIp(req) === "203.0.113.10", "must use first forwarded IP");

  const identity = getRequestIdentity(req);
  assert(identity.ip === "203.0.113.10", "identity ip mismatch");
  assert(identity.ipHash === hashIp("203.0.113.10"), "identity hash mismatch");
  assert(identity.userAgent === "SohonaVerify/1.0", "UA truncation/pass failed");

  const fields = securityEventRequestFields(req);
  assert(fields.ipHash === identity.ipHash, "security fields hash mismatch");
  assert(!("ip" in fields), "security fields must never include raw ip");

  const key = rateLimitKey(["publicPinIp", "ip", identity.ipHash]);
  assert(key.startsWith("publicPinIp:ip:"), "rate limit key shape wrong");
  assert(!key.includes("203.0.113.10"), "rate limit key must not embed raw IP");

  for (const field of ADMIN_PROFILE_FORBIDDEN_FIELDS) {
    assert(
      !(field in adminProfileSelect),
      `adminProfileSelect must not include forbidden field: ${field}`,
    );
  }
}

async function mainAsync() {
  const degraded = await rateLimit({
    key: "day8-verify:degrade-probe",
    windowMs: 60_000,
    max: 5,
  });

  if (!isRedisConfigured()) {
    assert(degraded.ok, "missing Redis must degrade to allow");
    assert(degraded.degraded === true, "missing Redis must set degraded=true");
  } else {
    assert(degraded.ok, "configured Redis probe should allow first hit");
    assert(degraded.degraded === false, "live Redis must not be degraded");
  }

  console.log("Day 8 Phase 8.4–8.5 verification passed.");
  console.log(
    JSON.stringify(
      {
        redisConfigured: isRedisConfigured(),
        rateLimitProbe: degraded,
        presets: RATE_LIMIT_PRESETS,
        dbLocks: {
          publicPinMaxAttempts: PUBLIC_PIN_MAX_ATTEMPTS,
          setupFailMaxAttempts: SETUP_FAIL_MAX_ATTEMPTS,
        },
        manualChecklist: [
          "Without Redis: APIs still work; DB PIN/setup locks still apply",
          "With Redis: exceed public PIN IP limit → 429 + Retry-After",
          "SecurityEvent rows store ipHash only (never raw IP)",
          "Admin APIs soft-limited per IP",
          "Signed media URL mint limited per IP",
        ],
      },
      null,
      2,
    ),
  );
}

mainOffline();
mainAsync().catch((error) => {
  console.error("Day 8 verification failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
