import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";

/**
 * Read + verify the current user from the auth cookie (for Server Components).
 * Returns the JWT payload ({ sub, email, role, name }) or null.
 */
export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Require any authenticated user, else redirect to /login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require a specific role, else redirect. */
export async function requireRole(role) {
  const user = await requireUser();
  if (user.role !== role) redirect("/login");
  return user;
}
