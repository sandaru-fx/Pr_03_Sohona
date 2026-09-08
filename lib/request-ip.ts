/**
 * Best-effort client IP extraction for rate limits / hashed audit logs.
 * Trusts reverse-proxy headers (Vercel / common hosts). Spoofable if the app
 * is reached without a trusted proxy in front — production should sit behind one.
 */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && isPlausibleIp(first)) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isPlausibleIp(realIp)) return realIp;

  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && isPlausibleIp(cfIp)) return cfIp;

  return null;
}

function isPlausibleIp(value: string): boolean {
  if (value.length < 3 || value.length > 45) return false;
  // Basic IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return true;
  // Basic IPv6 (compressed forms allowed)
  if (/^[0-9a-f:]+$/i.test(value) && value.includes(":")) return true;
  return false;
}
