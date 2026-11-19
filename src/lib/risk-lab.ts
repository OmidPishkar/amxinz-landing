import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/mongodb";
import { buildUniqueRound } from "@/lib/binance";
import { awardXp } from "@/lib/progress";
import type { CandleDoc } from "@/lib/types";

interface RiskSession {
  sessionId: string;
  userId: string;
  symbol: string;
  interval: string;
  startTime: number;
  visible: CandleDoc[];
  future: CandleDoc[];
  status: "active" | "completed";
  createdAt: Date;
  answer?: { side: "long" | "short"; stopLossPct: number; takeProfitPct: number; outcome: string; realizedR: number; pnlPct: number; answeredAt: Date };
}
export async function getRiskSession(userId: string) {
  const db = await getDb();
  const col = db.collection<RiskSession>("risk_lab_sessions");
  await Promise.all([
    col.createIndex({ userId: 1 }, { unique: true, partialFilterExpression: { status: "active" } }),
    col.createIndex({ sessionId: 1 }, { unique: true }),
    col.createIndex({ userId: 1, createdAt: -1 }),
  ]);
  const active = await col.findOne({ userId, status: "active" });
  if (active) return active;
  const round = await buildUniqueRound("risk-lab");
  const doc: RiskSession = {
    sessionId: randomUUID(), userId, symbol: round.symbol, interval: round.interval, startTime: round.startTime,
    visible: round.visible, future: round.future, status: "active", createdAt: new Date(),
  };
  try {
    await col.insertOne(doc);
    return doc;
  } catch (error) {
    if ((error as { code?: number })?.code !== 11000) throw error;
    const current = await col.findOne({ userId, status: "active" });
    if (current) return current;
    throw error;
  }
}

export async function submitRiskAnswer(userId: string, side: "long" | "short", stopLossPct: number, takeProfitPct: number) {
  if (!Number.isFinite(stopLossPct) || !Number.isFinite(takeProfitPct) || stopLossPct < 0.1 || stopLossPct > 10 || takeProfitPct < 0.1 || takeProfitPct > 20) {
    return { ok: false as const, status: 400, error: "Stop-loss must be 0.1–10% and take-profit 0.1–20%." };
  }
  const db = await getDb();
  const col = db.collection<RiskSession>("risk_lab_sessions");
  const session = await col.findOne({ userId, status: "active" });
  if (!session) return { ok: false as const, status: 409, error: "No active Risk Lab scenario. Load a new scenario." };
  const entry = session.visible[session.visible.length - 1]?.close;
  if (!entry || !Number.isFinite(entry)) return { ok: false as const, status: 500, error: "Scenario entry price is invalid." };
  const stop = side === "long" ? entry * (1 - stopLossPct / 100) : entry * (1 + stopLossPct / 100);
  const target = side === "long" ? entry * (1 + takeProfitPct / 100) : entry * (1 - takeProfitPct / 100);
  let outcome = "horizon-close";
  let pnlPct = ((session.future[session.future.length - 1]?.close ?? entry) - entry) / entry * (side === "long" ? 100 : -100);
  for (const candle of session.future) {
    const stopHit = side === "long" ? candle.low <= stop : candle.high >= stop;
    const targetHit = side === "long" ? candle.high >= target : candle.low <= target;
    if (stopHit) { outcome = "stop-loss"; pnlPct = -stopLossPct; break; }
    if (targetHit) { outcome = "take-profit"; pnlPct = takeProfitPct; break; }
  }
  const realizedR = pnlPct / stopLossPct;
  const now = new Date();
  const answer = { side, stopLossPct, takeProfitPct, outcome, realizedR: Math.round(realizedR * 100) / 100, pnlPct: Math.round(pnlPct * 100) / 100, answeredAt: now };
  const saved = await col.updateOne({ sessionId: session.sessionId, userId, status: "active" }, { $set: { status: "completed", answer } });
  if (!saved.modifiedCount) return { ok: false as const, status: 409, error: "This scenario has already been answered." };
  const events = db.collection("skill_events");
  await events.createIndex({ roundId: 1, skill: 1 }, { unique: true });
  await events.insertOne({ userId, roundId: session.sessionId, skill: "risk", correct: realizedR > 0, quality: Math.min(5, Math.max(1, takeProfitPct / stopLossPct)), createdAt: now }).catch((error) => {
    if ((error as { code?: number })?.code !== 11000) throw error;
  });
  const xp = await awardXp(userId, "risk:" + session.sessionId, 5);
  return {
    ok: true as const, awardedXp: xp.awarded ? 5 : 0, side, stopLossPct, takeProfitPct, outcome,
    pnlPct: answer.pnlPct, realizedR: answer.realizedR, entry,
    future: session.future, reveal: { symbol: session.symbol, interval: session.interval, startTime: session.startTime },
  };
}

export async function getRiskHistory(userId: string) {
  const db = await getDb();
  const rows = await db.collection<RiskSession>("risk_lab_sessions").find({ userId, status: "completed" }).sort({ createdAt: -1 }).limit(10).toArray();
  return rows.filter((row) => !!row.answer).map((row) => ({
    sessionId: row.sessionId, symbol: row.symbol, interval: row.interval, createdAt: row.createdAt,
    side: row.answer!.side, outcome: row.answer!.outcome, realizedR: row.answer!.realizedR, pnlPct: row.answer!.pnlPct,
  }));
}
