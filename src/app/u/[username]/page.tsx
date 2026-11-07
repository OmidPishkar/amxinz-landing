import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByUsername } from "@/lib/users";
import { getPerformanceStats, getRecentForm } from "@/lib/profile";
import { finalizeEndedChallenges, getBadgesForUsers, getChallengeActivity } from "@/lib/challenge-stats";
import { getMyRating, getRatingSummary } from "@/lib/ratings";
import { formatAsset } from "@/lib/format";
import { Avatar } from "@/components/avatar";
import { ChallengeBadges } from "@/components/badges/challenge-badges";
import { ChallengeActivityList } from "@/components/profile/challenge-activity";
import { RatingStars } from "@/components/profile/rating-stars";
import { WinRateDonut } from "@/components/profile/win-rate-donut";
import { BarList } from "@/components/profile/bar-list";
import { FormDots } from "@/components/profile/form-dots";

export const dynamic = "force-dynamic";

// Player pages are for people who have the link, not for search results.
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username.toLowerCase()}`, robots: { index: false, follow: false } };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;
  const username = rawUsername.toLowerCase();

  const user = await getUserByUsername(username);
  if (!user) notFound();

  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;
  const userId = user._id.toString();
  const isOwner = viewerId === userId;

  // Private: everyone except the owner only gets this message, and no data is even loaded.
  if (!user.profilePublic && !isOwner) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">This page is private.</h1>
        <p className="mt-2 text-muted-foreground">The owner has chosen not to share it.</p>
        <p className="mt-6">
          <Link href="/" className="text-[13px] underline underline-offset-4">
            Back to Amxinz
          </Link>
        </p>
      </div>
    );
  }

  await finalizeEndedChallenges();
  const [perf, form, activity, badges, rating, mine] = await Promise.all([
    getPerformanceStats(userId),
    getRecentForm(userId),
    getChallengeActivity(userId, { publicOnly: true, limit: 10 }),
    getBadgesForUsers([userId]),
    getRatingSummary(userId),
    viewerId && !isOwner ? getMyRating(userId, viewerId) : Promise.resolve(0),
  ]);

  const accuracy = user.played ? `${Math.round((user.correct / user.played) * 100)}%` : "–";
  const stats = [
    ["Score", user.score],
    ["Predictions", user.played],
    ["Correct", user.correct],
    ["Accuracy", accuracy],
  ] as const;
  const joined = user.createdAt.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {!user.profilePublic && (
        <p role="status" className="mb-6 rounded-md border px-3 py-2 text-[13px] text-muted-foreground">
          This page is private, so only you can see it.{" "}
          <Link href="/profile#visibility-heading" className="underline underline-offset-4">
            Make it public
          </Link>
        </p>
      )}

      <header className="flex items-center gap-4">
        <Avatar name={username} image={user.avatarUrl ?? user.image} size={56} />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">@{username}</h1>
          <p className="text-[13px] text-muted-foreground">Playing since {joined}</p>
          <div className="mt-1.5">
            <ChallengeBadges counts={badges.get(userId)} variant="full" />
          </div>
        </div>
      </header>

      <section aria-labelledby="rating-heading" className="mt-8 border-t pt-6">
        <h2 id="rating-heading" className="mb-3 text-base font-semibold tracking-tight">
          Rating
        </h2>
        <RatingStars
          username={username}
          average={rating.average}
          count={rating.count}
          mine={mine}
          canRate={!!viewerId && !isOwner}
          loggedIn={!!viewerId}
        />
      </section>

      <section aria-labelledby="stats-heading" className="mt-8 border-t pt-6">
        <h2 id="stats-heading" className="mb-4 text-base font-semibold tracking-tight">
          Predictions
        </h2>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="bg-background px-3 py-2">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        {form.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground">Last {form.length}</span>
            <FormDots results={form} />
          </div>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <WinRateDonut winRate={perf.winRate < 0 ? 0 : perf.winRate} played={perf.played} />
          <BarList
            title="Up calls vs. down calls"
            items={[
              { label: "Up", winRate: Math.max(0, perf.byDirection.up.winRate), played: perf.byDirection.up.played },
              { label: "Down", winRate: Math.max(0, perf.byDirection.down.winRate), played: perf.byDirection.down.played },
            ]}
            emptyText="No predictions yet."
          />
        </div>
        <div className="mt-4">
          <BarList
            title="Win rate by asset"
            items={perf.byAsset.map((a) => ({ label: formatAsset(a.symbol), winRate: a.winRate, played: a.played }))}
            emptyText="No predictions yet."
          />
        </div>
      </section>

      <section aria-labelledby="challenges-heading" className="mt-8 border-t pt-6">
        <h2 id="challenges-heading" className="mb-4 text-base font-semibold tracking-tight">
          Challenges
        </h2>
        <ChallengeActivityList activity={activity} emptyText="No public challenges yet." />
      </section>
    </div>
  );
}
