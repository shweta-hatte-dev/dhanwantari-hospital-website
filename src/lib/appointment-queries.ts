import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { AppointmentRow } from "@/components/AppointmentTable";

export async function fetchAppointmentRows(where: Prisma.AppointmentWhereInput, take = 200): Promise<AppointmentRow[]> {
  const items = await db.appointment.findMany({
    where,
    orderBy: { startsAt: "asc" },
    take,
    include: {
      doctor: { include: { user: { select: { name: true } } } },
      patient: { select: { name: true } },
    },
  });
  return items.map((a) => ({
    id: a.id,
    startsAt: a.startsAt.toISOString(),
    status: a.status,
    reason: a.reason,
    doctorName: a.doctor.user.name,
    patientName: a.patient.name,
  }));
}
