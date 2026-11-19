import { getDb } from "@/lib/mongodb";
import type { UserProgressDoc } from "@/lib/daily-mission";

const XP_THRESHOLDS = [0, 100, 250, 500, 850, 1300, 1900, 2700, 3700, 5000];
export function levelForXp(xp: number) {
  let level = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i += 1) if (xp >= XP_THRESHOLDS[i]) level = i + 1;
  if (xp >= 5000) level = 10 + Math.floor(Math.sqrt((xp - 5000) / 1000));
  return level;
}

/** Awards XP once per server-defined event and advances streak only on the first valid activity of a UTC day. */
export async function awardXp(userId: string, eventKey: string, amount: number) {
  if (!Number.isInteger(amount) || amount <= 0 || amount > 1000) throw new Error("Invalid XP award.");
  const db = await getDb();
  const events = db.collection("xp_events");
  await events.createIndex({ userId: 1, eventKey: 1 }, { unique: true });
  try {
    await events.insertOne({ userId, eventKey, amount, createdAt: new Date() });
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) {
      const existing = await db.collection<UserProgressDoc>("user_progress").findOne({ userId });
      return { awarded: false, xp: existing?.xp ?? 0, level: existing?.level ?? 1, streak: existing?.streak ?? 0 };
    }
    throw error;
  }
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
  const col = db.collection<UserProgressDoc>("user_progress");
  const updated = await col.findOneAndUpdate(
    { userId },
    [
      { $set: {
        xp: { $add: [{ $ifNull: ["$xp", 0] }, amount] },
        streak: { $cond: [
          { $eq: ["$lastActiveDay", day] },
          { $ifNull: ["$streak", 0] },
          { $cond: [{ $eq: ["$lastActiveDay", yesterday] }, { $add: [{ $ifNull: ["$streak", 0] }, 1] }, 1] },
        ] },
        lastActiveDay: day,
        updatedAt: now,
        createdAt: { $ifNull: ["$createdAt", now] },
      } },
      { $set: {
        level: { $switch: {
          branches: [
            { case: { $gte: ["$xp", 5000] }, then: { $add: [10, { $floor: { $sqrt: { $divide: [{ $subtract: ["$xp", 5000] }, 1000] } } }] } },
            { case: { $gte: ["$xp", 3700] }, then: 9 },
            { case: { $gte: ["$xp", 2700] }, then: 8 },
            { case: { $gte: ["$xp", 1900] }, then: 7 },
            { case: { $gte: ["$xp", 1300] }, then: 6 },
            { case: { $gte: ["$xp", 850] }, then: 5 },
            { case: { $gte: ["$xp", 500] }, then: 4 },
            { case: { $gte: ["$xp", 250] }, then: 3 },
            { case: { $gte: ["$xp", 100] }, then: 2 },
          ],
          default: 1,
        } },
      } },
    ],
    { upsert: true, returnDocument: "after" },
  );
  return { awarded: true, xp: updated?.xp ?? amount, level: updated?.level ?? levelForXp(amount), streak: updated?.streak ?? 1 };
}

export async function getUserProgress(userId: string) {
  const db = await getDb();
  const current = await db.collection<UserProgressDoc>("user_progress").findOne({ userId });
  return { xp: current?.xp ?? 0, level: current?.level ?? 1, streak: current?.streak ?? 0, lastActiveDay: current?.lastActiveDay ?? null };
}
