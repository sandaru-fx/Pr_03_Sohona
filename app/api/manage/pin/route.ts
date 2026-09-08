import { NextResponse } from "next/server";
import { applyManageSessionCookie } from "@/lib/manage-session";
import { verifyPin } from "@/lib/pin";
import { prisma } from "@/lib/prisma";
import {
  formatPinLockRemaining,
  formatPinLockUntil,
  isPinLocked,
  PUBLIC_PIN_LOCK_MS,
  PUBLIC_PIN_MAX_ATTEMPTS,
} from "@/lib/public-pin-lock";
import {
  enforceIpRateLimit,
  enforcePublicPinProfileRateLimit,
} from "@/lib/rate-limit-presets";
import { securityEventRequestFields } from "@/lib/request-identity";
import { hashToken } from "@/lib/tokens";
import { managePinSchema } from "@/lib/validators/manage-pin";

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
 * POST /api/manage/pin
 * Verify memorial PIN for a manage-link token and set a 4h manage session cookie.
 * Shares DB PIN lock with public view; separate cookie from sohona_public_view.
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

  const parsed = managePinSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "ValidationError",
        message: "Invalid manage PIN request.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const requestFields = securityEventRequestFields(request);
  const manageTokenHash = hashToken(parsed.data.manageToken);

  const profile = await prisma.profile.findFirst({
    where: { manageTokenHash },
    select: {
      id: true,
      qrId: true,
      displayName: true,
      isSetupComplete: true,
      hashedPin: true,
      failedPinAttempts: true,
      pinLockedUntil: true,
      manageTokenHash: true,
    },
  });

  if (
    !profile ||
    !profile.manageTokenHash ||
    !profile.isSetupComplete ||
    !profile.hashedPin
  ) {
    await prisma.securityEvent.create({
      data: {
        profileId: profile?.id,
        type: "MANAGE_TOKEN_FAIL",
        ...requestFields,
        metadata: { source: "manage", reason: "invalid_or_inactive" },
      },
    });

    return NextResponse.json(
      {
        error: "InvalidManageToken",
        message: "This manage link is invalid or no longer active.",
      },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  const profileLimited = await enforcePublicPinProfileRateLimit(
    request,
    profile.id,
  );
  if (profileLimited) return profileLimited;

  if (isPinLocked(profile.pinLockedUntil) && profile.pinLockedUntil) {
    return lockedResponse(profile.pinLockedUntil);
  }

  if (profile.pinLockedUntil && !isPinLocked(profile.pinLockedUntil)) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { pinLockedUntil: null },
    });
  }

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
            source: "manage",
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
        type: "MANAGE_TOKEN_OK",
        ...requestFields,
        metadata: { source: "manage" },
      },
    }),
    prisma.securityEvent.create({
      data: {
        profileId: profile.id,
        type: "PIN_VERIFY_OK",
        ...requestFields,
        metadata: { source: "manage" },
      },
    }),
  ]);

  const response = NextResponse.json(
    {
      ok: true,
      profileId: profile.id,
      qrId: profile.qrId,
      displayName: profile.displayName,
      message: "PIN accepted. You can manage this memorial.",
      sessionTtlHours: 4,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );

  applyManageSessionCookie(response, profile.id);
  return response;
}
