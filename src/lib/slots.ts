// Pure scheduling logic (no framework or database imports) so it is easy to unit test.

export interface ScheduleWindow {
  weekday: number; // 0 = Sunday ... 6 = Saturday
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export interface Slot {
  startsAt: Date;
  endsAt: Date;
}

export interface BusyRange {
  startsAt: Date;
  endsAt: Date;
}

/** Hospital timezone offset in minutes (India Standard Time = +330). */
export const HOSPITAL_UTC_OFFSET_MINUTES = 330;

export function parseHHMM(value: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) throw new Error(`Invalid time "${value}", expected HH:MM`);
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Parses "YYYY-MM-DD" and returns the UTC instant of local midnight in the hospital timezone. */
export function hospitalMidnightUtc(dateStr: string, offsetMinutes = HOSPITAL_UTC_OFFSET_MINUTES): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) throw new Error(`Invalid date "${dateStr}", expected YYYY-MM-DD`);
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const utc = new Date(Date.UTC(y, m - 1, d));
  if (utc.getUTCFullYear() !== y || utc.getUTCMonth() !== m - 1 || utc.getUTCDate() !== d) {
    throw new Error(`Invalid calendar date "${dateStr}"`);
  }
  return new Date(utc.getTime() - offsetMinutes * 60_000);
}

/** Weekday (0-6) of a "YYYY-MM-DD" calendar date. */
export function weekdayOf(dateStr: string): number {
  hospitalMidnightUtc(dateStr); // validates
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function overlaps(a: BusyRange, b: BusyRange): boolean {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}

/**
 * Generates all bookable slots for one calendar day.
 * Slots in the past (relative to `now`) or overlapping `busy` ranges are removed.
 */
export function generateSlots(params: {
  date: string;
  windows: ScheduleWindow[];
  slotMinutes: number;
  busy: BusyRange[];
  now?: Date;
  offsetMinutes?: number;
}): Slot[] {
  const { date, windows, slotMinutes, busy } = params;
  const now = params.now ?? new Date();
  const offset = params.offsetMinutes ?? HOSPITAL_UTC_OFFSET_MINUTES;
  if (!Number.isInteger(slotMinutes) || slotMinutes < 5 || slotMinutes > 240) {
    throw new Error("slotMinutes must be an integer between 5 and 240");
  }
  const midnight = hospitalMidnightUtc(date, offset);
  const weekday = weekdayOf(date);
  const slots: Slot[] = [];

  for (const w of windows.filter((x) => x.weekday === weekday)) {
    const start = parseHHMM(w.startTime);
    const end = parseHHMM(w.endTime);
    for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
      const startsAt = new Date(midnight.getTime() + t * 60_000);
      const endsAt = new Date(startsAt.getTime() + slotMinutes * 60_000);
      if (startsAt <= now) continue;
      if (busy.some((b) => overlaps({ startsAt, endsAt }, b))) continue;
      slots.push({ startsAt, endsAt });
    }
  }
  return slots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

/** True if `startsAt` is exactly one of the doctor's generated slots (ignoring busy/past filters). */
export function isValidSlotStart(params: {
  startsAt: Date;
  windows: ScheduleWindow[];
  slotMinutes: number;
  offsetMinutes?: number;
}): boolean {
  const offset = params.offsetMinutes ?? HOSPITAL_UTC_OFFSET_MINUTES;
  const local = new Date(params.startsAt.getTime() + offset * 60_000);
  const date = local.toISOString().slice(0, 10);
  const all = generateSlots({
    date,
    windows: params.windows,
    slotMinutes: params.slotMinutes,
    busy: [],
    now: new Date(0),
    offsetMinutes: offset,
  });
  return all.some((s) => s.startsAt.getTime() === params.startsAt.getTime());
}
