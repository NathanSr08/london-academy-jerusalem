import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";

/**
 * Edge middleware guarding the two secure portals and their API namespaces.
 * Uses `jose` (Edge-compatible) for JWT verification.
 */
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isTeacherArea =
    pathname.startsWith("/teacher") || pathname.startsWith("/api/teacher");

  if (isAdminArea) {
    if (!user) return redirectToLogin(req, pathname);
    if (user.role !== "admin") return forbid(req);
  }

  if (isTeacherArea) {
    if (!user) return redirectToLogin(req, pathname);
    if (user.role !== "tutor") return forbid(req);
  }

  return NextResponse.next();
}

function redirectToLogin(req, from) {
  // API routes get a JSON 401 instead of an HTML redirect.
  if (from.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", from);
  return NextResponse.redirect(url);
}

function forbid(req) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/api/admin/:path*", "/api/teacher/:path*"],
};
