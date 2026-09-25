import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { getPredictionPage, getPerformanceStats, getRecentForm, type ResultFilter } from "@/lib/profile";
import { POINTS_CORRECT, POINTS_WRONG } from "@/lib/game";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { EmailForm } from "@/components/profile/email-form";
import { UsernameForm } from "@/components/profile/username-form";
import { FormDots } from "@/components/profile/form-dots";
import { LocalTime } from "@/components/profile/local-time";
import { WinRateDonut } from "@/components/profile/win-rate-donut";
import { BarList } from "@/components/profile/bar-list";
import { DateRangeFilter } from "@/components/profile/date-range-filter";
import { ResultCardDownload } from "@/components/profile/result-card-download";
import { PdfDownloadButton } from "@/components/profile/pdf-download-button";
import { formatAsset, formatChartDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/lib/profile";

export const dynamic = "force-dynamic";

// Private page: keep it out of search results.
export const metadata: Metadata = {
  title: "Your profile",
  robots: { index: false, follow: false },
};

const FILTERS: { id: ResultFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "correct", label: "Correct" },
  { id: "wrong", label: "Wrong" },
];

const BANNERS: Record<string, { text: string; ok: boolean }> = {
  verified: { text: "Your email is confirmed.", ok: true },
  invalid: {
    text: "That confirmation link is invalid or has expired. Request a new one below.",
    ok: false,
  },
};

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDaysStr(dateStr: string, delta: number) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return toDateStr(d);
}

function clampStr(value: string, min: string, max: string) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface HrefState {
  filter: ResultFilter;
  from: string;
  to: string;
}

