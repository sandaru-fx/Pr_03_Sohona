import { NextResponse } from "next/server";
import {
  authorizeManageSession,
  manageAuthErrorResponse,
} from "@/lib/manage-auth";
import { prisma } from "@/lib/prisma";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";
import { manageSettingsSchema } from "@/lib/validators/manage-settings";

export const runtime = "nodejs";

/**
 * PATCH /api/manage/settings
 * Update owner-safe settings (public PIN gate only). displayName stays read-only.
 */
export async function PATCH(request: Request) {
  const ipLimited = await enforceIpRateLimit(request, "manageIp");
  if (ipLimited) return ipLimited;

  const auth = await authorizeManageSession();
  if (!auth.ok) return manageAuthErrorResponse(auth);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "InvalidJSON", message: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const parsed = manageSettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "ValidationError",
        message: "Invalid settings payload.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const profile = await prisma.profile.update({
    where: { id: auth.profile.id },
    data: { isPublicPinRequired: parsed.data.isPublicPinRequired },
    select: {
      id: true,
      displayName: true,
      qrId: true,
      isPublicPinRequired: true,
    },
  });

  return NextResponse.json(
    {
      profile,
      message: parsed.data.isPublicPinRequired
        ? "Public QR visitors will need the memorial PIN."
        : "Public QR visitors can view without a PIN. Manage access still always requires PIN.",
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
