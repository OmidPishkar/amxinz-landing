// A deterministic sample chart: 44 visible candles, then a shaded "?" zone where
// the future is hidden. Pure SVG, rendered on the server.
const W = 720;
const H = 260;
const PAD = 16;
const VISIBLE = 44;
const HIDDEN = 12;
const SLOTS = VISIBLE + HIDDEN;

function makeCandles(n: number) {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  let price = 100;
  return Array.from({ length: n }, (_, i) => {
    const open = price;
    const close = open + (rand() - 0.5) * 5 + Math.sin(i / 6) * 0.6;
    const high = Math.max(open, close) + rand() * 2.2;
    const low = Math.min(open, close) - rand() * 2.2;
    price = close;
    return { open, high, low, close };
  });
}

export function HeroChart() {
  const candles = makeCandles(VISIBLE);
  const lo = Math.min(...candles.map((c) => c.low));
  const hi = Math.max(...candles.map((c) => c.high));
  const y = (v: number) => PAD + ((hi - v) / (hi - lo)) * (H - PAD * 2);
  const slot = W / SLOTS;
  const bodyW = slot * 0.55;
  const lastClose = candles[candles.length - 1].close;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Sample candlestick chart. The most recent candles are hidden behind a question mark."
    >
      <rect x={VISIBLE * slot} y={0} width={HIDDEN * slot} height={H} fill="var(--muted)" />
      <line
        x1={0}
        x2={W}
        y1={y(lastClose)}
        y2={y(lastClose)}
        stroke="var(--muted-foreground)"
        strokeOpacity={0.6}
        strokeDasharray="3 4"
      />
      {candles.map((c, i) => {
        const x = i * slot + slot / 2;
        const color = c.close >= c.open ? "var(--up)" : "var(--down)";
        const bodyTop = y(Math.max(c.open, c.close));
        const bodyH = Math.max(1.5, Math.abs(y(c.open) - y(c.close)));
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1.2} />
            <rect x={x - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} rx={1} fill={color} />
          </g>
        );
      })}
      <text
        x={(VISIBLE + HIDDEN / 2) * slot}
        y={H / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={28}
        fill="var(--muted-foreground)"
      >
        ?
      </text>
    </svg>
  );
}
