import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerEnv, requireEnv } from "@/lib/env";

export const MANAGE_SESSION_COOKIE = "sohona_manage";

/** Day 9: 4-hour manage session after PIN (separate from public view). */
export const MANAGE_SESSION_TTL_SECONDS = 4 * 60 * 60;

type SessionPayload = {
  profileId: string;
  exp: number;
};

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a, "utf8");
    const right = Buffer.from(b, "utf8");
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

/** Cookie flags for manage session (maxAge set per session). */
export function getManageCookieSecurity(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
} {
  const { NODE_ENV } = getServerEnv();
  return {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export function createManageSessionValue(profileId: string): {
  value: string;
  maxAge: number;
} {
  const secret = requireEnv("AUTH_SECRET");
  const trimmed = profileId.trim();
  if (!trimmed) {
    throw new Error("profileId is required for manage session.");
  }

  const exp = Math.floor(Date.now() / 1000) + MANAGE_SESSION_TTL_SECONDS;
  const payload: SessionPayload = { profileId: trimmed, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const sig = sign(payloadB64, secret);
  return {
    value: `${payloadB64}.${sig}`,
    maxAge: MANAGE_SESSION_TTL_SECONDS,
  };
}

export function parseManageSessionValue(
  raw: string | undefined | null,
): SessionPayload | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return null;

  let secret: string;
  try {
    secret = requireEnv("AUTH_SECRET");
  } catch {
    return null;
  }

  const expected = sign(payloadB64, secret);
  if (!safeEqual(sig, expected)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (
      typeof parsed.profileId !== "string" ||
      !parsed.profileId.trim() ||
      typeof parsed.exp !== "number" ||
      !Number.isFinite(parsed.exp)
    ) {
      return null;
    }
    if (parsed.exp * 1000 < Date.now()) return null;
    return { profileId: parsed.profileId.trim(), exp: parsed.exp };
  } catch {
    return null;
  }
}

export function applyManageSessionCookie(
  response: NextResponse,
  profileId: string,
): void {
  const { value, maxAge } = createManageSessionValue(profileId);
  response.cookies.set(MANAGE_SESSION_COOKIE, value, {
    ...getManageCookieSecurity(),
    maxAge,
  });
}

export function clearManageSessionCookie(response: NextResponse): void {
  response.cookies.set(MANAGE_SESSION_COOKIE, "", {
    ...getManageCookieSecurity(),
    maxAge: 0,
  });
}

/** Read cookie from the current request (Server Components / Route Handlers). */
export async function hasValidManageSession(
  profileId: string,
): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(MANAGE_SESSION_COOKIE)?.value;
  const session = parseManageSessionValue(raw);
  return Boolean(session && session.profileId === profileId.trim());
}
