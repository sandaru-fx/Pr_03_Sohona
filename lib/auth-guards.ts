import type { Session } from "next-auth";

/** True only when session belongs to an allow-listed temple admin. */
export function isAdminSession(
  session: Session | null | undefined,
): session is Session & { user: { id: string; role: "ADMIN" } } {
  return Boolean(session?.user?.id && session.user.role === "ADMIN");
}
