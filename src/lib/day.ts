// Day helpers. Everything in the admin panel works in UTC days ("YYYY-MM-DD").
export const dayStr = (d: Date) => d.toISOString().slice(0, 10);
export const startOfDay = (day: string) => new Date(`${day}T00:00:00.000Z`);

export function addDays(day: string, n: number) {
  const d = startOfDay(day);
  d.setUTCDate(d.getUTCDate() + n);
  return dayStr(d);
}

/** Every day from `from` to `to`, inclusive. */
export function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to && out.length < 400; d = addDays(d, 1)) out.push(d);
  return out;
}
