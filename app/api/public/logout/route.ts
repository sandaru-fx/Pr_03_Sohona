import { NextResponse } from "next/server";
import { clearPublicViewSessionCookie } from "@/lib/public-view-session";

export const runtime = "nodejs";

/**
 * POST /api/public/logout
 * Clears the public memorial view session cookie on this device.
 */
export async function POST() {
  const response = NextResponse.json(
    { ok: true, message: "Public view session cleared." },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
  clearPublicViewSessionCookie(response);
  return response;
}
