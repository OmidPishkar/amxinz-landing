import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { eventsCollection } from "./analytics";
import { challengeCollections } from "./challenges";
import { addDays, dayStr, daysBetween, startOfDay } from "./day";
import type { BlogPostDoc, RoundDoc, UserDoc } from "./types";

// ---------- the date range the panel is filtered by ----------

export type RangeKey = "today" | "7d" | "30d" | "90d" | "custom";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface StatsRange {
  key: RangeKey;
  from: string;
  to: string;
  days: string[];
  start: Date; // inclusive
  end: Date; // exclusive
  prevStart: Date; // the period of the same length right before
}

export function parseRange(sp: { range?: string; from?: string; to?: string }): StatsRange {
  const today = dayStr(new Date());
  let key: RangeKey = sp.range === "today" || sp.range === "30d" || sp.range === "90d" || sp.range === "custom" ? sp.range : "7d";
  let from = addDays(today, -6);
  let to = today;

  if (key === "today") from = today;
  else if (key === "30d") from = addDays(today, -29);
  else if (key === "90d") from = addDays(today, -89);
  else if (key === "custom") {
    if (sp.from && DATE_RE.test(sp.from) && sp.to && DATE_RE.test(sp.to)) {
      to = sp.to > today ? today : sp.to;
      from = sp.from > to ? to : sp.from;
      if (from < addDays(to, -365)) from = addDays(to, -365); // at most a year at a time
    } else key = "7d";
  }

  const days = daysBetween(from, to);
  return {
    key,
    from,
    to,
    days,
    start: startOfDay(from),
    end: startOfDay(addDays(to, 1)),
    prevStart: startOfDay(addDays(from, -days.length)),
  };
}

export interface DayPoint {
  day: string;
  value: number;
}

const dayOf = (field: string) => ({ $dateToString: { format: "%Y-%m-%d", date: field, timezone: "UTC" } });

/** Turns {day: n} into one point per day (missing days are 0). */
function series(days: string[], map: Map<string, number>): DayPoint[] {
  return days.map((day) => ({ day, value: map.get(day) ?? 0 }));
}

function toMap(rows: { _id: string; n: number }[]) {
  return new Map(rows.map((r) => [r._id, r.n]));
}

export const sum = (points: DayPoint[]) => points.reduce((a, p) => a + p.value, 0);

// ---------- overview ----------

export interface Metric {
  current: DayPoint[];
  total: number;
  previousTotal: number;
}

function split(all: Map<string, number>, range: StatsRange): Metric {
  const prevDays = daysBetween(dayStr(range.prevStart), addDays(range.from, -1));
  const current = series(range.days, all);
  return { current, total: sum(current), previousTotal: sum(series(prevDays, all)) };
}

export interface Overview {
  visitors: Metric;
  pageviews: Metric;
  loggedIn: Metric;
  signups: Metric;
  predictions: Metric;
  activePlayers: Metric;
  uniqueVisitors: { total: number; previous: number };
}

