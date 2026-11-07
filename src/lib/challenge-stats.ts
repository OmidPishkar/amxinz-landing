import { CHALLENGE_SIZE } from "./game";
import { challengeCollections, topFinishers } from "./challenges";
import type { ChallengePodiumEntry } from "./types";

// ---------- badges ----------

// A podium (and so a badge) needs a real contest: at least this many finishers.
const MIN_FINISHERS_FOR_PODIUM = 2;

/**
 * Challenges have no scheduler, so ended ones are closed lazily: the first page load after
 * a challenge ends writes its podium (top 3) onto it, once. Safe to call from any page;
 * it never throws and does nothing when there is nothing to close.
 */
export async function finalizeEndedChallenges(limit = 20): Promise<void> {
  try {
    const { challenges, entries } = await challengeCollections();
    const due = await challenges
      .find({ endsAt: { $lte: new Date() }, finalizedAt: { $exists: false } }, { projection: { code: 1 } })
      .limit(limit)
      .toArray();

    for (const { _id, code } of due) {
      const finished = await entries.countDocuments({ challengeCode: code, finishedAt: { $ne: null } });
      const podium: ChallengePodiumEntry[] =
        finished >= MIN_FINISHERS_FOR_PODIUM
          ? (await topFinishers(code, 3)).map((r, i) => ({
              userId: r.userId,
              place: (i + 1) as 1 | 2 | 3,
              score: r.score,
              correct: r.correct,
            }))
          : [];
      // Only the first request to get here writes; a concurrent one matches nothing.
      await challenges.updateOne({ _id, finalizedAt: { $exists: false } }, { $set: { finalizedAt: new Date(), podium } });
    }
  } catch (err) {
    console.error("finalizeEndedChallenges:", err);
  }
}

export interface BadgeCounts {
  gold: number; // challenge wins
  silver: number; // second places
  bronze: number; // third places
}

/** Podium finishes per player, from the podiums stored on ended challenges. Never throws: badges are decoration. */
export async function getBadgesForUsers(ids: string[]): Promise<Map<string, BadgeCounts>> {
  const result = new Map<string, BadgeCounts>();
  if (ids.length === 0) return result;
  try {
    const { challenges } = await challengeCollections();
    const rows = (await challenges
      .aggregate([
        { $match: { "podium.userId": { $in: ids } } },
        { $project: { podium: 1 } },
        { $unwind: "$podium" },
        { $match: { "podium.userId": { $in: ids } } },
        { $group: { _id: { u: "$podium.userId", place: "$podium.place" }, n: { $sum: 1 } } },
      ])
      .toArray()) as unknown as { _id: { u: string; place: number }; n: number }[];

    for (const r of rows) {
      const c = result.get(r._id.u) ?? { gold: 0, silver: 0, bronze: 0 };
      if (r._id.place === 1) c.gold += r.n;
      else if (r._id.place === 2) c.silver += r.n;
      else if (r._id.place === 3) c.bronze += r.n;
      result.set(r._id.u, c);
    }
  } catch (err) {
    console.error("getBadgesForUsers:", err);
  }
  return result;
}

// ---------- a player's challenge history ----------

export interface ChallengeActivityItem {
  code: string;
  title: string;
  status: "finished" | "in_progress" | "missed";
  score: number;
  correct: number;
  answered: number;
  rank: number | null; // only for finished entries
  finishers: number;
  startedAt: Date;
  endsAt: Date;
}

export interface ChallengeActivity {
  played: number;
  finished: number;
  avgScore: number | null;
  items: ChallengeActivityItem[];
}

async function rankOf(code: string, score: number, correct: number, durationMs: number) {
  const { entries } = await challengeCollections();
  const finishedFilter = { challengeCode: code, finishedAt: { $ne: null } };
  const [better, finishers] = await Promise.all([
    entries.countDocuments({
      ...finishedFilter,
      $expr: {
        $or: [
          { $gt: ["$score", score] },
          { $and: [{ $eq: ["$score", score] }, { $gt: ["$correct", correct] }] },
          {
            $and: [
              { $eq: ["$score", score] },
              { $eq: ["$correct", correct] },
              { $lt: [{ $subtract: ["$finishedAt", "$startedAt"] }, durationMs] },
            ],
          },
        ],
      },
    }),
    entries.countDocuments(finishedFilter),
  ]);
  return { rank: better + 1, finishers };
}

