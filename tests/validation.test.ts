import { describe, expect, it } from "vitest";
import { bookingSchema, registerSchema, scheduleSchema } from "../src/lib/validation";

describe("registerSchema", () => {
  const base = { name: "Asha Patil", email: "ASHA@Example.com", password: "Secret123" };

  it("normalises email and accepts a valid payload", () => {
    const r = registerSchema.parse(base);
    expect(r.email).toBe("asha@example.com");
  });

  it("rejects weak passwords", () => {
    expect(registerSchema.safeParse({ ...base, password: "short1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "onlyletters" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "12345678" }).success).toBe(false);
  });

  it("does not allow choosing a role during registration", () => {
    const r = registerSchema.parse({ ...base, role: "ADMIN" });
    expect(r).not.toHaveProperty("role");
  });
});

describe("bookingSchema", () => {
  it("requires an ISO datetime and a reason", () => {
    expect(bookingSchema.safeParse({ doctorId: "d1", startsAt: "2030-01-07T04:30:00.000Z", reason: "Fever" }).success).toBe(true);
    expect(bookingSchema.safeParse({ doctorId: "d1", startsAt: "tomorrow", reason: "Fever" }).success).toBe(false);
    expect(bookingSchema.safeParse({ doctorId: "d1", startsAt: "2030-01-07T04:30:00.000Z", reason: "" }).success).toBe(false);
  });
});

describe("scheduleSchema", () => {
  it("validates weekday and HH:MM", () => {
    expect(scheduleSchema.safeParse({ doctorId: "d", weekday: 1, startTime: "10:00", endTime: "12:00" }).success).toBe(true);
    expect(scheduleSchema.safeParse({ doctorId: "d", weekday: 9, startTime: "10:00", endTime: "12:00" }).success).toBe(false);
    expect(scheduleSchema.safeParse({ doctorId: "d", weekday: 1, startTime: "10am", endTime: "12:00" }).success).toBe(false);
  });
});
