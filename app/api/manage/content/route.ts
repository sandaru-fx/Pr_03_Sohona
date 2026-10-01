import { NextResponse } from "next/server";
import {
  authorizeManageSession,
  manageAuthErrorResponse,
} from "@/lib/manage-auth";
import { loadManageOwnerContent } from "@/lib/manage-content";
import { enforceIpRateLimit } from "@/lib/rate-limit-presets";

export const runtime = "nodejs";

/**
 * GET /api/manage/content
 * Private statements + media metadata for the unlocked manage session.
 * Never returns r2ObjectKey or secret hashes.
 */
export async function GET(request: Request) {
  const ipLimited = await enforceIpRateLimit(request, "manageIp");
  if (ipLimited) return ipLimited;

  const auth = await authorizeManageSession();
  if (!auth.ok) return manageAuthErrorResponse(auth);

  const content = await loadManageOwnerContent(auth.profile.id);
  if (!content) {
    return NextResponse.json(
      {
        error: "NotFound",
        message: "Manage content is not available for this memorial.",
      },
      {
        status: 404,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  return NextResponse.json(
    {
      profile: content.profile,
      statements: content.statements,
      media: content.media,
      counts: {
        statements: content.statements.length,
        media: content.media.length,
      },
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
