import type { DayPoint } from "@/lib/admin-stats";

const W = 600;
const H = 110;
const PAD_TOP = 14;
const PAD_BOTTOM = 18;

function label(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

// Plain SVG bars, one per day. Hover a bar for the exact number. The bars grow in on load.
export function BarChart({ data, unit }: { data: DayPoint[]; unit: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const slot = W / Math.max(1, data.length);
  const barW = Math.max(1.5, slot * 0.68);
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const empty = data.every((d) => d.value === 0);
  const ticks = data.length <= 2 ? [0, data.length - 1] : [0, Math.floor((data.length - 1) / 2), data.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${unit} per day`}>
      <line x1={0} x2={W} y1={H - PAD_BOTTOM} y2={H - PAD_BOTTOM} stroke="var(--border)" />
      <text x={0} y={9} fontSize={10} fill="var(--muted-foreground)">
        {max}
      </text>
      {empty ? (
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">
          No data in this period
        </text>
      ) : (
        data.map((d, i) => {
          const h = d.value === 0 ? 0 : Math.max(2, (d.value / max) * plotH);
          return (
            <rect
              key={d.day}
              x={i * slot + (slot - barW) / 2}
              y={H - PAD_BOTTOM - h}
              width={barW}
              height={h}
              rx={1.5}
              fill="var(--foreground)"
              opacity={0.82}
              className="animate-grow-y transition-opacity hover:opacity-50"
              style={{ transformBox: "fill-box", transformOrigin: "50% 100%", animationDelay: `${Math.min(i, 60) * 12}ms` }}
            >
              <title>{`${label(d.day)}: ${d.value} ${unit}`}</title>
            </rect>
          );
        })
      )}
      {ticks.map((i, k) => (
        <text
          key={i}
          x={Math.min(W, Math.max(0, i * slot + slot / 2))}
          y={H - 4}
          fontSize={10}
          textAnchor={k === 0 ? "start" : k === ticks.length - 1 ? "end" : "middle"}
          fill="var(--muted-foreground)"
        >
          {label(data[i].day)}
        </text>
      ))}
    </svg>
  );
}
