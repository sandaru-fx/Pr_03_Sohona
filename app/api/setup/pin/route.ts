import { NextResponse } from "next/server";
import { hashPin } from "@/lib/pin";
import { prisma } from "@/lib/prisma";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";
import { authorizeSetupToken } from "@/lib/setup-auth";
import { setupPinSchema } from "@/lib/validators/setup-pin";

export const runtime = "nodejs";

/**
 * POST /api/setup/pin
 * Save required PIN hash + optional public-view PIN flag during setup.
 * Does not complete setup yet (statements/media finish in later phases).
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

  const parsed = setupPinSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "ValidationError",
        message: "Invalid PIN setup data.",
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
    request,
  });

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error, message: auth.message },
      { status: auth.status },
    );
  }

  const hashedPin = await hashPin(parsed.data.pin);

  await prisma.profile.update({
    where: { id: auth.profile.id },
    data: {
      hashedPin,
      isPublicPinRequired: parsed.data.isPublicPinRequired,
    },
    select: { id: true },
  });

  return NextResponse.json(
    {
      ok: true,
      profileId: auth.profile.id,
      isPublicPinRequired: parsed.data.isPublicPinRequired,
      message:
        "PIN saved. You can add memories next. Setup is not finished until you complete the full setup step.",
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
