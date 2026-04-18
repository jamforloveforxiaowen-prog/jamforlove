import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// M2: JWT_SECRET 未設定時拋出錯誤，不允許以空字串作為 fallback
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

const protectedPaths = ["/order", "/my-orders"];
const adminPaths = ["/admin"];
const authPaths = ["/login", "/register"];

// M1: 速率限制 — 以 IP 為單位的 sliding window（in-memory）
// 格式：key -> { count, windowStart }
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

const RATE_LIMIT_RULES: Record<string, { maxRequests: number; windowMs: number }> = {
  "/api/auth/login": { maxRequests: 5, windowMs: 60_000 },
  "/api/auth/register": { maxRequests: 3, windowMs: 60_000 },
};

function checkRateLimit(ip: string, path: string): boolean {
  const rule = RATE_LIMIT_RULES[path];
  if (!rule) return true; // 此路徑不限速

  const now = Date.now();
  const key = `${ip}:${path}`;
  const record = rateLimitStore.get(key);

  if (!record || now - record.windowStart >= rule.windowMs) {
    // 新視窗：重置計數
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= rule.maxRequests) {
    return false; // 超過限制
  }

  record.count += 1;
  return true;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // M1: 對特定 API 路徑套用速率限制
  if (path in RATE_LIMIT_RULES) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (!checkRateLimit(ip, path)) {
      return NextResponse.json(
        { error: "Too many requests, please try again later" },
        { status: 429 }
      );
    }
  }

  const token = req.cookies.get("token")?.value;

  let user: { role?: string } | null = null;
  if (token) {
    try {
      const secret = getSecret();
      const { payload } = await jwtVerify(token, secret);
      user = payload as { role?: string };
    } catch {
      // invalid token 或 JWT_SECRET 未設定（伺服器設定錯誤，安全失敗）
    }
  }

  // Redirect logged-in users away from auth pages
  if (authPaths.some((p) => path.startsWith(p)) && user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect member pages
  if (protectedPaths.some((p) => path.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect admin pages
  if (adminPaths.some((p) => path.startsWith(p))) {
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/order/:path*",
    "/my-orders/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
  ],
};
