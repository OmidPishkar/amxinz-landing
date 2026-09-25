import { getDb } from "./mongodb";
import type { RoundDoc } from "./types";

export const PAGE_SIZE = 50;
export type ResultFilter = "all" | "correct" | "wrong";

/** An inclusive UTC date range. Either bound may be omitted for an open range. */
export interface DateRange {
  from?: Date;
  to?: Date;
}

function dateMatch(range?: DateRange) {
  if (!range?.from && !range?.to) return {};
  return {
    answeredAt: {
      ...(range.from ? { $gte: range.from } : {}),
      ...(range.to ? { $lte: range.to } : {}),
    },
  };
}

const globalForIdx = globalThis as unknown as { _roundIdx?: Promise<unknown> };

async function roundsCollection() {
  const db = await getDb();
  const col = db.collection<RoundDoc>("rounds");
  // Makes "my predictions, newest first" fast as the collection grows. Created once.
  globalForIdx._roundIdx ??= col.createIndex({ userId: 1, answeredAt: -1 }).catch(() => undefined);
  await globalForIdx._roundIdx;
  return col;
}

function filterFor(userId: string, filter: ResultFilter, range?: DateRange) {
  return {
    userId,
    answered: true,
    ...(filter === "correct" ? { correct: true } : filter === "wrong" ? { correct: false } : {}),
    ...dateMatch(range),
  };
}

/** One page of the user's answered predictions, newest first. The hidden future candles are never loaded. */
export async function getPredictionPage(userId: string, page: number, filter: ResultFilter, range?: DateRange) {
  const col = await roundsCollection();
  const query = filterFor(userId, filter, range);
  const total = await col.countDocuments(query);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);

  const rows = await col
    .find(query, { projection: { future: 0 } })
    .sort({ answeredAt: -1 })
    .skip((current - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray();

  return { rows, total, pages, page: current };
}

/** Last 20 results, oldest first (true = correct). */
export async function getRecentForm(userId: string): Promise<boolean[]> {
  const col = await roundsCollection();
  const rows = await col
    .find(filterFor(userId, "all"), { projection: { correct: 1 } })
    .sort({ answeredAt: -1 })
    .limit(20)
    .toArray();
  return rows.map((r) => r.correct === true).reverse();
}

export interface DirectionPerf {
  played: number;
  correct: number;
  winRate: number; // 0-100, -1 when there is no data yet
}

export interface AssetPerf {
  symbol: string;
  played: number;
  correct: number;
  winRate: number;
}

export interface PerformanceStats {
  played: number;
  correct: number;
  winRate: number; // -1 when there is no data yet
  byDirection: { up: DirectionPerf; down: DirectionPerf };
  byAsset: AssetPerf[]; // sorted by win rate desc, then by sample size desc
  bestAsset: AssetPerf | null; // null until at least MIN_ASSET_SAMPLE rounds are played on one asset
}

const MIN_ASSET_SAMPLE = 5;
const EMPTY_DIRECTION: DirectionPerf = { played: 0, correct: 0, winRate: -1 };

function winRateOf(played: number, correct: number) {
  return played > 0 ? Math.round((correct / played) * 1000) / 10 : -1;
}

/** Win rate overall, by prediction direction, and by asset. One aggregation query. */
export async function getPerformanceStats(userId: string, range?: DateRange): Promise<PerformanceStats> {
  const col = await roundsCollection();
  const groupStage = {
    played: { $sum: 1 },
    correct: { $sum: { $cond: ["$correct", 1, 0] } },
  };

  type Facets = {
    overall: { played: number; correct: number }[];
    byDirection: { _id: "up" | "down"; played: number; correct: number }[];
    byAsset: { _id: string; played: number; correct: number }[];
  };

  const [facets] = (await col
    .aggregate([
      { $match: { userId, answered: true, ...dateMatch(range) } },
      {
        $facet: {
          overall: [{ $group: { _id: null, ...groupStage } }],
          byDirection: [{ $group: { _id: "$choice", ...groupStage } }],
          byAsset: [{ $group: { _id: "$symbol", ...groupStage } }],
        },
      },
    ])
    .toArray()) as unknown as Facets[];

  const overall = facets?.overall[0];
  const played = overall?.played ?? 0;
  const correct = overall?.correct ?? 0;

  const direction: { up: DirectionPerf; down: DirectionPerf } = {
    up: { ...EMPTY_DIRECTION },
    down: { ...EMPTY_DIRECTION },
  };
  for (const row of facets?.byDirection ?? []) {
    if (row._id !== "up" && row._id !== "down") continue;
    direction[row._id] = { played: row.played, correct: row.correct, winRate: winRateOf(row.played, row.correct) };
  }

  const byAsset: AssetPerf[] = (facets?.byAsset ?? [])
    .map((row) => ({ symbol: row._id, played: row.played, correct: row.correct, winRate: winRateOf(row.played, row.correct) }))
    .sort((a, b) => b.winRate - a.winRate || b.played - a.played);

  const bestAsset = byAsset.find((a) => a.played >= MIN_ASSET_SAMPLE) ?? null;

  return { played, correct, winRate: winRateOf(played, correct), byDirection: direction, byAsset, bestAsset };
}

/** All of a user's answered predictions, for the PDF export. Capped so the file (and the query) stay bounded. */
export const EXPORT_LIMIT = 1000;

export async function getPredictionsForExport(userId: string) {
  const col = await roundsCollection();
  return col
    .find(filterFor(userId, "all"), { projection: { future: 0 } })
    .sort({ answeredAt: -1 })
    .limit(EXPORT_LIMIT)
    .toArray();
}
