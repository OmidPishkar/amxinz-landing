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

const USERNAME_RE = /^[a-z][a-z0-9_]{2,19}$/;

export async function getUserByUsername(username: string) {
  if (!USERNAME_RE.test(username)) return null;
  const db = await getDb();
  return db.collection<UserDoc>("users").findOne({ username });
}

/** Only explicitly public profiles are eligible for the public sitemap. */
export async function listPublicUsernames() {
  const db = await getDb();
  return db.collection<UserDoc>("users").find({ profilePublic: true, username: { $type: "string" } })
    .project<{ username: string; createdAt: Date }>({ username: 1, createdAt: 1 }).limit(10000).toArray();
}
