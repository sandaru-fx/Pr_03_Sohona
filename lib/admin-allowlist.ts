/**
 * Temple admin allow-list helpers (edge-safe — no Prisma).
 * Fail closed: empty allow-list means nobody can sign in as admin.
 */

export function getAdminAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function isAdminEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowlist = getAdminAllowlist();
  if (allowlist.length === 0) return false;
  return allowlist.includes(email.trim().toLowerCase());
}
