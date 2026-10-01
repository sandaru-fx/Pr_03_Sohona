/**
 * Temple admin allow-list helpers.
 *
 * Access is granted when EITHER:
 *   1) The email is in the ADMIN_EMAIL_ALLOWLIST env var (comma-separated), OR
 *   2) The email exists in the AdminInvite collection in the database.
 *
 * The env var acts as a bootstrap "super-admin" list so the very first admin
 * can log in and then add more admins via the Settings UI.
 *
 * isAdminEmailAllowed() is edge-safe (no Prisma) — used only for the env check.
 * isAdminEmailAllowedDb() is the full check (env + DB) — use in Node runtime.
 */

import { prisma } from "@/lib/prisma";

export function getAdminAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/** Edge-safe: checks only the env var allowlist. */
export function isAdminEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowlist = getAdminAllowlist();
  if (allowlist.length === 0) return false;
  return allowlist.includes(email.trim().toLowerCase());
}

/**
 * Full check (env + DB). Use this in Node runtime API routes / page guards.
 * Returns true if the email is in the env allowlist OR in AdminInvite table.
 */
export async function isAdminEmailAllowedDb(
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();

  // 1) Env var check (fast)
  const envList = getAdminAllowlist();
  if (envList.includes(normalized)) return true;

  // 2) DB invite check
  try {
    const invite = await prisma.adminInvite.findUnique({
      where: { email: normalized },
    });
    return invite !== null;
  } catch {
    return false;
  }
}
