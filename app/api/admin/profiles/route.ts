import { Prisma } from "@prisma/client";
import { getServerEnv } from "@/lib/env";
import { listAdminProfiles } from "@/lib/admin-profiles";
import { prisma } from "@/lib/prisma";
import { adminJson, requireAdminApi } from "@/lib/require-admin";
import {
  generateQrId,
  generateSetupToken,
  getSetupTokenExpiry,
  hashToken,
  SETUP_TOKEN_TTL_DAYS,
} from "@/lib/tokens";
import { createProfileSchema } from "@/lib/validators/profile";

export const runtime = "nodejs";

/**
 * GET /api/admin/profiles
 * Admin-safe profile list (no private content / token hashes).
 */
export async function GET(request: Request) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  const profiles = await listAdminProfiles();
  return adminJson({ profiles });
}

/**
 * POST /api/admin/profiles
 * Admin creates a memorial profile (display name only).
 * Returns the one-time setup URL once — token is stored hashed only.
 */
export async function POST(request: Request) {
  const gate = await requireAdminApi(request);
  if (gate.error) return gate.error;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return adminJson(
      { error: "InvalidJSON", message: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const parsed = createProfileSchema.safeParse(json);
  if (!parsed.success) {
    return adminJson(
      {
        error: "ValidationError",
        message: "Invalid profile data.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const { APP_URL } = getServerEnv();
  const displayName = parsed.data.displayName;
  const setupToken = generateSetupToken();
  const setupTokenHash = hashToken(setupToken);
  const setupTokenExpiresAt = getSetupTokenExpiry();

  let profile;
  let qrId = generateQrId();

  try {
    profile = await prisma.profile.create({
      data: {
        displayName,
        qrId,
        setupTokenHash,
        setupTokenExpiresAt,
        isSetupComplete: false,
        packageTier: "A",
        createdByAdminId: gate.session.user.id,
      },
      select: {
        id: true,
        displayName: true,
        qrId: true,
        isSetupComplete: true,
        setupTokenExpiresAt: true,
        packageTier: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      qrId = generateQrId();
      profile = await prisma.profile.create({
        data: {
          displayName,
          qrId,
          setupTokenHash,
          setupTokenExpiresAt,
          isSetupComplete: false,
          packageTier: "A",
          createdByAdminId: gate.session.user.id,
        },
        select: {
          id: true,
          displayName: true,
          qrId: true,
          isSetupComplete: true,
          setupTokenExpiresAt: true,
          packageTier: true,
          createdAt: true,
        },
      });
    } else {
      console.error("Failed to create profile", error);
      return adminJson(
        { error: "ServerError", message: "Could not create profile." },
        { status: 500 },
      );
    }
  }

  const setupUrl = `${APP_URL}/setup/${setupToken}`;
  const publicUrl = `${APP_URL}/p/${profile.qrId}`;

  return adminJson(
    {
      profile,
      setup: {
        url: setupUrl,
        expiresAt: profile.setupTokenExpiresAt,
        ttlDays: SETUP_TOKEN_TTL_DAYS,
        warning:
          "Copy this setup URL now. It cannot be shown again after you leave this page.",
      },
      publicUrl,
    },
    { status: 201 },
  );
}
