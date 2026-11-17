import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../services/auth/auth.service";
import { verifyToken } from "../lib/jwt";

// get auth user
export async function getAuthenticatedUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  // checking user auth/me
  const result = await getCurrentUser(token);

  if (!result.success || !result.data) {
    return null;
  }

  return result.data.user;
}

// protect non user visit page
export async function requireAuth() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

// protect role visit other role page
export async function requireRole(
  allowedRoles: string[]
) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}