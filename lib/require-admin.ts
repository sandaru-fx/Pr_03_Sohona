import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isAdminEmailAllowed } from "@/lib/admin-allowlist";
import { isAdminSession } from "@/lib/auth-guards";

export type AdminSession = Session & {
  user: { id: string; role: "ADMIN" };
};

function isActiveAdmin(session: Session | null): session is AdminSession {
  return (
    isAdminSession(session) && isAdminEmailAllowed(session.user.email)
  );
}

/** JSON no-store helper for admin APIs. */
export function adminJson(
  body: unknown,
  init?: { status?: number },
): NextResponse {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

/**
 * API guard: ADMIN role + current allow-list membership required.
 */
export async function requireAdminApi(): Promise<
  { session: AdminSession; error?: undefined } | { session?: undefined; error: NextResponse }
> {
  const session = await auth();

  if (!isActiveAdmin(session)) {
    return {
      error: adminJson(
        { error: "Unauthorized", message: "Admin sign-in required." },
        { status: 401 },
      ),
    };
  }

  return { session };
}

/**
 * Page guard: authoritative check (in addition to proxy + layout).
 */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await auth();

  if (!isActiveAdmin(session)) {
    redirect("/login?error=Unauthorized&callbackUrl=/admin");
  }

  return session;
}
