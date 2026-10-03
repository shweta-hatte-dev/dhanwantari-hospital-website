import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

// Sends each signed-in user to the dashboard for their role.
export default async function DashboardRouter() {
  const user = await requireRole(["PATIENT", "DOCTOR", "RECEPTIONIST", "ADMIN"]);
  const target: Record<string, string> = {
    PATIENT: "/dashboard/patient",
    DOCTOR: "/dashboard/doctor",
    RECEPTIONIST: "/dashboard/reception",
    ADMIN: "/dashboard/admin",
  };
  redirect(target[user.role] ?? "/");
}
