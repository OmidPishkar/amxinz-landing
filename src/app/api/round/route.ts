import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { buildRound } from "@/lib/binance";
import type { RoundDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

// Returns a random real chart. The outcome stays on the server until the user answers.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to play." }, { status: 401 });
  }

  try {
    const round = await buildRound();
    const db = await getDb();
    const { insertedId } = await db
      .collection<Omit<RoundDoc, "_id">>("rounds")
      .insertOne({
        userId: session.user.id,
        symbol: round.symbol,
        interval: round.interval,
        startTime: round.startTime,
        outcome: round.outcome,
        future: round.future,
        answered: false,
        createdAt: new Date(),
      });

    return NextResponse.json({
      roundId: insertedId.toString(),
      interval: round.interval,
      candles: round.visible,
    });
  } catch (err) {
    console.error("round error:", err);
    return NextResponse.json(
      { error: "Could not load market data. Try again." },
      { status: 502 },
    );
  }
}
