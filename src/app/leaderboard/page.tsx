import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { UserDoc } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import { leaderboardSchema } from "@/lib/schema";
import { POINTS_CORRECT } from "@/lib/game";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "See the top 50 players on Amxinz, ranked by total score and prediction accuracy on real candlestick charts.";

export const metadata = pageMetadata({
  title: "Top Chart Predictors Leaderboard",
  description: DESCRIPTION,
  path: "/leaderboard",
});

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  const db = await getDb();
  const rows = await db
    .collection<UserDoc>("users")
    .find({ played: { $gt: 0 } })
    .sort({ score: -1, correct: -1, played: 1 })
    .limit(50)
    .toArray();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page">Leaderboard</li>
        </ol>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
      <p className="mt-1 max-w-xl text-muted-foreground">
        The top 50 players by total score. Every correct call earns {POINTS_CORRECT} points and every wrong call
        costs {POINTS_CORRECT}. Ties are broken by the number of correct predictions.
      </p>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-lg border p-8 text-center">
          <p className="font-medium">No one has played yet.</p>
          <p className="mt-1 text-muted-foreground">
            <Link href="/" className="underline underline-offset-4">
              Make the first prediction
            </Link>{" "}
            and take rank 1.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-[13px]">
            <caption className="sr-only">Top 50 players ranked by score</caption>
            <thead className="border-b bg-muted text-left text-muted-foreground">
              <tr>
                <th scope="col" className="w-12 px-3 py-2 font-medium">Rank</th>
                <th scope="col" className="px-3 py-2 font-medium">Player</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Accuracy</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Played</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u, i) => {
                const isMe = session?.user?.id === u._id.toString();
                return (
                  <tr key={u._id.toString()} className={cn("border-b last:border-0", isMe && "bg-muted")}>
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2">
                        <Avatar name={u.name} image={u.avatarUrl ?? u.image} />
                        <span className="truncate">{u.name}</span>
                        {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{Math.round((u.correct / u.played) * 100)}%</td>
                    <td className="px-3 py-2 text-right tabular-nums">{u.played}</td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">{u.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <JsonLd data={leaderboardSchema(DESCRIPTION)} />
    </div>
  );
}
