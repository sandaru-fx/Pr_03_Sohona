import { prisma } from "@/lib/prisma";
import { hasValidPublicViewSession } from "@/lib/public-view-session";

export type PublicMemorialAccessSuccess = {
  ok: true;
  profile: {
    id: string;
    qrId: string;
    displayName: string;
    isPublicPinRequired: boolean;
    packageTier: "A" | "B" | "C";
  };
};

export type PublicMemorialAccessFailure = {
  ok: false;
  status: number;
  error: string;
  message: string;
};

/**
 * Authorize public QR memorial actions (view content, post comments).
 * Open profiles: setup complete is enough.
 * PIN-required: valid sohona_public_view session for that qrId.
 */
export async function authorizePublicMemorialByQrId(
  rawQrId: string,
): Promise<PublicMemorialAccessSuccess | PublicMemorialAccessFailure> {
  const qrId = rawQrId.trim();
  if (!qrId || qrId.length > 128) {
    return {
      ok: false,
      status: 400,
      error: "InvalidQrId",
      message: "qrId is invalid.",
    };
  }

  const profile = await prisma.profile.findUnique({
    where: { qrId },
    select: {
      id: true,
      qrId: true,
      displayName: true,
      isSetupComplete: true,
      isPublicPinRequired: true,
      packageTier: true,
    },
  });

  if (!profile || !profile.isSetupComplete) {
    return {
      ok: false,
      status: 404,
      error: "NotFound",
      message: "This memorial could not be found or is not ready yet.",
    };
  }

  if (profile.isPublicPinRequired) {
    const allowed = await hasValidPublicViewSession(profile.qrId);
    if (!allowed) {
      return {
        ok: false,
        status: 401,
        error: "PinSessionRequired",
        message: "Enter the memorial PIN before continuing.",
      };
    }
  }

  return {
    ok: true,
    profile: {
      id: profile.id,
      qrId: profile.qrId,
      displayName: profile.displayName,
      isPublicPinRequired: profile.isPublicPinRequired,
      packageTier: profile.packageTier,
    },
  };
}
