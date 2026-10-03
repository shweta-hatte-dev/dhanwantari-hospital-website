import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export type AppRole = "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN";

export async function getSession() {
  return getServerSession(authOptions);
}

/** For server components/pages: redirects to login if not signed in or role not allowed. */
export async function requireRole(roles: AppRole[]) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!roles.includes(session.user.role as AppRole)) redirect("/dashboard");
  return session.user;
}

/** For API routes: returns the user or null. */
export async function apiUser(roles?: AppRole[]) {
  const session = await getSession();
  if (!session?.user) return null;
  if (roles && !roles.includes(session.user.role as AppRole)) return null;
  return session.user;
}
