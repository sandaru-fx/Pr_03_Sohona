import argon2 from "argon2";

const PIN_PATTERN = /^\d{6}$/;

export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

export function validatePinPair(pin: string, confirmPin: string): string | null {
  if (!isValidPin(pin)) {
    return "PIN must be exactly 6 digits.";
  }
  if (pin !== confirmPin) {
    return "PIN and confirmation do not match.";
  }
  return null;
}

/** Argon2id hash for memorial PINs. Never store plaintext. */
export async function hashPin(pin: string): Promise<string> {
  if (!isValidPin(pin)) {
    throw new Error("PIN must be exactly 6 digits before hashing.");
  }

  return argon2.hash(pin, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPin(
  hashedPin: string,
  pin: string,
): Promise<boolean> {
  if (!isValidPin(pin)) return false;
  try {
    return await argon2.verify(hashedPin, pin);
  } catch {
    return false;
  }
}
