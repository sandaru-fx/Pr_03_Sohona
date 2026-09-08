import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/pin";
import { prisma } from "@/lib/prisma";
import {
  formatPinLockRemaining,
  formatPinLockUntil,
  isPinLocked,
  PUBLIC_PIN_LOCK_MS,
  PUBLIC_PIN_MAX_ATTEMPTS,
} from "@/lib/public-pin-lock";
import { applyPublicViewSessionCookie } from "@/lib/public-view-session";
import {
  enforceIpRateLimit,
  enforcePublicPinProfileRateLimit,
} from "@/lib/rate-limit-presets";
import { securityEventRequestFields } from "@/lib/request-identity";
import { publicPinSchema } from "@/lib/validators/public-pin";

export const runtime = "nodejs";

function lockedResponse(lockedUntil: Date) {
  return NextResponse.json(
    {
      error: "PinLocked",
      message: `Too many incorrect PIN attempts. Try again in ${formatPinLockRemaining(lockedUntil)}.`,
      lockedUntil: lockedUntil.toISOString(),
      lockedUntilLabel: formatPinLockUntil(lockedUntil),
      lockMinutes: Math.round(PUBLIC_PIN_LOCK_MS / 60000),
      maxAttempts: PUBLIC_PIN_MAX_ATTEMPTS,
    },
    {
      status: 423,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}

/**
 * POST /api/public/pin
 * Verify public-view PIN for a memorial QR profile and set a short session cookie.
 * Day 6 DB lock + Day 8 Redis IP/profile rate limits.
 */
export async function POST(request: Request) {
  const ipLimited = await enforceIpRateLimit(request, "publicPinIp");
  if (ipLimited) return ipLimited;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "InvalidJSON", message: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const parsed = publicPinSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "ValidationError",
        message: "Invalid PIN request.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { qrId: parsed.data.qrId },
    select: {
      id: true,
      qrId: true,
      displayName: true,
      isSetupComplete: true,
      isPublicPinRequired: true,
      hashedPin: true,
      failedPinAttempts: true,
      pinLockedUntil: true,
    },
  });

  if (!profile || !profile.isSetupComplete) {
    return NextResponse.json(
      {
        error: "NotFound",
        message: "This memorial could not be found or is not ready.",
      },
      { status: 404 },
    );
  }

  const profileLimited = await enforcePublicPinProfileRateLimit(
    request,
    profile.id,
  );
  if (profileLimited) return profileLimited;

  if (!profile.isPublicPinRequired) {
    return NextResponse.json(
      {
        error: "PinNotRequired",
        message: "This memorial does not require a PIN to view.",
      },
      { status: 400 },
    );
  }

  if (!profile.hashedPin) {
    return NextResponse.json(
      {
        error: "PinNotConfigured",
        message: "This memorial is not ready for PIN entry yet.",
      },
      { status: 400 },
    );
  }

  if (isPinLocked(profile.pinLockedUntil) && profile.pinLockedUntil) {
    return lockedResponse(profile.pinLockedUntil);
  }

  // Clear expired lock residue before verifying.
  if (profile.pinLockedUntil && !isPinLocked(profile.pinLockedUntil)) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { pinLockedUntil: null },
    });
  }

  const requestFields = securityEventRequestFields(request);
  const ok = await verifyPin(profile.hashedPin, parsed.data.pin);

  if (!ok) {
    const nextFails = profile.failedPinAttempts + 1;
    const shouldLock = nextFails >= PUBLIC_PIN_MAX_ATTEMPTS;
    const pinLockedUntil = shouldLock
      ? new Date(Date.now() + PUBLIC_PIN_LOCK_MS)
      : null;

    await prisma.$transaction([
      prisma.profile.update({
        where: { id: profile.id },
        data: {
          failedPinAttempts: shouldLock ? 0 : nextFails,
          pinLockedUntil,
        },
      }),
      prisma.securityEvent.create({
        data: {
          profileId: profile.id,
          type: shouldLock ? "PIN_LOCKED" : "PIN_VERIFY_FAIL",
          ...requestFields,
          metadata: {
            source: "public_view",
            attempts: nextFails,
            maxAttempts: PUBLIC_PIN_MAX_ATTEMPTS,
            lockMinutes: shouldLock
              ? Math.round(PUBLIC_PIN_LOCK_MS / 60000)
              : undefined,
          },
        },
      }),
    ]);

    if (shouldLock && pinLockedUntil) {
      return lockedResponse(pinLockedUntil);
    }

    return NextResponse.json(
      {
        error: "InvalidPin",
        message: "Incorrect PIN. Please try again.",
        attemptsRemaining: PUBLIC_PIN_MAX_ATTEMPTS - nextFails,
        maxAttempts: PUBLIC_PIN_MAX_ATTEMPTS,
      },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: profile.id },
      data: {
        failedPinAttempts: 0,
        pinLockedUntil: null,
      },
    }),
    prisma.securityEvent.create({
      data: {
        profileId: profile.id,
        type: "PIN_VERIFY_OK",
        ...requestFields,
        metadata: { source: "public_view" },
      },
    }),
  ]);

  const response = NextResponse.json(
    {
      ok: true,
      qrId: profile.qrId,
      displayName: profile.displayName,
      message: "PIN accepted. You can view this memorial.",
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );

  applyPublicViewSessionCookie(response, profile.qrId);
  return response;
}
