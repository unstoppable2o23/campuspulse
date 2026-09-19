import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { newSession, sessionCookie } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

// Simple in-memory rate limit: 10 attempts / minute / IP.
const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now > h.reset) { hits.set(ip, { count: 1, reset: now + 60_000 }); return false; }
  h.count++;
  return h.count > 10;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many attempts — wait a minute and retry." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // Constant-shape failure to avoid account enumeration timing leaks (best effort).
  const ok = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
  if (!user || !ok) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });

  const { token, signature } = newSession();
  await prisma.session.create({ data: { token, userId: user.id, expiresAt: new Date(Date.now() + 7 * 86400 * 1000) } });
  const res = NextResponse.json({ ok: true, role: user.role });
  res.headers.set("Set-Cookie", sessionCookie(token, signature));
  return res;
}
