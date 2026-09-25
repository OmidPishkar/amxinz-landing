import { getDb } from "./mongodb";
import type { RateDoc } from "./types";

const globalForRate = globalThis as unknown as { _rateIndex?: Promise<unknown> };

/** Fixed-window limiter backed by MongoDB (works on serverless). Returns false when over the limit. */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const db = await getDb();
  const col = db.collection<RateDoc>("rate_limits");

  // Old windows delete themselves. Created once per server instance.
  globalForRate._rateIndex ??= col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => undefined);
  await globalForRate._rateIndex;

  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  const doc = await col.findOneAndUpdate(
    { _id: `${key}:${bucket}` },
    {
      $inc: { n: 1 },
      $setOnInsert: { expiresAt: new Date((bucket + 1) * windowSec * 1000 + 60_000) },
    },
    { upsert: true, returnDocument: "after" },
  );
  return (doc?.n ?? 1) <= limit;
}