/** Everything is fetched once over (previous period + current period) and split by day. */
export async function getOverview(range: StatsRange): Promise<Overview> {
  const db = await getDb();
  const { entries } = await challengeCollections();
  const events = await eventsCollection();
  const from = range.prevStart;
  const to = range.end;

  const [page, signups, roundsByDay, guestByDay, answersByDay, activeRounds, activeAnswers, uniqNow, uniqPrev] =
    await Promise.all([
      events
        .aggregate([
          { $match: { type: "pageview", t: { $gte: from, $lt: to } } },
          {
            $facet: {
              pageviews: [{ $group: { _id: dayOf("$t"), n: { $sum: 1 } } }],
              visitors: [{ $group: { _id: { d: dayOf("$t"), v: "$visitorId" } } }, { $group: { _id: "$_id.d", n: { $sum: 1 } } }],
              loggedIn: [
                { $match: { userId: { $ne: null } } },
                { $group: { _id: { d: dayOf("$t"), u: "$userId" } } },
                { $group: { _id: "$_id.d", n: { $sum: 1 } } },
              ],
            },
          },
        ])
        .toArray(),
      db
        .collection<UserDoc>("users")
        .aggregate([{ $match: { createdAt: { $gte: from, $lt: to } } }, { $group: { _id: dayOf("$createdAt"), n: { $sum: 1 } } }])
        .toArray(),
      db
        .collection<RoundDoc>("rounds")
        .aggregate([
          { $match: { answered: true, userId: { $ne: null }, answeredAt: { $gte: from, $lt: to } } },
          { $group: { _id: dayOf("$answeredAt"), n: { $sum: 1 } } },
        ])
        .toArray(),
      events
        .aggregate([{ $match: { type: "guest_round", t: { $gte: from, $lt: to } } }, { $group: { _id: dayOf("$t"), n: { $sum: 1 } } }])
        .toArray(),
      entries
        .aggregate([
          { $unwind: "$answers" },
          { $match: { "answers.answeredAt": { $gte: from, $lt: to } } },
          { $group: { _id: dayOf("$answers.answeredAt"), n: { $sum: 1 } } },
        ])
        .toArray(),
      db
        .collection<RoundDoc>("rounds")
        .aggregate([
          { $match: { answered: true, userId: { $ne: null }, answeredAt: { $gte: from, $lt: to } } },
          { $group: { _id: { d: dayOf("$answeredAt"), u: "$userId" } } },
        ])
        .toArray(),
      entries
        .aggregate([
          { $unwind: "$answers" },
          { $match: { "answers.answeredAt": { $gte: from, $lt: to } } },
          { $group: { _id: { d: dayOf("$answers.answeredAt"), u: "$userId" } } },
        ])
        .toArray(),
      events
        .aggregate([{ $match: { type: "pageview", t: { $gte: range.start, $lt: to } } }, { $group: { _id: "$visitorId" } }, { $count: "n" }])
        .toArray(),
      events
        .aggregate([{ $match: { type: "pageview", t: { $gte: from, $lt: range.start } } }, { $group: { _id: "$visitorId" } }, { $count: "n" }])
        .toArray(),
    ]);

  type Rows = { _id: string; n: number }[];
  const facet = (page[0] ?? {}) as { pageviews?: Rows; visitors?: Rows; loggedIn?: Rows };

  // Predictions = signed-in solo rounds + guest rounds + challenge answers.
  const predictions = new Map<string, number>();
  for (const rows of [roundsByDay, guestByDay, answersByDay] as unknown as Rows[]) {
    for (const r of rows) predictions.set(r._id, (predictions.get(r._id) ?? 0) + r.n);
  }

  // Active players = distinct signed-in players who made at least one prediction that day.
  const active = new Map<string, Set<string>>();
  for (const rows of [activeRounds, activeAnswers] as unknown as { _id: { d: string; u: string } }[][]) {
    for (const r of rows) {
      const set = active.get(r._id.d) ?? new Set<string>();
      set.add(r._id.u);
      active.set(r._id.d, set);
    }
  }
  const activeMap = new Map([...active].map(([d, set]) => [d, set.size]));

  return {
    visitors: split(toMap(facet.visitors ?? []), range),
    pageviews: split(toMap(facet.pageviews ?? []), range),
    loggedIn: split(toMap(facet.loggedIn ?? []), range),
    signups: split(toMap(signups as unknown as Rows), range),
    predictions: split(predictions, range),
    activePlayers: split(activeMap, range),
    uniqueVisitors: {
      total: (uniqNow[0] as { n?: number } | undefined)?.n ?? 0,
      previous: (uniqPrev[0] as { n?: number } | undefined)?.n ?? 0,
    },
  };
}

// ---------- most active players ----------

export interface TopPlayer {
  userId: string;
  name: string;
  username: string | null;
  predictions: number;
}

