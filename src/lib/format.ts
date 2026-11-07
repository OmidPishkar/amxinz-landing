// Shared display formatting: profile table, the PDF export, and the result card
// all need the exact same asset/date text.
export const formatAsset = (symbol: string) => symbol.replace(/USDT$/, "/USDT");

export function formatChartDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
<<<<<<< HEAD

/** "2d 4h left", "5h left", "12m left", or "Ended". */
export function timeLeft(endsAt: Date, now = new Date()) {
  const ms = endsAt.getTime() - now.getTime();
  if (ms <= 0) return "Ended";
  const minutes = Math.floor(ms / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return `${Math.max(1, minutes)}m left`;
}

/** m:ss for a duration in milliseconds. */
export function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}:${String(s).padStart(2, "0")}`;
}
=======
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
