import { getDb } from "@/lib/mongodb";
import type { CandleDoc, RoundDoc } from "@/lib/types";

export const SKILLS = [
  { id: "trend", name: "Trend Identification", description: "Recognising directional movement and trend strength." },
  { id: "structure", name: "Market Structure", description: "Reading sequences of swing highs and swing lows." },
  { id: "levels", name: "Support & Resistance", description: "Responding to meaningful historical price levels." },
  { id: "breakout", name: "Breakout Recognition", description: "Identifying closes beyond established ranges." },
  { id: "reversal", name: "Reversal Recognition", description: "Noticing a possible change after directional movement." },
  { id: "momentum", name: "Momentum Analysis", description: "Assessing the strength and persistence of price movement." },
  { id: "risk", name: "Risk Management", description: "Planning and evaluating stop-loss, take-profit and reward-to-risk decisions in Risk Lab." },
] as const;
export type SkillId = typeof SKILLS[number]["id"];

function pct(a: number, b: number) { return a ? (b - a) / a * 100 : 0; }
function extrema(values: number[], mode: "high" | "low") {
  const result: number[] = [];
  for (let i = 1; i < values.length - 1; i += 1) {
    if (mode === "high" ? values[i] > values[i - 1] && values[i] >= values[i + 1] : values[i] < values[i - 1] && values[i] <= values[i + 1]) result.push(values[i]);
  }
  return result;
}

/** Returns only skill dimensions with a visible, measurable signal in this chart. */
export function detectScenarioSkills(candles: CandleDoc[]): { skill: SkillId; quality: number }[] {
  if (candles.length < 40) return [];
  const closes = candles.map((c) => c.close);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const last = closes[closes.length - 1];
  const out: { skill: SkillId; quality: number }[] = [];
  const trend = Math.abs(pct(closes[closes.length - 21], last));
  if (trend >= 0.45) out.push({ skill: "trend", quality: Math.min(5, 2 + trend * 1.2) });

  const recentHighs = extrema(highs.slice(-35), "high").slice(-3);
  const recentLows = extrema(lows.slice(-35), "low").slice(-3);
  if (recentHighs.length >= 2 && recentLows.length >= 2) {
    const hh = recentHighs[recentHighs.length - 1] > recentHighs[0];
    const hl = recentLows[recentLows.length - 1] > recentLows[0];
    const lh = recentHighs[recentHighs.length - 1] < recentHighs[0];
    const ll = recentLows[recentLows.length - 1] < recentLows[0];
    if ((hh && hl) || (lh && ll)) out.push({ skill: "structure", quality: 3.5 });
  }

  const rangeHigh = Math.max(...highs.slice(-40, -1));
  const rangeLow = Math.min(...lows.slice(-40, -1));
  const nearHigh = Math.abs(pct(rangeHigh, last)) <= 0.35;
  const nearLow = Math.abs(pct(rangeLow, last)) <= 0.35;
  if (nearHigh || nearLow) out.push({ skill: "levels", quality: 3.2 });

  const priorHigh = Math.max(...highs.slice(-21, -1));
  const priorLow = Math.min(...lows.slice(-21, -1));
  if (last > priorHigh || last < priorLow) out.push({ skill: "breakout", quality: 4.2 });

  const priorTrend = pct(closes[closes.length - 11], closes[closes.length - 4]);
  const shortMove = pct(closes[closes.length - 4], last);
  if (Math.abs(priorTrend) > 0.35 && priorTrend * shortMove < 0 && Math.abs(shortMove) > 0.2) {
    out.push({ skill: "reversal", quality: Math.min(5, 3 + Math.abs(shortMove)) });
  }

  const momentum = Math.abs(pct(closes[closes.length - 6], last));
  if (momentum > 0.3) out.push({ skill: "momentum", quality: Math.min(5, 2.5 + momentum) });
  return out;
}

export async function recordRoundSkills(round: RoundDoc, userId: string, roundId: string, correct: boolean) {
  if (!round.visible?.length) return;
  const signals = detectScenarioSkills(round.visible);
  if (!signals.length) return;
  const db = await getDb();
  const col = db.collection("skill_events");
  await col.createIndex({ roundId: 1, skill: 1 }, { unique: true });
  await col.createIndex({ userId: 1, skill: 1, createdAt: 1 });
  await col.insertMany(signals.map((signal) => ({
    userId, roundId, skill: signal.skill, correct,
    quality: Math.round(signal.quality * 100) / 100, createdAt: round.answeredAt ?? new Date(),
  })), { ordered: false }).catch((error) => {
    if ((error as { code?: number })?.code !== 11000) throw error;
  });
}

export interface SkillReportItem {
  id: SkillId;
  name: string;
  description: string;
  samples: number;
  correct: number;
  accuracy: number | null;
  rating: number | null;
  confidence: "insufficient" | "initial" | "developing" | "established";
  quality: number;
  improvement: number | null;
}
export async function getSkillReport(userId: string): Promise<SkillReportItem[]> {
  const db = await getDb();
  const rows = await db.collection("skill_events").find({ userId }).sort({ createdAt: 1 }).limit(5000).toArray();
  return SKILLS.map((skill) => {
    const samples = rows.filter((r) => r.skill === skill.id);
    const count = samples.length;
    const correct = samples.filter((r) => r.correct === true).length;
    const accuracy = count ? Math.round(correct / count * 100) : null;
    const quality = count ? samples.reduce((sum, r) => sum + Number(r.quality ?? 3), 0) / count : 0;
    const confidence = count >= 50 ? "established" : count >= 25 ? "developing" : count >= 10 ? "initial" : "insufficient";
    let improvement: number | null = null;
    let rating: number | null = null;
    if (count >= 10) {
      const midpoint = Math.floor(count / 2);
      const first = samples.slice(0, midpoint);
      const recent = samples.slice(midpoint);
      const firstRate = first.filter((r) => r.correct).length / first.length * 100;
      const recentRate = recent.filter((r) => r.correct).length / recent.length * 100;
      improvement = Math.round((recentRate - firstRate) * 10) / 10;
      const recentValues = recent.map((r) => r.correct ? 1 : 0);
      const mean = recentValues.reduce<number>((a, b) => a + b, 0) / recentValues.length;
      const variance = recentValues.reduce<number>((a, b) => a + (b - mean) ** 2, 0) / recentValues.length;
      const consistency = Math.max(0, 100 - Math.sqrt(variance) * 100);
      const improvementScore = Math.max(0, Math.min(100, 50 + improvement));
      rating = Math.round((accuracy ?? 0) * 0.6 + (quality / 5 * 100) * 0.15 + consistency * 0.15 + improvementScore * 0.1);
    }
    return { ...skill, samples: count, correct, accuracy, rating, confidence, quality: Math.round(quality * 10) / 10, improvement };
  });
}
