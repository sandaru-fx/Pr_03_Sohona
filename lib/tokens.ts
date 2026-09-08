import { createHash, randomBytes } from "crypto";

const SETUP_TOKEN_TTL_DAYS = 7;

/** Public QR / profile route id — high entropy, URL-safe. */
export function generateQrId(): string {
  return randomBytes(16).toString("base64url");
}

/** One-time setup token (plaintext returned once to admin only). */
export function generateSetupToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Long-lived manage-link token (plaintext returned once to family on setup complete). */
export function generateManageToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Hash for high-entropy setup/manage tokens.
 * SHA-256 is appropriate here; low-entropy PINs use Argon2id later.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function getSetupTokenExpiry(from: Date = new Date()): Date {
  const expires = new Date(from);
  expires.setDate(expires.getDate() + SETUP_TOKEN_TTL_DAYS);
  return expires;
}

export { SETUP_TOKEN_TTL_DAYS };
