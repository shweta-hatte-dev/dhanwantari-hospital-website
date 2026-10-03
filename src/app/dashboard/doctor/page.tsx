import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { fetchAppointmentRows } from "@/lib/appointment-queries";
import AppointmentTable from "@/components/AppointmentTable";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function DoctorDashboard() {
  const user = await requireRole(["DOCTOR"]);
  const doctor = await db.doctor.findUnique({ where: { userId: user.id }, include: { schedules: { orderBy: [{ weekday: "asc" }, { startTime: "asc" }] } } });
  if (!doctor) {
    return <div className="mx-auto max-w-3xl px-4 py-10">No doctor profile is linked to this account. Ask an administrator.</div>;
  }
  const rows = await fetchAppointmentRows({ doctorId: doctor.id });
  const upcoming = rows.filter((r) => new Date(r.startsAt) >= new Date() && ["BOOKED", "CONFIRMED"].includes(r.status));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-900">{user.name}</h1>
      <p className="text-sm text-slate-500">{upcoming.length} upcoming appointment(s)
        {upcoming[0] ? `, next: ${formatDateTime(upcoming[0].startsAt)}` : ""}</p>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Appointments</h2>
      <AppointmentTable
        rows={rows}
        actionsFor={(s) =>
          s === "BOOKED"
            ? [{ label: "Confirm", status: "CONFIRMED" }, { label: "Cancel", status: "CANCELLED" }]
            : s === "CONFIRMED"
              ? [{ label: "Complete", status: "COMPLETED" }, { label: "No show", status: "NO_SHOW" }, { label: "Cancel", status: "CANCELLED" }]
              : []
        }
      />

      <h2 className="mt-10 mb-3 text-lg font-semibold">My weekly schedule</h2>
      {doctor.schedules.length === 0 ? (
        <p className="text-sm text-slate-500">No schedule set. Ask reception or an administrator to add working hours.</p>
      ) : (
        <ul className="text-sm">
          {doctor.schedules.map((s) => (
            <li key={s.id}>{days[s.weekday]}: {s.startTime} - {s.endTime}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
