"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isAdminEmailAllowedDb } from "@/lib/admin-allowlist";
import { isAdminSession } from "@/lib/auth-guards";
import { generateSetupToken, getSetupTokenExpiry, hashToken } from "@/lib/tokens";
import { getServerEnv } from "@/lib/env";

export async function regenerateSetupLink(profileId: string) {
  const session = await auth();
  if (!isAdminSession(session) || !(await isAdminEmailAllowedDb(session.user.email))) {
    return { error: "Unauthorized" };
  }
  
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { isSetupComplete: true }
  });

  if (!profile) {
    return { error: "Profile not found" };
  }

  if (profile.isSetupComplete) {
    return { error: "Setup is already complete" };
  }

  const setupToken = generateSetupToken();
  const setupTokenHash = hashToken(setupToken);
  const setupTokenExpiresAt = getSetupTokenExpiry();

  await prisma.profile.update({
    where: { id: profileId },
    data: {
      setupTokenHash,
      setupTokenExpiresAt,
    }
  });

  revalidatePath(`/admin/profiles/${profileId}`);
  
  const { APP_URL } = getServerEnv();
  return {
    success: true,
    setupUrl: `${APP_URL}/setup/${setupToken}`,
    expiresAt: setupTokenExpiresAt
  };
}
