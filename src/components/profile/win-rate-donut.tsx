const SIZE = 128;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

// A player's win rate as a ring. Kept as plain SVG (no chart library) to match
// the rest of the site and avoid shipping extra JS for a static number.
export function WinRateDonut({ winRate, played }: { winRate: number; played: number }) {
  if (played === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border p-6 text-center">
        <p className="text-sm font-medium">No predictions yet</p>
        <p className="text-xs text-muted-foreground">Play a round to see your win rate.</p>
      </div>
    );
  }

  const dash = (winRate / 100) * C;
  const color = winRate >= 50 ? "var(--up)" : "var(--down)";

  return (
    <div className="flex items-center gap-5 rounded-lg border p-5">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Win rate: ${winRate}%`}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--muted)" strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={`${dash} ${C - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
        <text x={SIZE / 2} y={SIZE / 2 - 4} textAnchor="middle" fontSize={26} fontWeight={700} fill="var(--foreground)">
          {winRate}%
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 16} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">
          win rate
        </text>
      </svg>
      <div>
        <p className="text-sm font-medium">Overall accuracy</p>
        <p className="mt-1 text-xs text-muted-foreground">Based on {played} answered predictions.</p>
      </div>
    </div>
  );
}
