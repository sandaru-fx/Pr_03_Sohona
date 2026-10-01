import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerEnv, requireEnv } from "@/lib/env";

export const PUBLIC_VIEW_COOKIE = "sohona_public_view";

/** Day 6 recommend: 12-hour public view session after PIN. */
export const PUBLIC_VIEW_SESSION_TTL_SECONDS = 12 * 60 * 60;

type SessionPayload = {
  qrId: string;
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

/** Cookie flags asserted by day6:verify (maxAge set per session). */
export function getPublicViewCookieSecurity(): {
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

export function createPublicViewSessionValue(qrId: string): {
  value: string;
  maxAge: number;
} {
  const secret = requireEnv("AUTH_SECRET");
  const trimmed = qrId.trim();
  if (!trimmed) {
    throw new Error("qrId is required for public view session.");
  }

  const exp = Math.floor(Date.now() / 1000) + PUBLIC_VIEW_SESSION_TTL_SECONDS;
  const payload: SessionPayload = { qrId: trimmed, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const sig = sign(payloadB64, secret);
  return {
    value: `${payloadB64}.${sig}`,
    maxAge: PUBLIC_VIEW_SESSION_TTL_SECONDS,
  };
}

export function parsePublicViewSessionValue(
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
      typeof parsed.qrId !== "string" ||
      !parsed.qrId.trim() ||
      typeof parsed.exp !== "number" ||
      !Number.isFinite(parsed.exp)
    ) {
      return null;
    }
    if (parsed.exp * 1000 < Date.now()) return null;
    return { qrId: parsed.qrId.trim(), exp: parsed.exp };
  } catch {
    return null;
  }
}

export function applyPublicViewSessionCookie(
  response: NextResponse,
  qrId: string,
): void {
  const { value, maxAge } = createPublicViewSessionValue(qrId);
  response.cookies.set(PUBLIC_VIEW_COOKIE, value, {
    ...getPublicViewCookieSecurity(),
    maxAge,
  });
}

export function clearPublicViewSessionCookie(response: NextResponse): void {
  response.cookies.set(PUBLIC_VIEW_COOKIE, "", {
    ...getPublicViewCookieSecurity(),
    maxAge: 0,
  });
}

/** Read cookie from the current request (Server Components / Route Handlers). */
export async function hasValidPublicViewSession(qrId: string): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(PUBLIC_VIEW_COOKIE)?.value;
  const session = parsePublicViewSessionValue(raw);
  return Boolean(session && session.qrId === qrId.trim());
}
