import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import type { UserDoc } from "./types";

export async function getUserStats(id: string) {
  const db = await getDb();
  const user = await db
    .collection<UserDoc>("users")
    .findOne({ _id: new ObjectId(id) });
  return {
    score: user?.score ?? 0,
    played: user?.played ?? 0,
    correct: user?.correct ?? 0,
  };
}

export async function getUserById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return db.collection<UserDoc>("users").findOne({ _id: new ObjectId(id) });
}
