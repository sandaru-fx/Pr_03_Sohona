import { NextResponse } from "next/server";
import { clearManageSessionCookie } from "@/lib/manage-session";

export const runtime = "nodejs";

/**
 * POST /api/manage/logout
 * Clears the manage session cookie on this device (does not touch public view).
 */
export async function POST() {
  const response = NextResponse.json(
    { ok: true, message: "Manage session cleared." },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
  clearManageSessionCookie(response);
  return response;
}
