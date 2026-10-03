import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { fetchAppointmentRows } from "@/lib/appointment-queries";
import AppointmentTable from "@/components/AppointmentTable";
import StaffForm from "@/components/StaffForm";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireRole(["ADMIN"]);
  const [patients, doctors, appointments, booked, users] = await Promise.all([
    db.user.count({ where: { role: "PATIENT" } }),
    db.doctor.count(),
    db.appointment.count(),
    db.appointment.count({ where: { status: { in: ["BOOKED", "CONFIRMED"] }, startsAt: { gte: new Date() } } }),
    db.user.findMany({ where: { role: { not: "PATIENT" } }, select: { id: true, name: true, email: true, role: true }, orderBy: { role: "asc" } }),
  ]);
  const rows = await fetchAppointmentRows({}, 100);

  const stats = [
    { label: "Patients", value: patients },
    { label: "Doctors", value: doctors },
    { label: "Total appointments", value: appointments },
    { label: "Upcoming", value: booked },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-900">Administration</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-3xl font-bold text-brand-700">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-3 text-lg font-semibold">Create staff account</h2>
      <div className="card"><StaffForm /></div>

      <h2 className="mt-10 mb-3 text-lg font-semibold">Staff and doctors</h2>
      <ul className="divide-y rounded-lg border text-sm">
        {users.map((u) => (
          <li key={u.id} className="flex justify-between px-4 py-2">
            <span>{u.name} <span className="text-slate-500">({u.email})</span></span>
            <span className="font-semibold">{u.role}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 mb-3 text-lg font-semibold">Recent appointments</h2>
      <AppointmentTable
        rows={rows}
        actionsFor={(s) => (["BOOKED", "CONFIRMED"].includes(s) ? [{ label: "Cancel", status: "CANCELLED" }] : [])}
      />
    </div>
  );
}
