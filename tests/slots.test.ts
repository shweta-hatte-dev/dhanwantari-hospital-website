import { describe, expect, it } from "vitest";
import {
  generateSlots,
  hospitalMidnightUtc,
  isValidSlotStart,
  overlaps,
  parseHHMM,
  weekdayOf,
  type ScheduleWindow,
} from "../src/lib/slots";

// 2030-01-07 is a Monday (weekday 1)
const MONDAY = "2030-01-07";
const windows: ScheduleWindow[] = [
  { weekday: 1, startTime: "10:00", endTime: "11:00" },
  { weekday: 1, startTime: "17:00", endTime: "18:00" },
  { weekday: 2, startTime: "09:00", endTime: "10:00" },
];
const longAgo = new Date("2020-01-01T00:00:00Z");

describe("time helpers", () => {
  it("parses HH:MM", () => {
    expect(parseHHMM("00:00")).toBe(0);
    expect(parseHHMM("10:30")).toBe(630);
    expect(() => parseHHMM("25:00")).toThrow();
    expect(() => parseHHMM("9:00")).toThrow();
  });

  it("computes weekday and rejects impossible dates", () => {
    expect(weekdayOf(MONDAY)).toBe(1);
    expect(() => weekdayOf("2030-02-31")).toThrow();
    expect(() => weekdayOf("not-a-date")).toThrow();
  });

  it("converts hospital midnight (IST) to UTC", () => {
    expect(hospitalMidnightUtc(MONDAY).toISOString()).toBe("2030-01-06T18:30:00.000Z");
  });
});

describe("generateSlots", () => {
  it("creates slots only inside the schedule windows for that weekday", () => {
    const slots = generateSlots({ date: MONDAY, windows, slotMinutes: 30, busy: [], now: longAgo });
    expect(slots).toHaveLength(4);
    expect(slots[0].startsAt.toISOString()).toBe("2030-01-07T04:30:00.000Z"); // 10:00 IST
    expect(slots[3].endsAt.toISOString()).toBe("2030-01-07T12:30:00.000Z"); // 18:00 IST
  });

  it("returns nothing on days with no schedule", () => {
    const sunday = "2030-01-06";
    expect(generateSlots({ date: sunday, windows, slotMinutes: 30, busy: [], now: longAgo })).toEqual([]);
  });

  it("does not create a slot that would run past the window end", () => {
    const slots = generateSlots({ date: MONDAY, windows, slotMinutes: 45, busy: [], now: longAgo });
    // 60-minute windows fit only one 45-minute slot each
    expect(slots).toHaveLength(2);
  });

  it("removes slots that are already booked (double-booking protection)", () => {
    const first = generateSlots({ date: MONDAY, windows, slotMinutes: 30, busy: [], now: longAgo })[0];
    const slots = generateSlots({
      date: MONDAY,
      windows,
      slotMinutes: 30,
      busy: [{ startsAt: first.startsAt, endsAt: first.endsAt }],
      now: longAgo,
    });
    expect(slots).toHaveLength(3);
    expect(slots.some((s) => s.startsAt.getTime() === first.startsAt.getTime())).toBe(false);
  });

  it("removes slots overlapping a longer busy range", () => {
    const busyStart = new Date("2030-01-07T04:45:00Z"); // 10:15 IST, overlaps both morning slots
    const busyEnd = new Date("2030-01-07T05:15:00Z"); // 10:45 IST
    const slots = generateSlots({
      date: MONDAY,
      windows,
      slotMinutes: 30,
      busy: [{ startsAt: busyStart, endsAt: busyEnd }],
      now: longAgo,
    });
    expect(slots).toHaveLength(2); // only the evening slots remain
  });

  it("hides slots in the past", () => {
    const now = new Date("2030-01-07T04:30:00Z"); // exactly 10:00 IST: that slot has started
    const slots = generateSlots({ date: MONDAY, windows, slotMinutes: 30, busy: [], now });
    expect(slots).toHaveLength(3);
  });

  it("rejects invalid slot lengths", () => {
    expect(() => generateSlots({ date: MONDAY, windows, slotMinutes: 0, busy: [], now: longAgo })).toThrow();
    expect(() => generateSlots({ date: MONDAY, windows, slotMinutes: 7.5, busy: [], now: longAgo })).toThrow();
  });
});

describe("overlaps", () => {
  const a = { startsAt: new Date("2030-01-07T04:30:00Z"), endsAt: new Date("2030-01-07T05:00:00Z") };
  it("detects overlap and treats touching ranges as free", () => {
    expect(overlaps(a, a)).toBe(true);
    expect(overlaps(a, { startsAt: new Date("2030-01-07T05:00:00Z"), endsAt: new Date("2030-01-07T05:30:00Z") })).toBe(false);
    expect(overlaps(a, { startsAt: new Date("2030-01-07T04:45:00Z"), endsAt: new Date("2030-01-07T05:15:00Z") })).toBe(true);
  });
});

describe("isValidSlotStart", () => {
  it("accepts exact slot starts and rejects off-grid or out-of-schedule times", () => {
    const ok = new Date("2030-01-07T04:30:00Z"); // 10:00 IST
    const offGrid = new Date("2030-01-07T04:40:00Z"); // 10:10 IST
    const outside = new Date("2030-01-07T07:30:00Z"); // 13:00 IST
    expect(isValidSlotStart({ startsAt: ok, windows, slotMinutes: 30 })).toBe(true);
    expect(isValidSlotStart({ startsAt: offGrid, windows, slotMinutes: 30 })).toBe(false);
    expect(isValidSlotStart({ startsAt: outside, windows, slotMinutes: 30 })).toBe(false);
  });
});
