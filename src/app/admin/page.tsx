import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { SITE_URL } from "@/config/site";
import { addDays, dayStr, startOfDay } from "@/lib/day";
import {
  getBlogStats,
  getChallengeOverview,
  getChallengeRows,
  getLinkTargets,
  getOverview,
  getPostSeries,
  getTopPlayers,
  getTraffic,
  getUsersOverview,
  parseRange,
  type RangeKey,
  type TopPlayer,
} from "@/lib/admin-stats";
import { BarChart } from "@/components/admin/bar-chart";
import { StatCard } from "@/components/admin/stat-card";
import { AdminDateInputs } from "@/components/admin/date-inputs";
import { LinkBuilder } from "@/components/admin/link-builder";
import { LocalTime } from "@/components/profile/local-time";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin panel",
  robots: { index: false, follow: false },
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "traffic", label: "Traffic" },
  { id: "blog", label: "Blog" },
  { id: "challenges", label: "Challenges" },
  { id: "users", label: "Players" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const PRESETS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];

type SearchParams = { tab?: string; range?: string; from?: string; to?: string; post?: string };

function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-[13px]">
        <thead className="border-b bg-muted text-left text-muted-foreground">
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col" className={cn("px-3 py-2 font-medium", i > 0 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && <p className="px-3 py-3 text-[13px] text-muted-foreground">{empty}</p>}
    </div>
  );
}

const num = "px-3 py-2 text-right tabular-nums";