function buildHref(current: HrefState, overrides: Partial<HrefState & { page: number }>) {
  const filter = overrides.filter ?? current.filter;
  const from = overrides.from === undefined ? current.from : overrides.from;
  const to = overrides.to === undefined ? current.to : overrides.to;
  const page = overrides.page ?? 1;

  const params = new URLSearchParams();
  if (filter !== "all") params.set("result", filter);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/profile${qs ? `?${qs}` : ""}#predictions`;
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; result?: string; email?: string; from?: string; to?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/");

  const sp = await searchParams;
  const filter: ResultFilter = sp.result === "correct" || sp.result === "wrong" ? sp.result : "all";
  const requestedPage = Number.parseInt(sp.page ?? "1", 10) || 1;
  const banner = sp.email ? BANNERS[sp.email] : undefined;

  // The date filter can never reach further back than the account itself was created.
  const minDateStr = toDateStr(user.createdAt);
  const todayStr = toDateStr(new Date());
  let fromStr = sp.from && DATE_RE.test(sp.from) ? clampStr(sp.from, minDateStr, todayStr) : "";
  let toStr = sp.to && DATE_RE.test(sp.to) ? clampStr(sp.to, minDateStr, todayStr) : "";
  if (fromStr && toStr && fromStr > toStr) [fromStr, toStr] = [toStr, fromStr];

  const range: DateRange | undefined =
    fromStr || toStr
      ? {
          ...(fromStr ? { from: new Date(`${fromStr}T00:00:00.000Z`) } : {}),
          ...(toStr ? { to: new Date(`${toStr}T23:59:59.999Z`) } : {}),
        }
      : undefined;

  const hrefState: HrefState = { filter, from: fromStr, to: toStr };
  const rangePresets = [
    { label: "All time", from: "", to: "" },
    { label: "Today", from: todayStr, to: todayStr },
    { label: "This week", from: clampStr(addDaysStr(todayStr, -6), minDateStr, todayStr), to: todayStr },
    { label: "This month", from: clampStr(addDaysStr(todayStr, -29), minDateStr, todayStr), to: todayStr },
  ];
  const isActivePreset = (preset: { from: string; to: string }) => preset.from === fromStr && preset.to === toStr;

  const [{ rows, total, pages, page }, form, perf] = await Promise.all([
    getPredictionPage(session.user.id, requestedPage, filter, range),
    getRecentForm(session.user.id),
    getPerformanceStats(session.user.id),
  ]);

  const bestAssetLabel = perf.bestAsset
    ? `${formatAsset(perf.bestAsset.symbol)} · ${perf.bestAsset.winRate}% over ${perf.bestAsset.played} rounds`
    : null;

  const accuracy = user.played ? `${Math.round((user.correct / user.played) * 100)}%` : "–";
  const stats = [
    ["Score", user.score],
    ["Predictions", user.played],
    ["Correct", user.correct],
    ["Accuracy", accuracy],
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
      <p className="mt-1 text-muted-foreground">
        Signed in with {user.provider === "google" ? "Google" : "a wallet"} as {user.name}
        {user.username ? <> · <span className="text-foreground">@{user.username}</span></> : null}.
      </p>

      {banner && (
        <p
          role="status"
          className={cn("mt-4 rounded-md border px-3 py-2 text-[13px]", banner.ok ? "text-up" : "text-destructive")}
        >
          {banner.text}
        </p>
      )}

      <section aria-labelledby="username-heading" className="mt-8 border-t pt-6">
        <h2 id="username-heading" className="mb-4 text-base font-semibold tracking-tight">
          Username
        </h2>
        <UsernameForm username={user.username ?? null} />
      </section>

      <section aria-labelledby="photo" className="mt-8 border-t pt-6">
        <h2 id="photo" className="mb-4 text-base font-semibold tracking-tight">
          Photo
        </h2>
        <AvatarUploader
          name={user.name}
          image={user.avatarUrl ?? session.user.image ?? null}
          hasCustom={Boolean(user.avatarUrl)}
        />
      </section>

      <section aria-labelledby="email-heading" className="mt-8 border-t pt-6">
        <h2 id="email-heading" className="mb-4 text-base font-semibold tracking-tight">
          Email
        </h2>
        <EmailForm
          email={user.email ?? null}
          verified={Boolean(user.emailVerified)}
          suggested={session.user.email ?? ""}
        />
      </section>

      <section aria-labelledby="performance-heading" className="mt-8 border-t pt-6">
        <h2 id="performance-heading" className="mb-4 text-base font-semibold tracking-tight">
          Performance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <WinRateDonut winRate={perf.winRate < 0 ? 0 : perf.winRate} played={perf.played} />
          <BarList
            title="Up calls vs. down calls"
            items={[
              { label: "Up", winRate: perf.byDirection.up.winRate < 0 ? 0 : perf.byDirection.up.winRate, played: perf.byDirection.up.played },
              { label: "Down", winRate: perf.byDirection.down.winRate < 0 ? 0 : perf.byDirection.down.winRate, played: perf.byDirection.down.played },
            ]}
            emptyText="Play a round to compare your up and down calls."
          />
        </div>
        <div className="mt-4">
          <BarList
            title="Win rate by asset"
            items={perf.byAsset.map((a) => ({ label: formatAsset(a.symbol), winRate: a.winRate, played: a.played }))}
            emptyText="Play a round to see your win rate per asset."
          />
        </div>
      </section>

      <section aria-labelledby="share-heading" className="mt-8 border-t pt-6">
        <h2 id="share-heading" className="mb-4 text-base font-semibold tracking-tight">
          Share &amp; export
        </h2>
        <div className="flex flex-wrap gap-2">
          <ResultCardDownload
            data={{
              name: user.name,
              avatarUrl: user.avatarUrl ?? session.user.image ?? null,
              score: user.score,
              played: user.played,
              correct: user.correct,
              winRate: perf.winRate < 0 ? 0 : perf.winRate,
              bestAssetLabel,
              form,
            }}
          />
          <PdfDownloadButton />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          The image is sized for sharing (e.g. Instagram). The PDF lists your last{" "}
          {perf.played > 1000 ? "1,000" : perf.played} predictions.
        </p>
      </section>

      <section id="predictions" aria-labelledby="predictions-heading" className="mt-8 scroll-mt-16 border-t pt-6">
        <h2 id="predictions-heading" className="mb-4 text-base font-semibold tracking-tight">
          Your predictions
        </h2>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="bg-background px-3 py-2">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {form.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground">Last {form.length}</span>
            <FormDots results={form} />
          </div>
        )}

        <div className="mt-6 flex items-center gap-1" role="group" aria-label="Filter predictions">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={buildHref(hrefState, { filter: f.id })}
              aria-current={filter === f.id ? "true" : undefined}
              className={cn(
                "rounded-md px-2.5 py-1 text-[13px] hover:bg-accent",
                filter === f.id ? "bg-accent font-medium" : "text-muted-foreground",
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by date">
            {rangePresets.map((preset) => (
              <Link
                key={preset.label}
                href={buildHref(hrefState, { from: preset.from, to: preset.to })}
                aria-current={isActivePreset(preset) ? "true" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[13px] hover:bg-accent",
                  isActivePreset(preset) ? "bg-accent font-medium" : "text-muted-foreground",
                )}
              >
                {preset.label}
              </Link>
            ))}
          </div>
          <DateRangeFilter minDate={minDateStr} maxDate={todayStr} from={fromStr} to={toStr} />
        </div>
        {(fromStr || toStr) && (
          <p className="mt-2 text-xs text-muted-foreground">
            Showing predictions from {fromStr || "the start"} to {toStr || "today"}.
          </p>
        )}

        {total === 0 ? (
          <div className="mt-4 rounded-lg border p-8 text-center">
            <p className="font-medium">{filter === "all" ? "No predictions yet." : "Nothing matches this filter."}</p>
            <p className="mt-1 text-muted-foreground">
              <Link href="/" className="underline underline-offset-4">
                Play a round
              </Link>{" "}
              and it will show up here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto rounded-lg border">
              <table className="w-full text-[13px]">
                <caption className="sr-only">Your predictions, newest first</caption>
                <thead className="border-b bg-muted text-left text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">When</th>
                    <th scope="col" className="px-3 py-2 font-medium">Asset</th>
                    <th scope="col" className="px-3 py-2 font-medium">Timeframe</th>
                    <th scope="col" className="px-3 py-2 font-medium">Chart from</th>
                    <th scope="col" className="px-3 py-2 font-medium">Your call</th>
                    <th scope="col" className="px-3 py-2 font-medium">Market</th>
                    <th scope="col" className="px-3 py-2 font-medium">Result</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const ok = r.correct === true;
                    return (
                      <tr key={r._id.toString()} className="border-b last:border-0">
                        <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                          {r.answeredAt ? <LocalTime iso={r.answeredAt.toISOString()} /> : "–"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">{formatAsset(r.symbol)}</td>
                        <td className="px-3 py-2">{r.interval}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{formatChartDate(r.startTime)}</td>
                        <td className="px-3 py-2 capitalize">{r.choice ?? "–"}</td>
                        <td className="px-3 py-2 capitalize">{r.outcome}</td>
                        <td className={cn("px-3 py-2 font-medium", ok ? "text-up" : "text-down")}>
                          {ok ? "Correct" : "Wrong"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {ok ? `+${POINTS_CORRECT}` : POINTS_WRONG}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <nav aria-label="Pagination" className="mt-3 flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">
                Page {page} of {pages} · {total} {total === 1 ? "prediction" : "predictions"}
              </span>
              <span className="flex gap-1">
                {page > 1 ? (
                  <Link href={buildHref(hrefState, { page: page - 1 })} className="rounded-md border px-2.5 py-1 hover:bg-accent">
                    Previous
                  </Link>
                ) : null}
                {page < pages ? (
                  <Link href={buildHref(hrefState, { page: page + 1 })} className="rounded-md border px-2.5 py-1 hover:bg-accent">
                    Next
                  </Link>
                ) : null}
              </span>
            </nav>
          </>
        )}
      </section>
    </div>
  );
}
