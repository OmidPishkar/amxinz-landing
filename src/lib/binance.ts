import { HORIZON, VISIBLE_CANDLES } from "./game";
import type { CandleDoc } from "./types";

// Public market-data endpoints (no API key). The second host works where
// api.binance.com is geo-blocked.
const HOSTS = ["https://api.binance.com", "https://data-api.binance.vision"];

const SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
  "ADAUSDT", "DOGEUSDT", "LINKUSDT", "LTCUSDT", "AVAXUSDT",
];

const INTERVALS = [
  { id: "15m", ms: 15 * 60_000 },
  { id: "1h", ms: 60 * 60_000 },
  { id: "4h", ms: 4 * 60 * 60_000 },
  { id: "1d", ms: 24 * 60 * 60_000 },
];

const TOTAL = VISIBLE_CANDLES + HORIZON;
const BASE_TIME = 1_700_000_000; // fake timeline: hides the real dates from the chart
const STEP = 3600;

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

interface RawCandle { open: number; high: number; low: number; close: number }

async function fetchKlines(symbol: string, interval: string, startTime: number): Promise<RawCandle[]> {
  const qs = new URLSearchParams({
    symbol, interval, startTime: String(startTime), limit: String(TOTAL),
  });
  let lastError: unknown;
  for (const host of HOSTS) {
    try {
      const res = await fetch(`${host}/api/v3/klines?${qs}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Binance responded ${res.status}`);
      const rows = (await res.json()) as string[][];
      return rows.map((r) => ({
        open: Number(r[1]), high: Number(r[2]), low: Number(r[3]), close: Number(r[4]),
      }));
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

const round4 = (n: number) => Math.round(n * 10_000) / 10_000;

/**
 * Picks a random real market window from Binance.
 * Prices are rescaled so the first candle opens at 100 and timestamps are fake,
 * so a player can't identify the asset or date from the chart.
 */
export async function buildRound() {
  for (let attempt = 0; attempt < 4; attempt++) {
    const symbol = pick(SYMBOLS);
    const interval = pick(INTERVALS);
    const min = Date.UTC(2021, 0, 1);
    const max = Date.now() - TOTAL * interval.ms - interval.ms * 2;
    const startTime = Math.floor(min + Math.random() * (max - min));

    const raw = await fetchKlines(symbol, interval.id, startTime);
    if (raw.length < TOTAL) continue;

    const k = 100 / raw[0].open;
    const candles: CandleDoc[] = raw.map((c, i) => ({
      time: BASE_TIME + i * STEP,
      open: round4(c.open * k),
      high: round4(c.high * k),
      low: round4(c.low * k),
      close: round4(c.close * k),
    }));

    const visible = candles.slice(0, VISIBLE_CANDLES);
    const future = candles.slice(VISIBLE_CANDLES);
    const lastClose = visible[visible.length - 1].close;
    const endClose = future[HORIZON - 1].close;
    if (endClose === lastClose) continue; // flat result: draw another window

    return {
      symbol,
      interval: interval.id,
      startTime,
      outcome: (endClose > lastClose ? "up" : "down") as "up" | "down",
      visible,
      future,
    };
  }
  throw new Error("Could not load market data from Binance");
}