function PlayersTable({ rows }: { rows: TopPlayer[] }) {
  return (
    <Table head={["Player", "Predictions"]} empty={rows.length === 0 ? "No predictions in this period." : undefined}>
      {rows.map((p) => (
        <tr key={p.userId} className="border-b last:border-0">
          <td className="px-3 py-2">
            {p.username ? (
              <Link href={`/u/${p.username}`} className="hover:underline">
                @{p.username}
              </Link>
            ) : (
              p.name
            )}
          </td>
          <td className={num}>{p.predictions}</td>
        </tr>
      ))}
    </Table>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await getServerSession(authOptions);
  // Not even a hint that this page exists for anyone else.
  if (!(await isAdminSession(session))) notFound();

  const sp = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === sp.tab) ? (sp.tab as Tab) : "overview";
  const range = parseRange(sp);
  const today = dayStr(new Date());

  const href = (o: Partial<{ tab: Tab; range: RangeKey; post: string | null }>) => {
    const params = new URLSearchParams();
    params.set("tab", o.tab ?? tab);
    const r = o.range ?? range.key;
    params.set("range", r);
    if (r === "custom") {
      params.set("from", range.from);
      params.set("to", range.to);
    }
    const post = o.post === undefined ? sp.post : o.post;
    if (post && (o.tab ?? tab) === "blog") params.set("post", post);
    return `/admin?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin panel</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {range.from === range.to ? range.from : `${range.from} to ${range.to}`} · days are UTC, compared with the{" "}
            {range.days.length} {range.days.length === 1 ? "day" : "days"} before
          </p>
        </div>
        <Link href="/profile" className="text-[13px] text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Back to profile
        </Link>
      </div>

      <nav aria-label="Sections" className="mt-6 flex flex-wrap gap-1 border-b">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={href({ tab: t.id, post: null })}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-[13px]",
              tab === t.id ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab !== "users" && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Date range" className="flex gap-1">
            {PRESETS.map((p) => (
              <Link
                key={p.key}
                href={href({ range: p.key })}
                aria-current={range.key === p.key ? "true" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[13px] hover:bg-accent",
                  range.key === p.key ? "bg-accent font-medium" : "text-muted-foreground",
                )}
              >
                {p.label}
              </Link>
            ))}
          </div>
          <AdminDateInputs from={range.from} to={range.to} max={today} />
        </div>
      )}

      <div className="mt-6">
        {tab === "overview" && <OverviewTab range={range} />}
        {tab === "traffic" && <TrafficTab range={range} />}
        {tab === "blog" && <BlogTab range={range} post={sp.post} hrefFor={(slug) => href({ post: slug })} />}
        {tab === "challenges" && <ChallengesTab range={range} />}
        {tab === "users" && <UsersTab />}
      </div>

      <p className="mt-10 border-t pt-4 text-xs text-muted-foreground">
        Visit tracking started when this version was deployed; earlier days only have signups, predictions and
        challenges. To keep your own visits out of the numbers, open <code>{SITE_URL}/?notrack=1</code> once in each
        browser (and <code>?notrack=0</code> to count it again).
      </p>
    </div>
  );
}

type Range = ReturnType<typeof parseRange>;

async function OverviewTab({ range }: { range: Range }) {
  const todayStart = startOfDay(dayStr(new Date()));
  const [o, top, topToday] = await Promise.all([
    getOverview(range),
    getTopPlayers(range.start, range.end),
    getTopPlayers(todayStart, startOfDay(addDays(dayStr(new Date()), 1))),
  ]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Visitors" unit="visitors" metric={o.visitors} total={o.uniqueVisitors.total} previous={o.uniqueVisitors.previous} />
        <StatCard title="Page views" unit="views" metric={o.pageviews} />
        <StatCard title="Signed-in visitors" unit="players" metric={o.loggedIn} />
        <StatCard title="New signups" unit="signups" metric={o.signups} />
        <StatCard title="Predictions (solo, guest and challenge)" unit="predictions" metric={o.predictions} />
        <StatCard title="Active players (made a prediction)" unit="players" metric={o.activePlayers} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-base font-semibold tracking-tight">Most active in this period</h2>
          <PlayersTable rows={top} />
        </div>
        <div>
          <h2 className="mb-2 text-base font-semibold tracking-tight">Most active today</h2>
          <PlayersTable rows={topToday} />
        </div>
      </div>
    </>
  );
}

async function TrafficTab({ range }: { range: Range }) {
  const [{ sources, landingPaths }, targets] = await Promise.all([getTraffic(range.start, range.end), getLinkTargets()]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-base font-semibold tracking-tight">Where visitors come from</h2>
        <Table
          head={["Source", "Channel", "Visitors", "Visits", "Signups", "Signups per visitor"]}
          empty={sources.length === 0 ? "No visits recorded in this period yet." : undefined}
        >
          {sources.map((r) => (
            <tr key={`${r.channel}-${r.source}`} className="border-b last:border-0">
              <td className="px-3 py-2 font-medium">{r.source}</td>
              <td className={cn(num, "text-left capitalize text-muted-foreground")}>{r.channel}</td>
              <td className={num}>{r.visitors}</td>
              <td className={num}>{r.visits}</td>
              <td className={num}>{r.signups}</td>
              <td className={num}>{r.visitors > 0 ? `${Math.round((r.signups / r.visitors) * 100)}%` : "–"}</td>
            </tr>
          ))}
        </Table>
        <p className="mt-2 text-xs text-muted-foreground">
          &ldquo;Campaign&rdquo; rows are links you tagged with <code>?ref=</code>. Instagram and TikTok often hide the
          referrer, so tag your links. Signups are credited to the first source a person arrived from.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-base font-semibold tracking-tight">Top landing pages</h2>
        <Table head={["Page", "Source", "Visitors"]} empty={landingPaths.length === 0 ? "Nothing yet." : undefined}>
          {landingPaths.map((r) => (
            <tr key={`${r.path}-${r.source}`} className="border-b last:border-0">
              <td className="max-w-[18rem] truncate px-3 py-2">{r.path}</td>
              <td className={cn(num, "text-left text-muted-foreground")}>{r.source}</td>
              <td className={num}>{r.visitors}</td>
            </tr>
          ))}
        </Table>
      </div>

      <LinkBuilder siteUrl={SITE_URL} challenges={targets.challenges} posts={targets.posts} />
    </div>
  );
}

async function BlogTab({ range, post, hrefFor }: { range: Range; post: string | undefined; hrefFor: (slug: string) => string }) {
  const rows = await getBlogStats(range.start, range.end);
  const selected = rows.find((r) => r.slug === post) ?? null;
  const daily = selected ? await getPostSeries(selected.slug, range) : [];
  const totals = rows.reduce(
    (a, r) => ({ views: a.views + r.views, search: a.search + r.search }),
    { views: 0, search: 0 },
  );

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
        {[
          ["Posts", rows.length],
          ["Views in period", totals.views],
          ["Visits from search engines", totals.search],
        ].map(([label, value]) => (
          <div key={label} className="bg-background px-3 py-2">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <Table
        head={["Post", "Views", "Visitors", "Search", "Social", "Campaign", "Direct", "Other sites"]}
        empty={rows.length === 0 ? "No published posts yet." : undefined}
      >
        {rows.map((r) => (
          <tr key={r.slug} className={cn("border-b last:border-0", selected?.slug === r.slug && "bg-muted")}>
            <td className="max-w-[16rem] truncate px-3 py-2">
              <Link href={hrefFor(r.slug)} className="hover:underline">
                {r.title}
              </Link>
            </td>
            <td className={num}>{r.views}</td>
            <td className={num}>{r.visitors}</td>
            <td className={num}>{r.search}</td>
            <td className={num}>{r.social}</td>
            <td className={num}>{r.campaign}</td>
            <td className={num}>{r.direct}</td>
            <td className={num}>{r.referral}</td>
          </tr>
        ))}
      </Table>

      {selected ? (
        <div className="rounded-lg border p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px] font-medium">{selected.title}</p>
            <Link href={`/weblog/${selected.slug}`} className="text-xs text-muted-foreground underline underline-offset-4">
              Open post
            </Link>
          </div>
          <p className="mb-3 text-2xl font-semibold tabular-nums">{selected.views.toLocaleString()} views</p>
          <BarChart data={daily} unit="views" />
        </div>
      ) : (
        rows.length > 0 && <p className="text-[13px] text-muted-foreground">Click a post to see its views day by day.</p>
      )}

      <p className="text-xs text-muted-foreground">
        &ldquo;Search&rdquo; counts visits that arrived from a search engine such as Google or Bing. How often a post was{" "}
        <em>shown</em> in results, and the keywords people typed, only exist in Google Search Console:{" "}
        <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
          open it
        </a>
        . Search engines hide most keywords from sites.
      </p>
    </div>
  );
}

async function ChallengesTab({ range }: { range: Range }) {
  const [o, rows] = await Promise.all([getChallengeOverview(range), getChallengeRows(range.start, range.end)]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Challenges created" unit="challenges" metric={o.created} />
        <StatCard title="Players joined" unit="joins" metric={o.joined} />
        <StatCard title="Challenges finished" unit="finishes" metric={o.finished} />
      </div>

      <div>
        <h2 className="mb-2 text-base font-semibold tracking-tight">Challenges with activity in this period</h2>
        <Table
          head={["Challenge", "Link visitors", "Joined", "Finished", "Completion", "Top source"]}
          empty={rows.length === 0 ? "No challenge was joined in this period." : undefined}
        >
          {rows.map((r) => (
            <tr key={r.code} className="border-b last:border-0">
              <td className="max-w-[16rem] truncate px-3 py-2">
                <Link href={`/challenges/${r.code}`} className="hover:underline">
                  {r.title}
                </Link>
              </td>
              <td className={num}>{r.linkVisitors}</td>
              <td className={num}>{r.joined}</td>
              <td className={num}>{r.finished}</td>
              <td className={num}>{r.joined > 0 ? `${Math.round((r.finished / r.joined) * 100)}%` : "–"}</td>
              <td className={cn(num, "text-muted-foreground")}>{r.topSource ?? "–"}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}

async function UsersTab() {
  const u = await getUsersOverview();
  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border">
        {[
          ["Players", u.total],
          ["With a username", u.withUsername],
          ["Public pages", u.publicProfiles],
        ].map(([label, value]) => (
          <div key={label} className="bg-background px-3 py-2">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <h2 className="mb-2 text-base font-semibold tracking-tight">Newest players</h2>
        <Table head={["Player", "Joined", "Came from", "Predictions"]}>
          {u.newest.map((p) => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="px-3 py-2">{p.username ? `@${p.username}` : p.name}</td>
              <td className={cn(num, "text-muted-foreground")}>
                <LocalTime iso={p.createdAt.toISOString()} />
              </td>
              <td className={cn(num, "text-muted-foreground")}>{p.source ?? "unknown"}</td>
              <td className={num}>{p.played}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
