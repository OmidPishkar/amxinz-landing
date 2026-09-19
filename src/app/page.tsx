import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserStats } from "@/lib/users";
import { Landing } from "@/components/landing/landing";
import { Game } from "@/components/game/game";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/config/site";

export const dynamic = "force-dynamic";

// Crawlers are never logged in, so this is the metadata search engines see.
export const metadata = pageMetadata({ description: SITE.description, path: "/" });

// One URL, two states: landing for guests, the chart for logged-in players.
export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <Landing />;

  const stats = await getUserStats(session.user.id);
  return <Game initialStats={stats} />;
}