export async function getTopPlayers(start: Date, end: Date, limit = 5): Promise<TopPlayer[]> {
  const db = await getDb();
  const { entries } = await challengeCollections();
  const [solo, challenge] = (await Promise.all([
    db
      .collection<RoundDoc>("rounds")
      .aggregate([
        { $match: { answered: true, userId: { $ne: null }, answeredAt: { $gte: start, $lt: end } } },
        { $group: { _id: "$userId", n: { $sum: 1 } } },
      ])
      .toArray(),
    entries
      .aggregate([
        { $unwind: "$answers" },
        { $match: { "answers.answeredAt": { $gte: start, $lt: end } } },
        { $group: { _id: "$userId", n: { $sum: 1 } } },
      ])
      .toArray(),
  ])) as unknown as { _id: string; n: number }[][];

  const totals = new Map<string, number>();
  for (const r of [...solo, ...challenge]) totals.set(r._id, (totals.get(r._id) ?? 0) + r.n);
  const top = [...totals].sort((a, b) => b[1] - a[1]).slice(0, limit);
  if (top.length === 0) return [];

  const users = await db
    .collection<UserDoc>("users")
    .find({ _id: { $in: top.filter(([id]) => ObjectId.isValid(id)).map(([id]) => new ObjectId(id)) } })
    .toArray();
  const byId = new Map(users.map((u) => [u._id.toString(), u]));
  return top.map(([userId, predictions]) => ({
    userId,
    name: byId.get(userId)?.name ?? "Player",
    username: byId.get(userId)?.username ?? null,
    predictions,
  }));
}

// ---------- traffic sources ----------

export interface SourceRow {
  source: string;
  channel: string;
  visitors: number;
  visits: number;
  signups: number;
}

export async function getTraffic(start: Date, end: Date) {
  const db = await getDb();
  const events = await eventsCollection();

  const [visitRows, signupRows, pathRows] = await Promise.all([
    events
      .aggregate([
        { $match: { type: "pageview", landing: true, t: { $gte: start, $lt: end } } },
        { $group: { _id: { s: "$source", c: "$channel", v: "$visitorId" }, n: { $sum: 1 } } },
        { $group: { _id: { s: "$_id.s", c: "$_id.c" }, visitors: { $sum: 1 }, visits: { $sum: "$n" } } },
      ])
      .toArray(),
    db
      .collection<UserDoc>("users")
      .aggregate([
        { $match: { createdAt: { $gte: start, $lt: end }, source: { $exists: true } } },
        { $group: { _id: { s: "$source.label", c: "$source.channel" }, n: { $sum: 1 } } },
      ])
      .toArray(),
    events
      .aggregate([
        { $match: { type: "pageview", landing: true, t: { $gte: start, $lt: end } } },
        { $group: { _id: { p: "$path", s: "$source", v: "$visitorId" } } },
        { $group: { _id: { p: "$_id.p", s: "$_id.s" }, visitors: { $sum: 1 } } },
        { $sort: { visitors: -1 } },
        { $limit: 25 },
      ])
      .toArray(),
  ]);

  const rows = new Map<string, SourceRow>();
  for (const r of visitRows as unknown as { _id: { s: string; c: string }; visitors: number; visits: number }[]) {
    rows.set(r._id.s, { source: r._id.s, channel: r._id.c, visitors: r.visitors, visits: r.visits, signups: 0 });
  }
  for (const r of signupRows as unknown as { _id: { s: string; c: string }; n: number }[]) {
    const row = rows.get(r._id.s) ?? { source: r._id.s, channel: r._id.c, visitors: 0, visits: 0, signups: 0 };
    row.signups += r.n;
    rows.set(r._id.s, row);
  }

  return {
    sources: [...rows.values()].sort((a, b) => b.visitors - a.visitors || b.signups - a.signups),
    landingPaths: (pathRows as unknown as { _id: { p: string; s: string }; visitors: number }[]).map((r) => ({
      path: r._id.p,
      source: r._id.s,
      visitors: r.visitors,
    })),
  };
}

// ---------- blog ----------

export interface PostRow {
  slug: string;
  title: string;
  views: number;
  visitors: number;
  search: number;
  social: number;
  campaign: number;
  direct: number;
  referral: number;
}

const POST_PATH = /^\/weblog\/([^/]+)\/?$/;

