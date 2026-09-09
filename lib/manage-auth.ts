import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isMongoObjectId } from "@/lib/object-id";
import { prisma } from "@/lib/prisma";
import {
  MANAGE_SESSION_COOKIE,
  parseManageSessionValue,
} from "@/lib/manage-session";

export type ManageAuthProfile = {
  id: string;
  qrId: string;
  displayName: string;
  isPublicPinRequired: boolean;
  isSetupComplete: boolean;
  packageTier: "A" | "B" | "C";
};

export type ManageAuthSuccess = {
  ok: true;
  profile: ManageAuthProfile;
};

export type ManageAuthFailure = {
  ok: false;
  status: number;
  error: string;
  message: string;
};

/**
 * Authorize manage/edit APIs via the sohona_manage session cookie.
 * Manage link alone is never enough — PIN session required.
 */
export async function authorizeManageSession(): Promise<
  ManageAuthSuccess | ManageAuthFailure
> {
  const jar = await cookies();
  const raw = jar.get(MANAGE_SESSION_COOKIE)?.value;
  const session = parseManageSessionValue(raw);

  if (!session) {
    return {
      ok: false,
      status: 401,
      error: "ManageSessionRequired",
      message: "Enter your memorial PIN to manage this profile.",
    };
  }

  if (!isMongoObjectId(session.profileId)) {
    return {
      ok: false,
      status: 401,
      error: "ManageSessionRequired",
      message: "Enter your memorial PIN to manage this profile.",
    };
  }

  const profile = await prisma.profile.findUnique({
    where: { id: session.profileId },
    select: {
      id: true,
      qrId: true,
      displayName: true,
      isPublicPinRequired: true,
      isSetupComplete: true,
      packageTier: true,
      hashedPin: true,
      manageTokenHash: true,
    },
  });

  if (
    !profile ||
    !profile.isSetupComplete ||
    !profile.hashedPin ||
    !profile.manageTokenHash
  ) {
    return {
      ok: false,
      status: 401,
      error: "ManageSessionRequired",
      message: "Manage access is no longer available for this memorial.",
    };
  }

  return {
    ok: true,
    profile: {
      id: profile.id,
      qrId: profile.qrId,
      displayName: profile.displayName,
      isPublicPinRequired: profile.isPublicPinRequired,
      isSetupComplete: profile.isSetupComplete,
      packageTier: profile.packageTier,
    },
  };
}

export function manageAuthErrorResponse(
  auth: ManageAuthFailure,
): NextResponse {
  return NextResponse.json(
    { error: auth.error, message: auth.message },
    {
      status: auth.status,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
