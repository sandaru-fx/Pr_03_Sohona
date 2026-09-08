/** Day 6 DB foundation — Redis IP limits are Day 8 first line; this lock stays authoritative. */
export const PUBLIC_PIN_MAX_ATTEMPTS = 5;
export const PUBLIC_PIN_LOCK_MS = 15 * 60 * 1000;

export function isPinLocked(pinLockedUntil: Date | null | undefined): boolean {
  if (!pinLockedUntil) return false;
  return pinLockedUntil.getTime() > Date.now();
}

export function getPinLockRemainingMs(
  pinLockedUntil: Date | null | undefined,
): number {
  if (!isPinLocked(pinLockedUntil) || !pinLockedUntil) return 0;
  return Math.max(0, pinLockedUntil.getTime() - Date.now());
}

export function formatPinLockUntil(pinLockedUntil: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(pinLockedUntil);
}

export function formatPinLockRemaining(pinLockedUntil: Date): string {
  const ms = getPinLockRemainingMs(pinLockedUntil);
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  return minutes === 1 ? "about 1 minute" : `about ${minutes} minutes`;
}
