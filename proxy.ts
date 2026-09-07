import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminSession } from "@/lib/auth-guards";

/**
 * Day 2 Phase 2.4 — protect /admin/* (Next.js 16 uses proxy.ts, not middleware.ts).
 * Optimistic gate only; admin layout also re-checks the session authoritatively.
 */
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!isAdminSession(req.auth)) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("error", "Unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