export async function getBlogStats(start: Date, end: Date): Promise<PostRow[]> {
  const db = await getDb();
  const events = await eventsCollection();

  const [posts, rows] = await Promise.all([
    db.collection<BlogPostDoc>("blog_posts").find({ published: true }, { projection: { slug: 1, title: 1 } }).toArray(),
    events
      .aggregate([
        { $match: { type: "pageview", path: { $regex: "^/weblog/[^/]+/?$" }, t: { $gte: start, $lt: end } } },
        {
          $group: {
            _id: { $arrayElemAt: [{ $getField: { field: "captures", input: { $regexFind: { input: "$path", regex: "^/weblog/([^/]+)/?$" } } } }, 0] },
            views: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
            search: { $sum: { $cond: [{ $and: ["$landing", { $eq: ["$channel", "search"] }] }, 1, 0] } },
            social: { $sum: { $cond: [{ $and: ["$landing", { $eq: ["$channel", "social"] }] }, 1, 0] } },
            campaign: { $sum: { $cond: [{ $and: ["$landing", { $eq: ["$channel", "campaign"] }] }, 1, 0] } },
            direct: { $sum: { $cond: [{ $and: ["$landing", { $eq: ["$channel", "direct"] }] }, 1, 0] } },
            referral: { $sum: { $cond: [{ $and: ["$landing", { $eq: ["$channel", "referral"] }] }, 1, 0] } },
          },
        },
      ])
      .toArray(),
  ]);

  const stats = new Map(
    (rows as unknown as (Omit<PostRow, "slug" | "title" | "visitors"> & { _id: string; visitors: string[] })[]).map((r) => [r._id, r]),
  );
  return posts
    .filter((p) => POST_PATH.test(`/weblog/${p.slug}`))
    .map((p) => {
      const r = stats.get(p.slug);
      return {
        slug: p.slug,
        title: p.title,
        views: r?.views ?? 0,
        visitors: r?.visitors.length ?? 0,
        search: r?.search ?? 0,
        social: r?.social ?? 0,
        campaign: r?.campaign ?? 0,
        direct: r?.direct ?? 0,
        referral: r?.referral ?? 0,
      };
    })
    .sort((a, b) => b.views - a.views);
}

export async function getPostSeries(slug: string, range: StatsRange): Promise<DayPoint[]> {
  const events = await eventsCollection();
  const path = `/weblog/${slug}`;
  const rows = (await events
    .aggregate([
      { $match: { type: "pageview", path: { $in: [path, `${path}/`] }, t: { $gte: range.start, $lt: range.end } } },
      { $group: { _id: dayOf("$t"), n: { $sum: 1 } } },
    ])
    .toArray()) as unknown as { _id: string; n: number }[];
  return series(range.days, toMap(rows));
}

// ---------- challenges ----------

export interface ChallengeOverview {
  created: Metric;
  joined: Metric;
  finished: Metric;
}

export async function getChallengeOverview(range: StatsRange): Promise<ChallengeOverview> {
  const { challenges, entries } = await challengeCollections();
  const from = range.prevStart;
  const to = range.end;
  type Rows = { _id: string; n: number }[];
  const [created, joined, finished] = (await Promise.all([
    challenges.aggregate([{ $match: { createdAt: { $gte: from, $lt: to } } }, { $group: { _id: dayOf("$createdAt"), n: { $sum: 1 } } }]).toArray(),
    entries.aggregate([{ $match: { startedAt: { $gte: from, $lt: to } } }, { $group: { _id: dayOf("$startedAt"), n: { $sum: 1 } } }]).toArray(),
    entries.aggregate([{ $match: { finishedAt: { $gte: from, $lt: to } } }, { $group: { _id: dayOf("$finishedAt"), n: { $sum: 1 } } }]).toArray(),
  ])) as unknown as Rows[];
  return { created: split(toMap(created), range), joined: split(toMap(joined), range), finished: split(toMap(finished), range) };
}

export interface ChallengeRow {
  code: string;
  title: string;
  linkVisitors: number;
  joined: number;
  finished: number;
  topSource: string | null;
}

