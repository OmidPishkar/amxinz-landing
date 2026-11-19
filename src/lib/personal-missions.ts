import { getDb } from "@/lib/mongodb";
import { buildUniqueRound } from "@/lib/binance";
import { detectScenarioSkills, getSkillReport, type SkillId } from "@/lib/skills";
import { utcDay, type UserProgressDoc } from "@/lib/daily-mission";
import { awardXp } from "@/lib/progress";
import type { CandleDoc } from "@/lib/types";

interface PersonalScenario { index: number; symbol: string; interval: string; startTime: number; outcome: "up" | "down"; visible: CandleDoc[]; future: CandleDoc[]; quality: number }
interface PersonalMissionDoc { userId: string; date: string; targetSkill: SkillId; createdAt: Date; scenarios: PersonalScenario[] }
interface PersonalAnswerDoc { userId: string; date: string; index: number; choice: "up" | "down"; outcome: "up" | "down"; correct: boolean; answeredAt: Date }

export async function getPersonalMissionState(userId: string) {
  const db = await getDb();
  const date = utcDay();
  const col = db.collection<PersonalMissionDoc>("personal_missions");
  await col.createIndex({ userId: 1, date: 1 }, { unique: true });
  let mission = await col.findOne({ userId, date });
  if (!mission) {
    const report = await getSkillReport(userId);
    const weakest = report.filter((s) => s.rating !== null && s.id !== "risk").sort((a, b) => (a.rating ?? 100) - (b.rating ?? 100))[0];
    if (!weakest) return { available: false as const, reason: "Complete at least 10 relevant samples in one skill before Personal Missions can adapt to your performance." };
    const scenarios: PersonalScenario[] = [];
    for (let attempt = 0; attempt < 30 && scenarios.length < 3; attempt += 1) {
      const round = await buildUniqueRound("personal");
      const signal = detectScenarioSkills(round.visible).find((s) => s.skill === weakest.id);
      if (!signal) continue;
      scenarios.push({ index: scenarios.length, symbol: round.symbol, interval: round.interval, startTime: round.startTime, outcome: round.outcome, visible: round.visible, future: round.future, quality: signal.quality });
    }
    if (scenarios.length < 3) return { available: false as const, reason: "There are not enough unused historical scenarios for this skill today. Try again later." };
    const doc: PersonalMissionDoc = { userId, date, targetSkill: weakest.id, createdAt: new Date(), scenarios };
    try { await col.insertOne(doc); mission = await col.findOne({ userId, date }); }
    catch (error) {
      if ((error as { code?: number })?.code !== 11000) throw error;
      mission = await col.findOne({ userId, date });
    }
  }
  if (!mission) return { available: false as const, reason: "Could not prepare a Personal Mission." };
  const answers = await db.collection<PersonalAnswerDoc>("personal_mission_entries").find({ userId, date }).sort({ index: 1 }).toArray();
  const byIndex = new Map<number, PersonalAnswerDoc>(answers.map((a): [number, PersonalAnswerDoc] => [a.index, a]));
  if (answers.length === 3) {
    try { await awardXp(userId, "personal:" + date, 25); } catch (error) { console.error("personal mission XP recovery:", error); }
  }
  const progress = await db.collection<UserProgressDoc>("user_progress").findOne({ userId });
  return {
    available: true as const, date, targetSkill: mission.targetSkill, answered: answers.length, completed: answers.length === 3,
    xp: progress?.xp ?? 0, level: progress?.level ?? 1,
    scenarios: mission.scenarios.map((s) => {
      const answer = byIndex.get(s.index);
      return { index: s.index, interval: s.interval, candles: s.visible, answered: !!answer, ...(answer ? { result: { choice: answer.choice, correct: answer.correct, outcome: answer.outcome, future: s.future, reveal: { symbol: s.symbol, interval: s.interval, startTime: s.startTime } } } : {}) };
    }),
  };
}

export async function answerPersonalMission(userId: string, index: number, choice: "up" | "down") {
  if (!Number.isInteger(index) || index < 0 || index >= 3) return { ok: false as const, status: 400, error: "Invalid scenario." };
  const db = await getDb();
  const date = utcDay();
  const mission = await db.collection<PersonalMissionDoc>("personal_missions").findOne({ userId, date });
  if (!mission) return { ok: false as const, status: 404, error: "Personal Mission not found." };
  const entries = db.collection<PersonalAnswerDoc>("personal_mission_entries");
  await entries.createIndex({ userId: 1, date: 1, index: 1 }, { unique: true });
  const count = await entries.countDocuments({ userId, date });
  if (count !== index) return { ok: false as const, status: 409, error: "Complete the scenarios in order." };
  const scenario = mission.scenarios[index];
  const correct = scenario.outcome === choice;
  const now = new Date();
  try { await entries.insertOne({ userId, date, index, choice, outcome: scenario.outcome, correct, answeredAt: now }); }
  catch (error) {
    if ((error as { code?: number })?.code === 11000) return { ok: false as const, status: 409, error: "This scenario has already been answered." };
    throw error;
  }
  const skillEvents = db.collection("skill_events");
  await skillEvents.createIndex({ roundId: 1, skill: 1 }, { unique: true });
  await skillEvents.insertOne({ userId, roundId: "personal:" + userId + ":" + date + ":" + index, skill: mission.targetSkill, correct, quality: scenario.quality, createdAt: now }).catch((error) => {
    if ((error as { code?: number })?.code !== 11000) throw error;
  });
  const total = count + 1;
  let awardedXp = 0;
  if (total === 3) {
    const completions = db.collection("personal_mission_completions");
    await completions.createIndex({ userId: 1, date: 1 }, { unique: true });
    let first = false;
    try { await completions.insertOne({ userId, date, completedAt: now }); first = true; }
    catch (error) { if ((error as { code?: number })?.code !== 11000) throw error; }
    if (first) {
      const reward = await awardXp(userId, "personal:" + date, 25);
      awardedXp = reward.awarded ? 25 : 0;
    }
  }
  return { ok: true as const, index, choice, correct, outcome: scenario.outcome, future: scenario.future, reveal: { symbol: scenario.symbol, interval: scenario.interval, startTime: scenario.startTime }, answered: total, completed: total === 3, awardedXp };
}
