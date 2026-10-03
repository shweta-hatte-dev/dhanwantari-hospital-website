// Integration test: needs a REAL PostgreSQL database with migrations applied and the seed run.
// It is skipped automatically unless TEST_DATABASE_URL is set, e.g. in PowerShell:
//   $env:TEST_DATABASE_URL = "postgresql://dhanwantari:change_me_db_password@localhost:5432/dhanwantari?schema=public"
//   npm test
// WARNING: it creates and then deletes its own appointments, but use a development database only.
import { afterAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("createAppointment (database)", () => {
  it("lets only one of two simultaneous bookings win the same slot", async () => {
    process.env.DATABASE_URL = url;
    const { db } = await import("../src/lib/db");
    const { createAppointment, BookingError } = await import("../src/lib/booking");
    const { generateSlots } = await import("../src/lib/slots");

    const doctor = await db.doctor.findFirstOrThrow({ include: { schedules: true } });
    const patients = await db.user.findMany({ where: { role: "PATIENT" }, take: 2 });
    const p1 = patients[0];
    const p2 =
      patients[1] ??
      (await db.user.create({ data: { name: "Test Patient 2", email: `t2-${Date.now()}@example.com`, passwordHash: "x", role: "PATIENT" } }));

    // find the first free slot within the next 14 days
    let target: Date | undefined;
    for (let i = 1; i <= 14 && !target; i++) {
      const date = new Date(Date.now() + i * 86_400_000 + 330 * 60_000).toISOString().slice(0, 10);
      const slots = generateSlots({ date, windows: doctor.schedules, slotMinutes: doctor.slotMinutes, busy: [] });
      target = slots[0]?.startsAt;
    }
    expect(target).toBeDefined();

    const results = await Promise.allSettled([
      createAppointment({ doctorId: doctor.id, patientId: p1.id, startsAt: target!, reason: "race test A" }),
      createAppointment({ doctorId: doctor.id, patientId: p2.id, startsAt: target!, reason: "race test B" }),
    ]);

    const ok = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    expect(ok).toHaveLength(1);
    expect(failed).toHaveLength(1);
    expect(failed[0].reason).toBeInstanceOf(BookingError);
    expect((failed[0].reason as InstanceType<typeof BookingError>).status).toBe(409);

    await db.appointment.deleteMany({ where: { reason: { startsWith: "race test" } } });
  });

  afterAll(async () => {
    if (url) {
      const { db } = await import("../src/lib/db");
      await db.$disconnect();
    }
  });
});
