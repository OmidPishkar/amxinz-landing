// A decorative strip of candles that grow in one by one, with a pulsing "?" where the
// future is hidden. Pure SVG + CSS (no script); static for visitors who prefer reduced motion.
const COUNT = 26;
const W = 520;
const H = 72;
const SLOT = W / (COUNT + 6);

function makeCandles() {
  let seed = 19;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  let price = 36;
  return Array.from({ length: COUNT }, () => {
    const open = price;
    const close = Math.min(H - 10, Math.max(10, open + (rand() - 0.46) * 14));
    price = close;
    return { open, close, high: Math.max(open, close) + rand() * 6, low: Math.min(open, close) - rand() * 6 };
  });
}

export function HeroCandles() {
  const candles = makeCandles();
  const bodyW = SLOT * 0.55;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="h-auto w-full max-w-md">
      {candles.map((c, i) => {
        const x = i * SLOT + SLOT / 2;
        const up = c.close >= c.open;
        const top = H - Math.max(c.open, c.close);
        const bodyH = Math.max(2, Math.abs(c.close - c.open));
        const color = up ? "var(--up)" : "var(--down)";
        return (
          <g
            key={i}
            className="animate-candle-grow"
            style={{ animationDelay: `${i * 45}ms`, transformBox: "fill-box", transformOrigin: "50% 100%" }}
          >
            <line x1={x} x2={x} y1={H - c.high} y2={H - c.low} stroke={color} strokeWidth={1.2} />
            <rect x={x - bodyW / 2} y={top} width={bodyW} height={bodyH} rx={1} fill={color} />
          </g>
        );
      })}
      <text
        x={(COUNT + 3) * SLOT}
        y={H / 2 + 8}
        textAnchor="middle"
        fontSize={26}
        fill="var(--muted-foreground)"
        className="animate-soft-pulse"
      >
        ?
      </text>
    </svg>
  );
}
