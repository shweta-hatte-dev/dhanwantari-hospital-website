import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiUser } from "@/lib/session";
import { scheduleSchema } from "@/lib/validation";
import { parseHHMM } from "@/lib/slots";

export async function POST(req: Request) {
  const admin = await apiUser(["ADMIN", "RECEPTIONIST"]);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = scheduleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid schedule" }, { status: 400 });
  const { doctorId, weekday, startTime, endTime } = parsed.data;
  if (parseHHMM(endTime) <= parseHHMM(startTime)) {
    return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
  }
  const schedule = await db.doctorSchedule.upsert({
    where: { doctorId_weekday_startTime: { doctorId, weekday, startTime } },
    update: { endTime },
    create: { doctorId, weekday, startTime, endTime },
  });
  return NextResponse.json({ schedule }, { status: 201 });
}

export async function DELETE(req: Request) {
  const admin = await apiUser(["ADMIN", "RECEPTIONIST"]);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.doctorSchedule.delete({ where: { id } }).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
