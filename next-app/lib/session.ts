import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const COOKIE = "cp_session";
const MAX_AGE = 7 * 86400;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function sign(token: string): string {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

/** Create a new session token + signature for the Set-Cookie header value. */
export function newSession(): { token: string; signature: string } {
  const token = randomBytes(32).toString("hex");
  return { token, signature: sign(token) };
}

export function sessionCookie(token: string, signature: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${token}.${signature}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/** Parse + verify the Cookie header. Returns the raw token or null. */
export function verifySessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const m = cookieHeader.match(/(?:^|;\s*)cp_session=([^;]+)/);
  if (!m) return null;
  const [token, sig] = m[1].split(".");
  if (!token || !sig) return null;
  try {
    const expected = sign(token);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return token;
  } catch {
    return null;
  }
}
