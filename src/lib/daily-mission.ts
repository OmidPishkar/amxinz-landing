import { getDb } from "@/lib/mongodb";
import { buildUniqueRound } from "@/lib/binance";
import { detectScenarioSkills } from "@/lib/skills";
import { awardXp } from "@/lib/progress";
import { markReferralMissionComplete } from "@/lib/referrals";
import type { CandleDoc } from "@/lib/types";

export interface DailyScenario {
  index: number;
  symbol: string;
  interval: string;
  startTime: number;
  outcome: "up" | "down";
  visible: CandleDoc[];
  future: CandleDoc[];
}
export interface DailyMissionDoc {
  date: string;
  createdAt: Date;
  scenarios: DailyScenario[];
}
export interface DailyAnswerDoc {
  date: string;
  userId: string;
  index: number;
  choice: "up" | "down";
  outcome: "up" | "down";
  correct: boolean;
  answeredAt: Date;
}
export interface UserProgressDoc {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDay?: string;
  createdAt: Date;
  updatedAt: Date;
}
export const xpLevel = (xp: number) => {
  const thresholds = [0, 100, 250, 500, 850, 1300, 1900, 2700, 3700, 5000];
  let level = 1;
  for (let i = 1; i < thresholds.length; i += 1) if (xp >= thresholds[i]) level = i + 1;
  if (xp >= 5000) level = 10 + Math.floor(Math.sqrt((xp - 5000) / 1000));
  return level;
};
export const utcDay = (date = new Date()) => date.toISOString().slice(0, 10);

export async function getOrCreateDailyMission(date = utcDay()) {
  const db = await getDb();
  const missions = db.collection<DailyMissionDoc>("daily_missions");
  await missions.createIndex({ date: 1 }, { unique: true });
  const existing = await missions.findOne({ date });
  if (existing) return existing;
  const rounds = await Promise.all(Array.from({ length: 5 }, () => buildUniqueRound("daily")));
  const doc: DailyMissionDoc = {
    date,
    createdAt: new Date(),
    scenarios: rounds.map((r, index) => ({
      index, symbol: r.symbol, interval: r.interval, startTime: r.startTime,
      outcome: r.outcome, visible: r.visible, future: r.future,
    })),
  };
  try {
    await missions.insertOne(doc);
    return doc;
  } catch (error) {
    if ((error as { code?: number })?.code !== 11000) throw error;
    const winner = await missions.findOne({ date });
    if (!winner) throw error;
    return winner;
  }
}

export async function getDailyMissionState(userId: string) {
  const date = utcDay();
  const db = await getDb();
  const mission = await getOrCreateDailyMission(date);
  const answers = await db.collection<DailyAnswerDoc>("daily_mission_entries")
    .find({ date, userId }).sort({ index: 1 }).toArray();
  const byIndex = new Map<number, DailyAnswerDoc>(answers.map((a): [number, DailyAnswerDoc] => [a.index, a]));
  if (answers.length === 5) {
    try { await awardXp(userId, "daily:" + date, 50); } catch (error) { console.error("daily mission XP recovery:", error); }
    try { await markReferralMissionComplete(userId); } catch (error) { console.error("daily mission referral recovery:", error); }
  }
  const progress = await db.collection<UserProgressDoc>("user_progress").findOne({ userId });
  return {
    date,
    completed: answers.length === 5,
    answered: answers.length,
    xp: progress?.xp ?? 0,
    level: progress?.level ?? 1,
    streak: progress?.streak ?? 0,
    scenarios: mission.scenarios.map((scenario) => {
      const answer = byIndex.get(scenario.index);
      return {
        index: scenario.index,
        interval: scenario.interval,
        candles: scenario.visible,
        answered: !!answer,
        ...(answer ? {
          result: {
            choice: answer.choice, correct: answer.correct, outcome: answer.outcome,
            future: scenario.future,
            reveal: { symbol: scenario.symbol, interval: scenario.interval, startTime: scenario.startTime },
          },
        } : {}),
      };
    }),
  };
}

export async function answerDailyMission(userId: string, index: number, choice: "up" | "down") {
  if (!Number.isInteger(index) || index < 0 || index >= 5) return { ok: false as const, status: 400, error: "Invalid scenario." };
  const date = utcDay();
  const db = await getDb();
  const mission = await getOrCreateDailyMission(date);
  const entries = db.collection<DailyAnswerDoc>("daily_mission_entries");
  await entries.createIndex({ date: 1, userId: 1, index: 1 }, { unique: true });
  const answeredCount = await entries.countDocuments({ date, userId });
  if (answeredCount !== index) return { ok: false as const, status: 409, error: "Complete the scenarios in order. Reload the mission to continue." };
  const scenario = mission.scenarios[index];
  const correct = scenario.outcome === choice;
  const now = new Date();
  try {
    await entries.insertOne({ date, userId, index, choice, outcome: scenario.outcome, correct, answeredAt: now });
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) return { ok: false as const, status: 409, error: "This scenario has already been answered." };
    throw error;
  }
  const signals = detectScenarioSkills(scenario.visible);
  if (signals.length) {
    const skillEvents = db.collection("skill_events");
    await skillEvents.createIndex({ roundId: 1, skill: 1 }, { unique: true });
    await skillEvents.insertMany(signals.map((signal) => ({ userId, roundId: "daily:" + userId + ":" + date + ":" + index, skill: signal.skill, correct, quality: signal.quality, createdAt: now })), { ordered: false }).catch((error) => { if ((error as { code?: number })?.code !== 11000) throw error; });
  }
  const total = answeredCount + 1;
  let awardedXp = 0;
  let streak = 0;
  let level = 1;
  if (total === 5) {
    const completions = db.collection("daily_mission_completions");
    await completions.createIndex({ date: 1, userId: 1 }, { unique: true });
    let firstCompletion = false;
    try {
      await completions.insertOne({ date, userId, completedAt: now, correct: (await entries.countDocuments({ date, userId, correct: true })) });
      firstCompletion = true;
    } catch (error) {
      if ((error as { code?: number })?.code !== 11000) throw error;
    }
    if (firstCompletion) {
      const reward = await awardXp(userId, "daily:" + date, 50);
      awardedXp = reward.awarded ? 50 : 0;
      streak = reward.streak;
      level = reward.level;
      try { await markReferralMissionComplete(userId); } catch (error) { console.error("referral mission trigger:", error); }
    } else {
      const p = await db.collection<UserProgressDoc>("user_progress").findOne({ userId });
      streak = p?.streak ?? 0; level = p?.level ?? 1;
    }
  }
  return {
    ok: true as const, index, choice, correct, outcome: scenario.outcome,
    future: scenario.future,
    reveal: { symbol: scenario.symbol, interval: scenario.interval, startTime: scenario.startTime },
    answered: total, completed: total === 5, awardedXp, streak, level,
  };
}
