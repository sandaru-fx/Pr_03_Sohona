import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { computePackageWindow } from "@/lib/packages";
import { prisma } from "@/lib/prisma";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";
import { securityEventRequestFields } from "@/lib/request-identity";
import { authorizeSetupToken } from "@/lib/setup-auth";
import { generateManageToken, hashToken } from "@/lib/tokens";
import { setupCompleteSchema } from "@/lib/validators/setup-complete";

export const runtime = "nodejs";

/**
 * POST /api/setup/complete
 * Finalize family setup: invalidate setup token, issue manage token once.
 * Starts package retention clock (packageStartedAt / packageEndsAt).
 * Uses a conditional update so parallel completes cannot mint two manage tokens.
 */
export async function POST(request: Request) {
  const ipLimited = await enforceIpRateLimit(request, "setupIp");
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

  const parsed = setupCompleteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "ValidationError",
        message: "Invalid complete-setup payload.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const auth = await authorizeSetupToken({
    profileId: parsed.data.profileId,
    setupToken: parsed.data.setupToken,
    recordSuccess: true,
    request,
  });

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error, message: auth.message },
      { status: auth.status },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { id: auth.profile.id },
    select: {
      id: true,
      displayName: true,
      qrId: true,
      hashedPin: true,
      isSetupComplete: true,
      manageTokenHash: true,
      packageTier: true,
    },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "NotFound", message: "Profile was not found." },
      { status: 404 },
    );
  }

  if (profile.isSetupComplete || profile.manageTokenHash) {
    return NextResponse.json(
      {
        error: "SetupAlreadyComplete",
        message: "This profile setup is already complete.",
      },
      { status: 409 },
    );
  }

  if (!profile.hashedPin) {
    return NextResponse.json(
      {
        error: "PinRequired",
        message: "Save a PIN before finishing setup.",
      },
      { status: 400 },
    );
  }

  const manageToken = generateManageToken();
  const manageTokenHash = hashToken(manageToken);
  const setupUsedAt = new Date();
  const packageWindow = computePackageWindow(setupUsedAt, profile.packageTier);

  const updated = await prisma.profile.updateMany({
    where: {
      id: profile.id,
      isSetupComplete: false,
      setupTokenHash: { not: null },
      manageTokenHash: null,
    },
    data: {
      isSetupComplete: true,
      setupUsedAt,
      setupTokenHash: null,
      setupTokenExpiresAt: null,
      manageTokenHash,
      packageStartedAt: packageWindow.packageStartedAt,
      packageEndsAt: packageWindow.packageEndsAt,
    },
  });

  if (updated.count !== 1) {
    return NextResponse.json(
      {
        error: "SetupAlreadyComplete",
        message: "This profile setup is already complete.",
      },
      { status: 409 },
    );
  }

  await prisma.securityEvent.create({
    data: {
      profileId: profile.id,
      type: "SETUP_COMPLETED",
      ...securityEventRequestFields(request),
      metadata: {
        source: "family_setup",
        packageTier: profile.packageTier,
        retentionYears: packageWindow.retentionYears,
      },
    },
  });

  const { APP_URL } = getServerEnv();
  const manageUrl = `${APP_URL}/manage/${manageToken}`;
  const publicUrl = `${APP_URL}/p/${profile.qrId}`;

  return NextResponse.json(
    {
      ok: true,
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        qrId: profile.qrId,
        isSetupComplete: true,
        setupUsedAt,
        packageTier: profile.packageTier,
        packageStartedAt: packageWindow.packageStartedAt,
        packageEndsAt: packageWindow.packageEndsAt,
      },
      manage: {
        url: manageUrl,
        warning:
          "Copy this manage link now. It cannot be shown again. Keep it private — anyone with this link can request manage access (PIN still required to edit).",
      },
      publicUrl,
      message: "Setup complete. Your private manage link is ready.",
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
