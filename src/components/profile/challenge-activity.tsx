import Link from "next/link";
import { LocalTime } from "@/components/profile/local-time";
import { CHALLENGE_SIZE } from "@/lib/game";
import { ordinal } from "@/lib/format";
import type { ChallengeActivity } from "@/lib/challenge-stats";
import { cn } from "@/lib/utils";

const STATUS = {
  finished: { label: "Finished", className: "text-up" },
  in_progress: { label: "In progress", className: "text-foreground" },
  missed: { label: "Ended, not finished", className: "text-muted-foreground" },
} as const;

/** Summary line plus the newest challenges. Each row opens the challenge's result page. */
export function ChallengeActivityList({ activity, emptyText }: { activity: ChallengeActivity; emptyText: string }) {
  const stats = [
    ["Joined", activity.played],
    ["Finished", activity.finished],
    ["Average score", activity.avgScore ?? "–"],
  ] as const;

  return (
    <div>
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-background px-3 py-2">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {activity.items.length === 0 ? (
        <p className="mt-4 text-[13px] text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="mt-4 divide-y rounded-lg border">
          {activity.items.map((item) => {
            const status = STATUS[item.status];
            return (
              <li key={item.code}>
                <Link href={`/challenges/${item.code}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{item.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      <span className={cn(status.className)}>{status.label}</span>
                      {" · "}
                      <LocalTime iso={item.startedAt.toISOString()} />
                      {item.status === "in_progress" && ` · ${item.answered}/${CHALLENGE_SIZE} answered`}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-muted-foreground">
                    {item.status === "finished" ? (
                      <>
                        <span className="block font-medium text-foreground">
                          {item.rank ? ordinal(item.rank) : "–"}
                          <span className="font-normal text-muted-foreground"> of {item.finishers}</span>
                        </span>
                        <span className="block tabular-nums">
                          {item.score} pts · {item.correct}/{CHALLENGE_SIZE}
                        </span>
                      </>
                    ) : (
                      <span className="block tabular-nums">{item.score} pts</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
