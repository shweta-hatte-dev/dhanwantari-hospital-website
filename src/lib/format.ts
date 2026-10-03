const TZ = "Asia/Kolkata";

export function formatDateTime(iso: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: TZ }).format(new Date(iso));
}

export function formatTime(iso: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: TZ }).format(new Date(iso));
}

/** Today's date as YYYY-MM-DD in the hospital timezone. */
export function todayInHospital(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}
