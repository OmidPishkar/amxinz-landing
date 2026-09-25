// Shared display formatting: profile table, the PDF export, and the result card
// all need the exact same asset/date text.
export const formatAsset = (symbol: string) => symbol.replace(/USDT$/, "/USDT");

export function formatChartDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
