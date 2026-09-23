import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";
import { authorizeSetupToken } from "@/lib/setup-auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const ipLimited = await enforceIpRateLimit(request, "setupIp");
  if (ipLimited) return ipLimited;

  let body: { profileId: string; setupToken: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "InvalidJSON" }, { status: 400 });
  }

  const { profileId, setupToken, description } = body;
  if (!profileId || !setupToken) {
    return NextResponse.json(
      { error: "MissingFields", message: "profileId and setupToken are required." },
      { status: 400 }
    );
  }

  const auth = await authorizeSetupToken({ profileId, setupToken, request });
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error, message: auth.message },
      { status: auth.status }
    );
  }

  const { id } = await context.params;

  try {
    const media = await prisma.mediaAsset.updateMany({
      where: { id, profileId: auth.profile.id },
      data: { description },
    });

    if (media.count === 0) {
      return NextResponse.json({ error: "NotFound" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to update media description", error);
    return NextResponse.json({ error: "ServerError" }, { status: 500 });
  }
}
