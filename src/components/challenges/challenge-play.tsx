"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CandleChart, type Candle } from "@/components/game/candle-chart";
import { AdBreak } from "@/components/game/ad-break";
import { AD_PROVIDER } from "@/lib/ads";
import { AD_EVERY_PREDICTIONS, HORIZON } from "@/lib/game";
import { formatAsset, formatChartDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Direction = "up" | "down";
type Round = { index: number; total: number; interval: string; candles: Candle[]; score: number };
type Result = {
  correct: boolean;
  outcome: Direction;
  choice: Direction;
  delta: number;
  future: Candle[];
  reveal: { symbol: string; interval: string; startTime: number };
  answered: number;
  finished: boolean;
  score: number;
  correctCount: number;
};
type Summary = { score: number; correct: number; total: number };

const REVEAL_MS = 140;

export function ChallengePlay({ code }: { code: string }) {
  const [round, setRound] = useState<Round | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [shown, setShown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Direction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAd, setShowAd] = useState(false);

  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const started = useRef(false);

  const loadNext = useCallback(async () => {
    clearInterval(timer.current);
    setLoading(true);
    setError(null);
    setResult(null);
    setShown(0);
    try {
      const res = await fetch(`/api/challenges/${code}/next`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load the next chart.");
      if (data.status === "finished") {
        setSummary({ score: data.score, correct: data.correct, total: data.total });
        setRound(null);
      } else {
        setRound(data);
      }
    } catch (err) {
      setRound(null);
      setError(err instanceof Error ? err.message : "Could not load the next chart.");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (started.current) return; // guards React StrictMode's double effect in dev
    started.current = true;
    loadNext();
  }, [loadNext]);

  useEffect(() => () => clearInterval(timer.current), []);

  async function submit(direction: Direction) {
    if (!round || result || submitting) return;
    setSubmitting(direction);
    setError(null);
    try {
      const res = await fetch(`/api/challenges/${code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: round.index, direction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save your prediction.");

      setResult({ ...data, choice: direction });
      let i = 0;
      timer.current = setInterval(() => {
        i += 1;
        setShown(i);
        if (i >= data.future.length) clearInterval(timer.current);
      }, REVEAL_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your prediction.");
    } finally {
      setSubmitting(null);
    }
  }

  function next() {
    if (!result) return;
    if (result.finished) {
      setSummary({ score: result.score, correct: result.correctCount, total: round?.total ?? result.answered });
      setRound(null);
      setResult(null);
      return;
    }
    // Same ad rhythm as solo play. With 10 charts and an ad every 5, that is one ad, after the 5th.
    const adDue = AD_PROVIDER !== "none" && result.answered % AD_EVERY_PREDICTIONS === 0;
    loadNext();
    if (adDue) setShowAd(true);
  }

  if (summary) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">Challenge complete</p>
        <p className="mt-2 text-5xl font-semibold tabular-nums">{summary.score}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          points · {summary.correct} of {summary.total} correct
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href={`/challenges/${code}`}>See the leaderboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/challenges">All challenges</Link>
          </Button>
        </div>
      </div>
    );
  }

  const candles = round ? (result ? [...round.candles, ...result.future.slice(0, shown)] : round.candles) : [];
  const revealDone = !!result && shown >= result.future.length;
  const lastVisibleTime = round?.candles[round.candles.length - 1]?.time;
  const canAnswer = !!round && !result && !loading && !submitting;
  const score = result ? result.score : (round?.score ?? 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4 text-[13px]">
        <div className="flex items-center gap-3">
          <span className="font-medium tabular-nums">
            Chart {round ? round.index + 1 : "–"} of {round?.total ?? "–"}
          </span>
          {round && (
            <div className="flex gap-1" role="img" aria-label={`${round.index} of ${round.total} charts answered`}>
              {Array.from({ length: round.total }, (_, i) => (
                <span
                  key={i}
                  className={cn("h-1.5 w-4 rounded-full", i < round.index + (result ? 1 : 0) ? "bg-foreground" : "bg-muted")}
                />
              ))}
            </div>
          )}
        </div>
        <span className="text-muted-foreground">
          Score <span className="font-medium tabular-nums text-foreground">{score}</span>
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between gap-3 border-b px-3 py-2 text-xs text-muted-foreground">
          <span>{round ? `${round.interval} candles` : "Loading chart"}</span>
          <span className="truncate">
            {result ? `${formatAsset(result.reveal.symbol)} · from ${formatChartDate(result.reveal.startTime)}` : "Asset and date hidden"}
          </span>
        </div>

        <div className="relative h-[360px] sm:h-[420px]">
          <CandleChart candles={candles} markerTime={lastVisibleTime} />
          {loading && (
            <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background">
              <Loader2 className="size-7 animate-spin" />
              <p className="text-[13px] text-muted-foreground">Loading the next chart…</p>
            </div>
          )}
        </div>

        <div className="border-t p-3">
          {error ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p role="alert" className="text-[13px] text-destructive">{error}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadNext}>Try again</Button>
                <Button asChild variant="ghost">
                  <Link href={`/challenges/${code}`}>Back to challenge</Link>
                </Button>
              </div>
            </div>
          ) : !result ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p role="status" className="flex items-center gap-2 text-[13px] text-muted-foreground">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Loading the next chart…
                  </>
                ) : submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Checking your call…
                  </>
                ) : (
                  <>Will the close {HORIZON} candles from now be higher or lower than the last candle?</>
                )}
              </p>
              <div className="flex gap-2">
                <Button variant="up" className="flex-1 sm:flex-none" disabled={!canAnswer} onClick={() => submit("up")}>
                  {submitting === "up" ? <Loader2 className="animate-spin" /> : <TrendingUp />} Up
                </Button>
                <Button variant="down" className="flex-1 sm:flex-none" disabled={!canAnswer} onClick={() => submit("down")}>
                  {submitting === "down" ? <Loader2 className="animate-spin" /> : <TrendingDown />} Down
                </Button>
              </div>
            </div>
          ) : !revealDone ? (
            <p className="text-[13px] text-muted-foreground">Revealing the next candles…</p>
          ) : (
            <div className="flex animate-in fade-in slide-in-from-bottom-1 flex-wrap items-center justify-between gap-3 duration-300">
              <p className="text-[13px]">
                <span className={cn("font-medium", result.correct ? "text-up" : "text-down")}>
                  {result.correct ? "Correct" : "Wrong"} ({result.delta > 0 ? "+" : ""}
                  {result.delta})
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · You called {result.choice}, the market went {result.outcome}.
                </span>
              </p>
              <Button onClick={next}>{result.finished ? "Finish" : "Next chart"}</Button>
            </div>
          )}
        </div>
      </div>

      {showAd && <AdBreak onClose={() => setShowAd(false)} />}
    </div>
  );
}
