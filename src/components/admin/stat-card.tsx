import type { Metric } from "@/lib/admin-stats";
import { cn } from "@/lib/utils";
import { BarChart } from "./bar-chart";

/** A total for the period, how it compares with the period before, and the day-by-day bars. */
export function StatCard({
  title,
  metric,
  unit,
  total,
  previous,
}: {
  title: string;
  metric: Metric;
  unit: string;
  total?: number; // override when the headline number is not the sum of the days (unique visitors)
  previous?: number;
}) {
  const value = total ?? metric.total;
  const before = previous ?? metric.previousTotal;
  const delta = before > 0 ? Math.round(((value - before) / before) * 100) : null;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-medium">{title}</p>
        <p className={cn("text-xs tabular-nums", delta === null ? "text-muted-foreground" : delta >= 0 ? "text-up" : "text-down")}>
          {delta === null ? (before === 0 && value > 0 ? "new" : "–") : `${delta >= 0 ? "+" : ""}${delta}%`}
        </p>
      </div>
      <p className="mb-3 text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
      <BarChart data={metric.current} unit={unit} />
    </div>
  );
}
