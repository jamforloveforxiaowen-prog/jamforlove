import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "");

const protectedPaths = ["/order", "/my-orders"];
const adminPaths = ["/admin"];
const authPaths = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  let user: { role?: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      user = payload as { role?: string };
    } catch {
      // invalid token
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
  matcher: ["/order/:path*", "/my-orders/:path*", "/admin/:path*", "/login", "/register"],
};
