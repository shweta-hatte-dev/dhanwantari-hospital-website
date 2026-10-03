import Link from "next/link";
import { requireRole } from "@/lib/session";
import { fetchAppointmentRows } from "@/lib/appointment-queries";
import AppointmentTable from "@/components/AppointmentTable";

export const dynamic = "force-dynamic";

export default async function PatientDashboard() {
  const user = await requireRole(["PATIENT"]);
  const rows = await fetchAppointmentRows({ patientId: user.id });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">
          Welcome, {user.name}
        </h1>

        <Link href="/book" className="btn">
          Book new appointment
        </Link>
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold">
        My appointments
      </h2>

      <AppointmentTable
        rows={rows}
        cancelStatuses={["BOOKED", "CONFIRMED"]}
      />
    </div>
  );
}