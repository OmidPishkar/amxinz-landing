import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createChallenge } from "@/lib/challenges";
import { CHALLENGE_DAYS } from "@/lib/game";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // building the 10 charts calls Binance 10 times in parallel

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Log in to create a challenge." }, { status: 401 });

  // Each challenge costs 10 Binance requests and a large database document.
  if (!(await rateLimit(`challenge:${session.user.id}`, 5, 3600))) {
    return NextResponse.json({ error: "You can create 5 challenges per hour. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const days = Number(body?.days);
  if (!(CHALLENGE_DAYS as readonly number[]).includes(days)) {
    return NextResponse.json({ error: "Choose how long the challenge stays open." }, { status: 400 });
  }
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 60) : "";

  try {
    const challenge = await createChallenge({
      creatorId: session.user.id,
      title: title || "Chart challenge",
      days,
      isPublic: body?.isPublic !== false,
    });
    return NextResponse.json({ code: challenge.code });
  } catch (err) {
    console.error("create challenge error:", err);
    return NextResponse.json({ error: "Could not load market data for the challenge. Try again." }, { status: 502 });
  }
}
