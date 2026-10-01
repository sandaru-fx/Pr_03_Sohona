import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmailAllowed } from "@/lib/admin-allowlist";
import { isAdminSession } from "@/lib/auth-guards";

/**
 * Protect /admin pages (redirect) and /api/admin (JSON 401).
 * Layout + requireAdmin* remain the authoritative checks.
 */
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const allowed =
    isAdminSession(req.auth) && isAdminEmailAllowed(req.auth.user.email);

  if (!allowed) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Admin sign-in required." },
        {
          status: 401,
          headers: { "Cache-Control": "no-store, max-age=0" },
        },
      );
    }

    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("error", "Unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
