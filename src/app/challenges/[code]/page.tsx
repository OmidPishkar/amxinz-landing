import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getChallenge, getEntry, getLeaderboard, getUserNames, playerName } from "@/lib/challenges";
import { formatDuration, timeLeft } from "@/lib/format";
import { CHALLENGE_SIZE, POINTS_CORRECT } from "@/lib/game";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";
import { CopyLinkButton } from "@/components/challenges/copy-link-button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const challenge = await getChallenge(code);
  return {
    title: challenge?.title ?? "Challenge",
    robots: { index: false, follow: false },
  };
}

export default async function ChallengePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const challenge = await getChallenge(code);
  if (!challenge) notFound();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const [entry, { board, players, finished }, creators] = await Promise.all([
    userId ? getEntry(challenge.code, userId) : Promise.resolve(null),
    getLeaderboard(challenge.code),
    getUserNames([challenge.creatorId]),
  ]);

  const ended = challenge.endsAt <= new Date();
  const answered = entry?.answers.length ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
        <Link href="/challenges" className="hover:text-foreground hover:underline">
          Challenges
        </Link>{" "}
        / {challenge.title}
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight">{challenge.title}</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">
        by {playerName(creators.get(challenge.creatorId))} · {timeLeft(challenge.endsAt)} · {players}{" "}
        {players === 1 ? "player" : "players"}, {finished} finished
      </p>
      <p className="mt-3 max-w-xl text-muted-foreground">
        {CHALLENGE_SIZE} real charts, the same for everyone. Call higher or lower for each one: {POINTS_CORRECT} points
        for a right call, minus {POINTS_CORRECT} for a wrong one. Ties are broken by correct calls, then by total time.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {!userId ? (
          ended ? (
            <p className="text-[13px] text-muted-foreground">This challenge has ended.</p>
          ) : (
            <LoginDialog>
              <Button>Log in to join</Button>
            </LoginDialog>
          )
        ) : entry?.finishedAt ? (
          <p className="text-[13px]">
            You finished with <span className="font-medium">{entry.score} points</span> ({entry.correct} of{" "}
            {CHALLENGE_SIZE} correct).
          </p>
        ) : ended ? (
          <p className="text-[13px] text-muted-foreground">This challenge has ended.</p>
        ) : (
          <Button asChild>
            <Link href={`/challenges/${challenge.code}/play`}>
              {answered > 0 ? `Continue (${answered}/${CHALLENGE_SIZE})` : "Join and play"}
            </Link>
          </Button>
        )}
        <CopyLinkButton path={`/challenges/${challenge.code}`} />
      </div>

      <h2 className="mb-3 mt-10 text-base font-semibold tracking-tight">Leaderboard</h2>
      {board.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="font-medium">No one has finished yet.</p>
          <p className="mt-1 text-muted-foreground">Finish all {CHALLENGE_SIZE} charts to take rank 1.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-[13px]">
            <caption className="sr-only">Challenge leaderboard</caption>
            <thead className="border-b bg-muted text-left text-muted-foreground">
              <tr>
                <th scope="col" className="w-12 px-3 py-2 font-medium">Rank</th>
                <th scope="col" className="px-3 py-2 font-medium">Player</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Correct</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Time</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {board.map((row, i) => {
                const isMe = row.userId === userId;
                return (
                  <tr key={row.userId} className={cn("border-b last:border-0", isMe && "bg-muted")}>
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2">
                        <Avatar name={row.name} image={row.image} />
                        <span className="truncate">{row.name}</span>
                        {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.correct}/{CHALLENGE_SIZE}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatDuration(row.durationMs)}</td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">{row.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