/** Challenges that were joined or whose link was opened in the range, busiest first. */
export async function getChallengeRows(start: Date, end: Date): Promise<ChallengeRow[]> {
  const { challenges, entries } = await challengeCollections();
  const events = await eventsCollection();
  const CODE = "^/challenges/([A-Za-z0-9_-]{6,12})/?$";
  const codeOf = { $arrayElemAt: [{ $getField: { field: "captures", input: { $regexFind: { input: "$path", regex: CODE } } } }, 0] };

  const [joinRows, visitRows, sourceRows] = (await Promise.all([
    entries
      .aggregate([
        { $match: { startedAt: { $gte: start, $lt: end } } },
        { $group: { _id: "$challengeCode", joined: { $sum: 1 }, finished: { $sum: { $cond: [{ $ne: ["$finishedAt", null] }, 1, 0] } } } },
      ])
      .toArray(),
    events
      .aggregate([
        { $match: { type: "pageview", path: { $regex: CODE }, t: { $gte: start, $lt: end } } },
        { $group: { _id: { c: codeOf, v: "$visitorId" } } },
        { $group: { _id: "$_id.c", visitors: { $sum: 1 } } },
      ])
      .toArray(),
    events
      .aggregate([
        { $match: { type: "pageview", landing: true, path: { $regex: CODE }, t: { $gte: start, $lt: end } } },
        { $group: { _id: { c: codeOf, s: "$source" }, n: { $sum: 1 } } },
      ])
      .toArray(),
  ])) as unknown as [
    { _id: string; joined: number; finished: number }[],
    { _id: string; visitors: number }[],
    { _id: { c: string; s: string }; n: number }[],
  ];

  const byCode = new Map<string, ChallengeRow>();
  const row = (code: string) => {
    let r = byCode.get(code);
    if (!r) byCode.set(code, (r = { code, title: code, linkVisitors: 0, joined: 0, finished: 0, topSource: null }));
    return r;
  };
  for (const r of joinRows) Object.assign(row(r._id), { joined: r.joined, finished: r.finished });
  for (const r of visitRows) row(r._id).linkVisitors = r.visitors;

  const best = new Map<string, { s: string; n: number }>();
  for (const r of sourceRows) {
    const cur = best.get(r._id.c);
    if (!cur || r.n > cur.n) best.set(r._id.c, { s: r._id.s, n: r.n });
  }
  for (const [code, b] of best) row(code).topSource = b.s;

  const titles = await challenges.find({ code: { $in: [...byCode.keys()] } }, { projection: { code: 1, title: 1 } }).toArray();
  for (const t of titles) row(t.code).title = t.title;

  return [...byCode.values()]
    .filter((r) => titles.some((t) => t.code === r.code))
    .sort((a, b) => b.joined - a.joined || b.linkVisitors - a.linkVisitors)
    .slice(0, 20);
}

// ---------- players ----------

export interface UsersOverview {
  total: number;
  withUsername: number;
  publicProfiles: number;
  newest: { id: string; name: string; username: string | null; createdAt: Date; source: string | null; played: number }[];
}

export async function getUsersOverview(): Promise<UsersOverview> {
  const db = await getDb();
  const users = db.collection<UserDoc>("users");
  const [total, withUsername, publicProfiles, newest] = await Promise.all([
    users.countDocuments({}),
    users.countDocuments({ username: { $exists: true, $ne: null } }),
    users.countDocuments({ profilePublic: true }),
    users.find({}).sort({ createdAt: -1 }).limit(15).toArray(),
  ]);
  return {
    total,
    withUsername,
    publicProfiles,
    newest: newest.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      username: u.username ?? null,
      createdAt: u.createdAt,
      source: u.source?.label ?? null,
      played: u.played,
    })),
  };
}

// ---------- link builder options ----------

export async function getLinkTargets() {
  const db = await getDb();
  const { challenges } = await challengeCollections();
  const [posts, recent] = await Promise.all([
    db.collection<BlogPostDoc>("blog_posts").find({ published: true }, { projection: { slug: 1, title: 1 } }).sort({ createdAt: -1 }).limit(30).toArray(),
    challenges.find({}, { projection: { code: 1, title: 1 } }).sort({ createdAt: -1 }).limit(15).toArray(),
  ]);
  return {
    posts: posts.map((p) => ({ label: p.title, path: `/weblog/${p.slug}` })),
    challenges: recent.map((c) => ({ label: c.title, path: `/challenges/${c.code}` })),
  };
}
