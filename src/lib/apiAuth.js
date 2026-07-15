import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";

/** Resolve the current user (JWT payload) inside a Route Handler, or null. */
export async function currentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Guard a route handler by role. Returns { user } on success or { response }
 * containing a ready-to-return error response.
 */
export async function guard(role) {
  const user = await currentUser();
  if (!user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (role && user.role !== role) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}
