import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/session";
import { bookingSchema } from "@/lib/validation";
import { BookingError, createAppointment } from "@/lib/booking";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let where = {};
  if (user.role === "PATIENT") where = { patientId: user.id };
  else if (user.role === "DOCTOR") {
    const doctor = await db.doctor.findUnique({ where: { userId: user.id } });
    where = { doctorId: doctor?.id ?? "none" };
  }
  const appointments = await db.appointment.findMany({
    where,
    orderBy: { startsAt: "asc" },
    take: 200,
    include: { doctor: { include: { user: { select: { name: true } } } }, patient: { select: { name: true, phone: true } } },
  });
  return NextResponse.json({ appointments });
}

export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return NextResponse.json({ error: "Please sign in to book" }, { status: 401 });
  if (!rateLimit(`book:${user.id}`, 20, 60 * 60_000)) {
    return NextResponse.json({ error: "Too many booking attempts. Try later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  let patientId = user.id;
  if (parsed.data.patientId) {
    if (user.role !== "RECEPTIONIST" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    patientId = parsed.data.patientId;
  } else if (user.role !== "PATIENT") {
    return NextResponse.json({ error: "Staff must choose a patient to book for" }, { status: 400 });
  }

  try {
    const appointment = await createAppointment({
      doctorId: parsed.data.doctorId,
      patientId,
      startsAt: new Date(parsed.data.startsAt),
      reason: parsed.data.reason,
    });
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Could not book appointment" }, { status: 500 });
  }
}
