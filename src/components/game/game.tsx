"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CandleChart, type Candle } from "./candle-chart";
import { AdBreak } from "./ad-break";
import { AD_PROVIDER } from "@/lib/ads";
import { AD_EVERY_PREDICTIONS, HORIZON } from "@/lib/game";
import { cn } from "@/lib/utils";

export type Stats = { score: number; played: number; correct: number };
type Direction = "up" | "down";
type Round = { roundId: string; interval: string; candles: Candle[] };
type Result = {
  correct: boolean;
  outcome: Direction;
  choice: Direction;
  delta: number;
  future: Candle[];
  reveal: { symbol: string; interval: string; startTime: number };
  stats: Stats;
};

const REVEAL_MS = 140;

function formatAsset(symbol: string) {
  return symbol.replace(/USDT$/, "/USDT");
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Game({ initialStats }: { initialStats: Stats }) {
  const [stats, setStats] = useState(initialStats);
  const [round, setRound] = useState<Round | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [shown, setShown] = useState(0); // how many future candles are revealed so far
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Direction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAd, setShowAd] = useState(false);
  // Remembers the play count an ad was already shown for (starts at the saved count, so a reload never re-triggers it).
  const adShownAt = useRef(initialStats.played);

  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const started = useRef(false);

  const loadRound = useCallback(async () => {
    clearInterval(timer.current);
    setLoading(true);
    setError(null);
    setResult(null);
    setShown(0);
    try {
      const res = await fetch("/api/round", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load a chart.");
      setRound(data);
    } catch (err) {
      setRound(null);
      setError(err instanceof Error ? err.message : "Could not load a chart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (started.current) return; // guards React StrictMode's double effect in dev
    started.current = true;
    loadRound();
  }, [loadRound]);

  useEffect(() => () => clearInterval(timer.current), []);

  async function submit(direction: Direction) {
    if (!round || result || submitting) return;
    setSubmitting(direction);
    setError(null);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundId: round.roundId, direction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save your prediction.");

      setResult({ ...data, choice: direction });
      setStats(data.stats);

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

  // Every AD_EVERY_PREDICTIONS predictions, show a full-screen ad before the next chart.
  // The next chart loads in the background while the ad is on screen.
  function next() {
    const adDue =
      AD_PROVIDER !== "none" &&
      stats.played > 0 &&
      stats.played % AD_EVERY_PREDICTIONS === 0 &&
      adShownAt.current !== stats.played;
    loadRound();
    if (adDue) {
      adShownAt.current = stats.played;
      setShowAd(true);
    }
  }

  const candles = round ? (result ? [...round.candles, ...result.future.slice(0, shown)] : round.candles) : [];
  const revealDone = !!result && shown >= result.future.length;
  const lastVisibleTime = round?.candles[round.candles.length - 1]?.time;
  const accuracy = stats.played ? `${Math.round((stats.correct / stats.played) * 100)}%` : "–";
  const canAnswer = !!round && !result && !loading && !submitting;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <dl className="mb-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border">
        {[
          ["Score", stats.score],
          ["Played", stats.played],
          ["Accuracy", accuracy],
        ].map(([label, value]) => (
          <div key={label} className="bg-background px-3 py-2">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between gap-3 border-b px-3 py-2 text-xs text-muted-foreground">
          <span>{round ? `${round.interval} candles` : "Loading chart"}</span>
          <span className="truncate">
            {result
              ? `${formatAsset(result.reveal.symbol)} · from ${formatDate(result.reveal.startTime)}`
              : "Asset and date hidden"}
          </span>
        </div>

        <div className="relative h-[360px] sm:h-[420px]">
          <CandleChart candles={candles} markerTime={lastVisibleTime} />
          {loading && (
            <div
              role="status"
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background"
            >
              <Loader2 className="size-7 animate-spin" />
              <p className="text-[13px] text-muted-foreground">Loading a new chart…</p>
            </div>
          )}
        </div>

        <div className="border-t p-3">
          {error ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p role="alert" className="text-[13px] text-destructive">{error}</p>
              <Button variant="outline" onClick={loadRound}>Try again</Button>
            </div>
          ) : !result ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p role="status" className="flex items-center gap-2 text-[13px] text-muted-foreground">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Loading a new chart…
                  </>
                ) : submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Checking your call…
                  </>
                ) : (
                  <>
                    Will the close {HORIZON} candles from now be higher or lower than the last candle?
                  </>
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
            <div className="flex flex-wrap items-center justify-between gap-3">
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
              <Button onClick={next}>Next chart</Button>
            </div>
          )}
        </div>
      </div>

      {showAd && <AdBreak onClose={() => setShowAd(false)} />}
    </div>
  );
}
