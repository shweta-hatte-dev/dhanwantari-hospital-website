import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slotsQuerySchema } from "@/lib/validation";
import { generateSlots, hospitalMidnightUtc } from "@/lib/slots";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = slotsQuerySchema.safeParse({
    doctorId: url.searchParams.get("doctorId"),
    date: url.searchParams.get("date"),
  });
  if (!parsed.success) return NextResponse.json({ error: "doctorId and date (YYYY-MM-DD) are required" }, { status: 400 });

  const doctor = await db.doctor.findUnique({ where: { id: parsed.data.doctorId }, include: { schedules: true } });
  if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  let dayStart: Date;
  try {
    dayStart = hospitalMidnightUtc(parsed.data.date);
  } catch {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);

  const busy = await db.appointment.findMany({
    where: {
      doctorId: doctor.id,
      status: { in: ["BOOKED", "CONFIRMED", "COMPLETED"] },
      startsAt: { gte: dayStart, lt: dayEnd },
    },
    select: { startsAt: true, endsAt: true },
  });

  const slots = generateSlots({
    date: parsed.data.date,
    windows: doctor.schedules,
    slotMinutes: doctor.slotMinutes,
    busy,
  });
  return NextResponse.json({ slots: slots.map((s) => s.startsAt.toISOString()) });
}
