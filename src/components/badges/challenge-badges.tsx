import { Medal, Trophy } from "lucide-react";
import type { BadgeCounts } from "@/lib/challenge-stats";
import { cn } from "@/lib/utils";

const TIERS = [
  { key: "gold", label: "Challenge win", plural: "Challenge wins", Icon: Trophy, color: "text-amber-500" },
  { key: "silver", label: "2nd place", plural: "2nd places", Icon: Medal, color: "text-zinc-400" },
  { key: "bronze", label: "3rd place", plural: "3rd places", Icon: Medal, color: "text-orange-700" },
] as const;

/**
 * Podium badges earned in challenges. "compact" is an icon and count for tables;
 * "full" is a labelled pill for profile pages. Renders nothing when there are none.
 */
export function ChallengeBadges({
  counts,
  variant = "compact",
}: {
  counts: BadgeCounts | undefined;
  variant?: "compact" | "full";
}) {
  if (!counts) return null;
  const earned = TIERS.filter((t) => counts[t.key] > 0);
  if (earned.length === 0) return null;

  const summary = earned.map((t) => `${counts[t.key]} ${counts[t.key] === 1 ? t.label : t.plural}`).join(", ");

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5" title={summary}>
      <span className="sr-only">{summary}</span>
      {earned.map(({ key, label, plural, Icon, color }) =>
        variant === "full" ? (
          <span key={key} aria-hidden className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs">
            <Icon className={cn("size-3.5", color)} />
            {counts[key]} {counts[key] === 1 ? label : plural}
          </span>
        ) : (
          <span key={key} aria-hidden className="inline-flex items-center gap-0.5">
            <Icon className={cn("size-3.5", color)} />
            <span className="text-[11px] tabular-nums text-muted-foreground">{counts[key]}</span>
          </span>
        ),
      )}
    </span>
  );
}