/**
 * Newest challenges a player took part in. With publicOnly, challenges that are
 * "link only" are left out so a public profile never exposes a private link.
 */
export async function getChallengeActivity(
  userId: string,
  { publicOnly = false, limit = 20 }: { publicOnly?: boolean; limit?: number } = {},
): Promise<ChallengeActivity> {
  const { challenges, entries } = await challengeCollections();

  const [played, finished, avg, recent] = await Promise.all([
    entries.countDocuments({ userId }),
    entries.countDocuments({ userId, finishedAt: { $ne: null } }),
    entries
      .aggregate([
        { $match: { userId, finishedAt: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: "$score" } } },
      ])
      .toArray() as unknown as Promise<{ avg: number }[]>,
    entries.find({ userId }).sort({ startedAt: -1 }).limit(60).toArray(),
  ]);

  const docs = await challenges
    .find({ code: { $in: recent.map((e) => e.challengeCode) } }, { projection: { items: 0 } })
    .toArray();
  const byCode = new Map(docs.map((c) => [c.code, c]));
  const now = new Date();

  const visible = recent
    .map((e) => ({ entry: e, challenge: byCode.get(e.challengeCode) }))
    .filter((x): x is { entry: typeof x.entry; challenge: NonNullable<typeof x.challenge> } => !!x.challenge)
    .filter((x) => !publicOnly || x.challenge.isPublic)
    .slice(0, limit);

  const items = await Promise.all(
    visible.map(async ({ entry, challenge }): Promise<ChallengeActivityItem> => {
      const done = !!entry.finishedAt;
      const ranked = done
        ? await rankOf(
            entry.challengeCode,
            entry.score,
            entry.correct,
            entry.finishedAt!.getTime() - entry.startedAt.getTime(),
          )
        : null;
      return {
        code: challenge.code,
        title: challenge.title,
        status: done ? "finished" : challenge.endsAt <= now ? "missed" : "in_progress",
        score: entry.score,
        correct: entry.correct,
        answered: entry.answers.length,
        rank: ranked?.rank ?? null,
        finishers: ranked?.finishers ?? 0,
        startedAt: entry.startedAt,
        endsAt: challenge.endsAt,
      };
    }),
  );

  return { played, finished, avgScore: avg[0] ? Math.round(avg[0].avg) : null, items };
}

// ---------- a player's own answers, for the challenge detail page ----------

export interface MyAnswerRow {
  index: number;
  symbol: string;
  interval: string;
  startTime: number;
  choice: "up" | "down";
  outcome: "up" | "down";
  correct: boolean;
}

/**
 * Only charts the player has already answered, so nothing that is still hidden is revealed
 * (the candles themselves are never loaded here).
 */
export async function getMyAnswers(code: string, userId: string): Promise<MyAnswerRow[]> {
  const { challenges, entries } = await challengeCollections();
  const entry = await entries.findOne({ challengeCode: code, userId });
  if (!entry || entry.answers.length === 0) return [];

  const challenge = await challenges.findOne(
    { code },
    { projection: { "items.symbol": 1, "items.interval": 1, "items.startTime": 1, "items.outcome": 1 } },
  );
  if (!challenge) return [];

  return entry.answers
    .filter((a) => a.index >= 0 && a.index < CHALLENGE_SIZE && challenge.items[a.index])
    .map((a) => {
      const item = challenge.items[a.index];
      return {
        index: a.index,
        symbol: item.symbol,
        interval: item.interval,
        startTime: item.startTime,
        choice: a.choice,
        outcome: item.outcome,
        correct: a.correct,
      };
    });
}
