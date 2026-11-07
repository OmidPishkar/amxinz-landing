import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getChallenge } from "@/lib/challenges";
import { ChallengePlay } from "@/components/challenges/challenge-play";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Playing a challenge",
  robots: { index: false, follow: false },
};

export default async function ChallengePlayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const challenge = await getChallenge(code);
  if (!challenge) notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/challenges/${challenge.code}`);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="mb-4 text-xs text-muted-foreground">
        <Link href={`/challenges/${challenge.code}`} className="hover:text-foreground hover:underline">
          {challenge.title}
        </Link>
      </p>
      <ChallengePlay code={challenge.code} />
    </div>
  );
}
