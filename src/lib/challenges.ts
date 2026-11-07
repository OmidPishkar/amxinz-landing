import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { buildRound } from "./binance";
import { CHALLENGE_SIZE, POINTS_CORRECT, POINTS_WRONG } from "./game";
import type { CandleDoc, ChallengeDoc, ChallengeEntryDoc, ChallengeItem, UserDoc } from "./types";

export const CODE_RE = /^[A-Za-z0-9_-]{6,12}$/;

const DAY_MS = 24 * 60 * 60 * 1000;
const globalForIdx = globalThis as unknown as { _challengeIdx?: Promise<unknown> };

export async function challengeCollections() {
  const db = await getDb();
  const challenges = db.collection<ChallengeDoc>("challenges");
  const entries = db.collection<ChallengeEntryDoc>("challenge_entries");
  globalForIdx._challengeIdx ??= Promise.all([
    challenges.createIndex({ code: 1 }, { unique: true }),
    challenges.createIndex({ isPublic: 1, endsAt: -1, createdAt: -1 }),
    challenges.createIndex({ endsAt: 1, finalizedAt: 1 }),
    challenges.createIndex({ "podium.userId": 1 }),
    entries.createIndex({ challengeCode: 1, userId: 1 }, { unique: true }),
    entries.createIndex({ challengeCode: 1, finishedAt: 1 }),
  ]).catch(() => undefined);
  await globalForIdx._challengeIdx;
  return { db, challenges, entries };
}

function isDuplicateKeyError(err: unknown) {
  return !!err && typeof err === "object" && "code" in err && (err as { code?: number }).code === 11000;
}

/** @name or the account name, so a Google real name is not shown when a username exists. */
export function playerName(u: Pick<UserDoc, "name" | "username"> | undefined) {
  if (!u) return "Player";
  return u.username ? `@${u.username}` : u.name;
}

// ---------- creating and reading challenges ----------

export async function createChallenge(input: {
  creatorId: string;
  title: string;
  days: number;
  isPublic: boolean;
}): Promise<ChallengeDoc> {
  // Every player gets these same charts. Built once, up front, from real Binance data.
  const rounds = await Promise.all(Array.from({ length: CHALLENGE_SIZE }, () => buildRound()));
  const items: ChallengeItem[] = rounds.map((r) => ({
    symbol: r.symbol,
    interval: r.interval,
    startTime: r.startTime,
    outcome: r.outcome,
    visible: r.visible,
    future: r.future,
  }));

  const { challenges } = await challengeCollections();
  const now = new Date();
  for (let attempt = 0; attempt < 4; attempt++) {
    const doc: ChallengeDoc = {
      _id: new ObjectId(),
      code: randomBytes(6).toString("base64url"),
      title: input.title,
      creatorId: input.creatorId,
      isPublic: input.isPublic,
      items,
      createdAt: now,
      endsAt: new Date(now.getTime() + input.days * DAY_MS),
    };
    try {
      await challenges.insertOne(doc);
      return doc;
    } catch (err) {
      if (!isDuplicateKeyError(err)) throw err;
    }
  }
  throw new Error("Could not generate a unique challenge link.");
}

/** The challenge WITHOUT its charts. Use this for every page; the charts must never reach the browser in bulk. */
export async function getChallenge(code: string): Promise<Omit<ChallengeDoc, "items"> | null> {
  if (!CODE_RE.test(code)) return null;
  const { challenges } = await challengeCollections();
  return challenges.findOne({ code }, { projection: { items: 0 } });
}

export async function getUserNames(ids: string[]): Promise<Map<string, UserDoc>> {
  const valid = ids.filter((id) => ObjectId.isValid(id));
  if (valid.length === 0) return new Map<string, UserDoc>();
  const { db } = await challengeCollections();
  const users = await db
    .collection<UserDoc>("users")
    .find({ _id: { $in: valid.map((id) => new ObjectId(id)) } })
    .toArray();
  return new Map<string, UserDoc>(users.map((u): [string, UserDoc] => [u._id.toString(), u]));
}

