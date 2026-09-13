import { prisma } from "@/lib/prisma";
import { getServerEnv } from "@/lib/env";
import { isMongoObjectId } from "@/lib/object-id";

/** Admin-safe profile fields only — never include PIN/media/statements/comments/token hashes. */
export const adminProfileSelect = {
  id: true,
  displayName: true,
  qrId: true,
  isSetupComplete: true,
  setupTokenExpiresAt: true,
  setupUsedAt: true,
  packageId: true,
  package: {
    select: {
      name: true,
      retentionYears: true,
    }
  },
  packageStartedAt: true,
  packageEndsAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Runtime guard used by Day 3 verify + accidental select drift. */
export const ADMIN_PROFILE_FORBIDDEN_FIELDS = [
  "hashedPin",
  "setupTokenHash",
  "manageTokenHash",
  "statements",
  "mediaAssets",
  "comments",
  "securityEvents",
  "failedPinAttempts",
  "pinLockedUntil",
] as const;

export type AdminProfileListItem = {
  id: string;
  displayName: string;
  qrId: string;
  isSetupComplete: boolean;
  setupTokenExpiresAt: Date | null;
  setupUsedAt: Date | null;
  packageId: string;
  package: {
    name: string;
    retentionYears: number;
  };
  packageStartedAt: Date | null;
  packageEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listAdminProfiles(): Promise<AdminProfileListItem[]> {
  return prisma.profile.findMany({
    select: adminProfileSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminProfileById(
  id: string,
): Promise<AdminProfileListItem | null> {
  if (!isMongoObjectId(id)) {
    return null;
  }

  return prisma.profile.findUnique({
    where: { id },
    select: adminProfileSelect,
  });
}

export function getPublicProfileUrl(qrId: string): string {
  const { APP_URL } = getServerEnv();
  return `${APP_URL}/p/${qrId}`;
}

export function getSetupStatus(profile: AdminProfileListItem): {
  label: string;
  tone: "complete" | "pending" | "expired";
} {
  if (profile.isSetupComplete) {
    return { label: "Setup complete", tone: "complete" };
  }

  if (
    profile.setupTokenExpiresAt &&
    profile.setupTokenExpiresAt.getTime() < Date.now()
  ) {
    return { label: "Setup link expired", tone: "expired" };
  }

  return { label: "Awaiting family setup", tone: "pending" };
}
