import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listOpenChallenges } from "@/lib/challenges";
import { timeLeft } from "@/lib/format";
import { CHALLENGE_SIZE } from "@/lib/game";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";

export const dynamic = "force-dynamic";

// User-generated pages: useful to players, not something to put in search results.
export const metadata: Metadata = {
  title: "Challenges",
  robots: { index: true, follow: true },
};

export default async function ChallengesPage() {
  const session = await getServerSession(authOptions);
  const open = await listOpenChallenges();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Challenges</h1>
          <p className="mt-1 max-w-xl text-muted-foreground">
            Everyone plays the same {CHALLENGE_SIZE} real charts and is ranked by score. Play in your own time, no need
            to be online together.
          </p>
        </div>
        {session?.user ? (
          <Button asChild>
            <Link href="/challenges/new">Create a challenge</Link>
          </Button>
        ) : (
          <LoginDialog>
            <Button>Log in to create one</Button>
          </LoginDialog>
        )}
      </div>

      {open.length === 0 ? (
        <div className="mt-8 rounded-lg border p-8 text-center">
          <p className="font-medium">No open challenges right now.</p>
          <p className="mt-1 text-muted-foreground">Create the first one and send the link to a friend.</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y rounded-lg border">
          {open.map(({ challenge, players, creator }) => (
            <li key={challenge.code}>
              <Link href={`/challenges/${challenge.code}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{challenge.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">by {creator}</span>
                </span>
                <span className="shrink-0 text-right text-xs text-muted-foreground">
                  <span className="block">
                    {players} {players === 1 ? "player" : "players"}
                  </span>
                  <span className="block">{timeLeft(challenge.endsAt)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