export async function listOpenChallenges(limit = 20) {
  const { challenges, entries } = await challengeCollections();
  const open = await challenges
    .find({ isPublic: true, endsAt: { $gt: new Date() } }, { projection: { items: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  const codes = open.map((c) => c.code);
  const counts = codes.length
    ? ((await entries
        .aggregate([{ $match: { challengeCode: { $in: codes } } }, { $group: { _id: "$challengeCode", players: { $sum: 1 } } }])
        .toArray()) as unknown as { _id: string; players: number }[])
    : [];
  const playersByCode = new Map(counts.map((c) => [c._id, c.players]));
  const creators = await getUserNames(open.map((c) => c.creatorId));

  return open.map((c) => ({
    challenge: c,
    players: playersByCode.get(c.code) ?? 0,
    creator: playerName(creators.get(c.creatorId)),
  }));
}

// ---------- playing ----------

export async function getEntry(code: string, userId: string) {
  const { entries } = await challengeCollections();
  return entries.findOne({ challengeCode: code, userId });
}

export type NextResult =
  | { status: "playing"; index: number; total: number; interval: string; candles: CandleDoc[]; score: number }
  | { status: "finished"; score: number; correct: number; total: number }
  | { status: "error"; code: number; error: string };

/** Starts the player's entry on first call, then returns the one chart they must answer next. */
export async function nextChart(code: string, userId: string): Promise<NextResult> {
  if (!CODE_RE.test(code)) return { status: "error", code: 404, error: "Challenge not found." };
  const { challenges, entries } = await challengeCollections();

  const challenge = await challenges.findOne({ code });
  if (!challenge) return { status: "error", code: 404, error: "Challenge not found." };

  const existing = await entries.findOne({ challengeCode: code, userId });
  if (challenge.endsAt <= new Date() && !existing?.finishedAt) {
    return { status: "error", code: 410, error: "This challenge has ended." };
  }

  const entry =
    existing ??
    (await entries.findOneAndUpdate(
      { challengeCode: code, userId },
      { $setOnInsert: { startedAt: new Date(), answers: [], score: 0, correct: 0, finishedAt: null } },
      { upsert: true, returnDocument: "after" },
    ));
  if (!entry) return { status: "error", code: 500, error: "Could not start the challenge." };

  if (entry.finishedAt || entry.answers.length >= CHALLENGE_SIZE) {
    return { status: "finished", score: entry.score, correct: entry.correct, total: CHALLENGE_SIZE };
  }

  const index = entry.answers.length;
  const item = challenge.items[index];
  return {
    status: "playing",
    index,
    total: CHALLENGE_SIZE,
    interval: item.interval,
    candles: item.visible, // only the chart being answered, never the future candles
    score: entry.score,
  };
}

export type AnswerResult =
  | {
      ok: true;
      correct: boolean;
      outcome: "up" | "down";
      delta: number;
      future: CandleDoc[];
      reveal: { symbol: string; interval: string; startTime: number };
      answered: number;
      finished: boolean;
      score: number;
      correctCount: number;
    }
  | { ok: false; status: number; error: string };

export async function submitAnswer(
  code: string,
  userId: string,
  index: number,
  direction: "up" | "down",
): Promise<AnswerResult> {
  if (!CODE_RE.test(code)) return { ok: false, status: 404, error: "Challenge not found." };
  if (!Number.isInteger(index) || index < 0 || index >= CHALLENGE_SIZE) {
    return { ok: false, status: 400, error: "Invalid request." };
  }

  const { challenges, entries } = await challengeCollections();
  const challenge = await challenges.findOne({ code });
  if (!challenge) return { ok: false, status: 404, error: "Challenge not found." };

  const now = new Date();
  if (challenge.endsAt <= now) return { ok: false, status: 410, error: "This challenge has ended." };

  const item = challenge.items[index];
  const correct = item.outcome === direction;
  const delta = correct ? POINTS_CORRECT : POINTS_WRONG;
  const finishing = index === CHALLENGE_SIZE - 1;

  // The filter only matches when the player has answered exactly `index` charts so far,
  // so a double click, a replay, or skipping ahead matches nothing and changes nothing.
  const updated = await entries.findOneAndUpdate(
    { challengeCode: code, userId, finishedAt: null, answers: { $size: index } },
    {
      $push: { answers: { index, choice: direction, correct, answeredAt: now } },
      $inc: { score: delta, correct: correct ? 1 : 0 },
      ...(finishing ? { $set: { finishedAt: now } } : {}),
    },
    { returnDocument: "after" },
  );
  if (!updated) {
    return { ok: false, status: 409, error: "That chart was already answered. Reload to continue." };
  }

  return {
    ok: true,
    correct,
    outcome: item.outcome,
    delta,
    future: item.future,
    reveal: { symbol: item.symbol, interval: item.interval, startTime: item.startTime },
    answered: updated.answers.length,
    finished: finishing,
    score: updated.score,
    correctCount: updated.correct,
  };
}

// ---------- results ----------

export interface FinisherRow {
  userId: string;
  score: number;
  correct: number;
  durationMs: number;
}

/** Finished players ranked by score, then correct calls, then the faster total time. */
export async function topFinishers(code: string, limit: number): Promise<FinisherRow[]> {
  const { entries } = await challengeCollections();
  return (await entries
    .aggregate([
      { $match: { challengeCode: code, finishedAt: { $ne: null } } },
      { $addFields: { durationMs: { $subtract: ["$finishedAt", "$startedAt"] } } },
      { $sort: { score: -1, correct: -1, durationMs: 1 } },
      { $limit: limit },
      { $project: { userId: 1, score: 1, correct: 1, durationMs: 1 } },
    ])
    .toArray()) as unknown as FinisherRow[];
}

export interface LeaderboardRow extends FinisherRow {
  name: string;
  image: string | null;
  username: string | null; // set only when the player's profile is public
}

export async function getLeaderboard(code: string, limit = 50) {
  const { entries } = await challengeCollections();

  const rows = await topFinishers(code, limit);
  const [players, finished] = await Promise.all([
    entries.countDocuments({ challengeCode: code }),
    entries.countDocuments({ challengeCode: code, finishedAt: { $ne: null } }),
  ]);
  const users = await getUserNames(rows.map((r) => r.userId));

  const board: LeaderboardRow[] = rows.map((r) => {
    const u = users.get(r.userId);
    return {
      ...r,
      name: playerName(u),
      image: u?.avatarUrl ?? u?.image ?? null,
      username: u?.profilePublic && u.username ? u.username : null,
    };
  });

  return { board, players, finished };
}
