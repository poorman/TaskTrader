const TIMEZONE = "America/Chicago";

/** Returns today's date as YYYY-MM-DD in Chicago timezone */
export function todayLocal(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

/** Returns an ISO timestamp string, but date portion reflects Chicago timezone */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Converts an ISO date string to YYYY-MM-DD in Chicago timezone */
export function toLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

/** Returns yesterday's date as YYYY-MM-DD in Chicago timezone */
export function yesterdayLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

/** Returns tomorrow's date as YYYY-MM-DD in Chicago timezone */
export function tomorrowLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}
