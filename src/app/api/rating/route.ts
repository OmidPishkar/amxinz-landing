import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByUsername } from "@/lib/users";
import { getMyRating, getRatingSummary, setRating } from "@/lib/ratings";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Rate another player's public profile from 1 to 5 stars (0 removes your rating).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Log in to rate players." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.toLowerCase() : "";
  const stars = body?.stars;
  if (!username || !Number.isInteger(stars) || stars < 0 || stars > 5) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    if (!(await rateLimit(`rating:${session.user.id}`, 60, 3600))) {
      return NextResponse.json({ error: "Too many ratings. Try again later." }, { status: 429 });
    }

    const target = await getUserByUsername(username);
    // A private page can't be rated: to everyone else it does not exist as a page.
    if (!target || !target.profilePublic) {
      return NextResponse.json({ error: "This profile is not available." }, { status: 404 });
    }
    const targetId = target._id.toString();
    if (targetId === session.user.id) {
      return NextResponse.json({ error: "You can't rate yourself." }, { status: 400 });
    }

    await setRating(targetId, session.user.id, stars);
    const [summary, mine] = await Promise.all([getRatingSummary(targetId), getMyRating(targetId, session.user.id)]);
    return NextResponse.json({ ok: true, ...summary, mine });
  } catch (err) {
    console.error("rating error:", err);
    return NextResponse.json({ error: "Could not save your rating. Try again." }, { status: 502 });
  }
}
