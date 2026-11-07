import { getDb } from "./mongodb";
import type { RatingDoc } from "./types";

const globalForIdx = globalThis as unknown as { _ratingIdx?: Promise<unknown> };

async function ratingsCollection() {
  const db = await getDb();
  const col = db.collection<RatingDoc>("user_ratings");
  // One rating per rater per player; rating again replaces the old one.
  globalForIdx._ratingIdx ??= Promise.all([
    col.createIndex({ targetId: 1, raterId: 1 }, { unique: true }),
    col.createIndex({ targetId: 1 }),
  ]).catch(() => undefined);
  await globalForIdx._ratingIdx;
  return col;
}

/** stars 1-5 saves or replaces the rating; 0 removes it. */
export async function setRating(targetId: string, raterId: string, stars: number) {
  const col = await ratingsCollection();
  if (stars === 0) {
    await col.deleteOne({ targetId, raterId });
    return;
  }
  const now = new Date();
  await col.updateOne(
    { targetId, raterId },
    { $set: { stars, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );
}

export async function getRatingSummary(targetId: string): Promise<{ average: number; count: number }> {
  const col = await ratingsCollection();
  const rows = (await col
    .aggregate([{ $match: { targetId } }, { $group: { _id: null, avg: { $avg: "$stars" }, n: { $sum: 1 } } }])
    .toArray()) as unknown as { avg: number; n: number }[];
  const row = rows[0];
  return { average: row ? Math.round(row.avg * 10) / 10 : 0, count: row?.n ?? 0 };
}

export async function getMyRating(targetId: string, raterId: string): Promise<number> {
  const col = await ratingsCollection();
  return (await col.findOne({ targetId, raterId }))?.stars ?? 0;
}
