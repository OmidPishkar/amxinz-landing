"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";

export type Candle = { time: number; open: number; high: number; low: number; close: number };

const PALETTE = {
  light: { bg: "#ffffff", text: "#787774", grid: "#f1f1ef", up: "#0f7b6c", down: "#e03e3e" },
  dark: { bg: "#191919", text: "#9b9a97", grid: "#262626", up: "#4dab9a", down: "#ff7369" },
} as const;

type Lib = typeof import("lightweight-charts");

export function CandleChart({ candles, markerTime }: { candles: Candle[]; markerTime?: number }) {
  const { resolvedTheme } = useTheme();
  const colors = PALETTE[resolvedTheme === "dark" ? "dark" : "light"];

  const el = useRef<HTMLDivElement>(null);
  const lib = useRef<Lib | null>(null);
  const chart = useRef<IChartApi | null>(null);
  const series = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [ready, setReady] = useState(false);

  // Create the chart once (loaded lazily so it never runs during SSR).
  useEffect(() => {
    let disposed = false;
    (async () => {
      const mod = await import("lightweight-charts");
      if (disposed || !el.current) return;
      lib.current = mod;
      chart.current = mod.createChart(el.current, {
        autoSize: true,
        timeScale: { visible: false, rightOffset: 3, borderVisible: false },
        rightPriceScale: { borderVisible: false },
        grid: { vertLines: { visible: false } },
      });
      series.current = chart.current.addCandlestickSeries({
        borderVisible: false,
        priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      });
      setReady(true);
    })();
    return () => {
      disposed = true;
      chart.current?.remove();
      chart.current = null;
      series.current = null;
      setReady(false);
    };
  }, []);

  // Theme colors.
  useEffect(() => {
    if (!ready || !lib.current || !chart.current || !series.current) return;
    chart.current.applyOptions({
      layout: {
        background: { type: lib.current.ColorType.Solid, color: colors.bg },
        textColor: colors.text,
        fontSize: 11,
      },
      grid: { horzLines: { color: colors.grid } },
    });
    series.current.applyOptions({
      upColor: colors.up,
      downColor: colors.down,
      wickUpColor: colors.up,
      wickDownColor: colors.down,
    });
  }, [ready, colors]);

  // Data + the "last candle" marker.
  useEffect(() => {
    if (!ready || !chart.current || !series.current) return;
    series.current.setData(candles.map((c) => ({ ...c, time: c.time as UTCTimestamp })));
    series.current.setMarkers(
      markerTime === undefined
        ? []
        : [{ time: markerTime as UTCTimestamp, position: "belowBar", color: "#2383e2", shape: "circle", text: "Now" }],
    );
    chart.current.timeScale().fitContent();
  }, [ready, candles, markerTime]);

  return <div ref={el} className="h-full w-full" />;
}
