import Link from "next/link";
import { requireRole } from "@/lib/session";
import { fetchAppointmentRows } from "@/lib/appointment-queries";
import AppointmentTable from "@/components/AppointmentTable";

export const dynamic = "force-dynamic";

export default async function ReceptionDashboard() {
  await requireRole(["RECEPTIONIST", "ADMIN"]);
  const since = new Date(Date.now() - 24 * 60 * 60_000);
  const rows = await fetchAppointmentRows({ startsAt: { gte: since } }, 300);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Reception desk</h1>
        <Link href="/book" className="btn">Book for a patient</Link>
      </div>
      <h2 className="mt-8 mb-3 text-lg font-semibold">Upcoming appointments (all doctors)</h2>
      <AppointmentTable
        rows={rows}
        
        cancelStatuses={["BOOKED", "CONFIRMED"]}
      />
    </div>
  );
}
