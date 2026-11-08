import { getDb } from "./mongodb";
import type { AnalyticsEventDoc, TrafficChannel } from "./types";

const TTL_SECONDS = 400 * 24 * 60 * 60;
const globalForIdx = globalThis as unknown as { _analyticsIdx?: Promise<unknown> };

export async function eventsCollection() {
  const db = await getDb();
  const col = db.collection<AnalyticsEventDoc>("analytics_events");
  globalForIdx._analyticsIdx ??= Promise.all([
    col.createIndex({ t: 1 }, { expireAfterSeconds: TTL_SECONDS }),
    col.createIndex({ type: 1, t: 1 }),
  ]).catch(() => undefined);
  await globalForIdx._analyticsIdx;
  return col;
}

/** Never throws: tracking must not be able to break a page or a game round. */
export async function recordEvent(event: Omit<AnalyticsEventDoc, "_id" | "t">) {
  try {
    const col = await eventsCollection();
    await col.insertOne({ ...event, t: new Date() } as AnalyticsEventDoc);
  } catch (err) {
    console.error("recordEvent:", err);
  }
}

// ---------- where a visitor came from ----------

const REF_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/;

/** A ?ref= / utm_source value, or null when it is missing or not a plain short word. */
export function cleanRef(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  return REF_RE.test(v) ? v : null;
}

export function hostFromUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value || value.length > 300) return null;
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host.slice(0, 100) || null;
  } catch {
    return null;
  }
}

const SEARCH = [
  ["google", "google"],
  ["bing.com", "bing"],
  ["duckduckgo.com", "duckduckgo"],
  ["yahoo.com", "yahoo"],
  ["yandex", "yandex"],
  ["baidu.com", "baidu"],
  ["ecosia.org", "ecosia"],
  ["search.brave.com", "brave"],
  ["startpage.com", "startpage"],
] as const;

const SOCIAL = [
  ["instagram", "instagram"],
  ["facebook", "facebook"],
  ["youtube", "youtube"],
  ["youtu.be", "youtube"],
  ["t.co", "x"],
  ["twitter", "x"],
  ["x.com", "x"],
  ["t.me", "telegram"],
  ["telegram", "telegram"],
  ["reddit", "reddit"],
  ["linkedin", "linkedin"],
  ["tiktok", "tiktok"],
  ["whatsapp", "whatsapp"],
  ["discord", "discord"],
  ["pinterest", "pinterest"],
] as const;

function matches(host: string, key: string) {
  return host === key || host.endsWith(`.${key}`) || (key.length > 5 && host.includes(key));
}

/**
 * Channel + readable source for the first page of a visit.
 * A ?ref= campaign tag always wins, because it is the one thing you control
 * (referrers are often stripped by in-app browsers).
 */
export function classifySource(opts: {
  ref: string | null;
  referrerHost: string | null;
  siteHost: string | null;
}): { channel: TrafficChannel; source: string } {
  if (opts.ref) return { channel: "campaign", source: opts.ref };
  const host = opts.referrerHost?.replace(/^(www|m|l|lm|mobile)\./, "") ?? null;
  if (!host) return { channel: "direct", source: "direct" };
  const site = opts.siteHost?.replace(/^www\./, "");
  if (site && (host === site || host.endsWith(`.${site}`))) return { channel: "internal", source: "internal" };

  for (const [key, name] of SEARCH) if (matches(host, key)) return { channel: "search", source: name };
  for (const [key, name] of SOCIAL) if (matches(host, key)) return { channel: "social", source: name };
  return { channel: "referral", source: host };
}
