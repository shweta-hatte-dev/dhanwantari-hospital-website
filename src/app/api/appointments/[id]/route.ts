import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/session";
import { statusUpdateSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = statusUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const { status } = parsed.data;

  const appointment = await db.appointment.findUnique({ where: { id: params.id }, include: { doctor: true } });
  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStaff = user.role === "RECEPTIONIST" || user.role === "ADMIN";
  const isOwnPatient = user.role === "PATIENT" && appointment.patientId === user.id;
  const isOwnDoctor = user.role === "DOCTOR" && appointment.doctor.userId === user.id;

  if (!isStaff && !isOwnPatient && !isOwnDoctor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (isOwnPatient && status !== "CANCELLED") return NextResponse.json({ error: "Patients can only cancel" }, { status: 403 });
  if (["CANCELLED", "COMPLETED", "NO_SHOW"].includes(appointment.status) && !isStaff) {
    return NextResponse.json({ error: "This appointment is already closed" }, { status: 400 });
  }

  const updated = await db.appointment.update({ where: { id: appointment.id }, data: { status } });
  return NextResponse.json({ appointment: updated });
}
