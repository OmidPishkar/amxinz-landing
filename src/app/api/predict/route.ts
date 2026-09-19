import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { POINTS_CORRECT, POINTS_WRONG } from "@/lib/game";
import type { RoundDoc, UserDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to play." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const direction = body?.direction;
  const roundId = body?.roundId;
  if ((direction !== "up" && direction !== "down") || !ObjectId.isValid(roundId)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const db = await getDb();
  const rounds = db.collection<RoundDoc>("rounds");
  const round = await rounds.findOne({
    _id: new ObjectId(roundId),
    userId: session.user.id,
  });
  if (!round) return NextResponse.json({ error: "Round not found." }, { status: 404 });

  const correct = round.outcome === direction;

  // The `answered: false` filter makes double submissions a no-op.
  const claimed = await rounds.updateOne(
    { _id: round._id, answered: false },
    { $set: { answered: true, choice: direction, correct, answeredAt: new Date() } },
  );
  if (claimed.modifiedCount === 0) {
    return NextResponse.json({ error: "This round is already answered." }, { status: 409 });
  }

  const delta = correct ? POINTS_CORRECT : POINTS_WRONG;
  const user = await db.collection<UserDoc>("users").findOneAndUpdate(
    { _id: new ObjectId(session.user.id) },
    { $inc: { score: delta, played: 1, correct: correct ? 1 : 0 } },
    { returnDocument: "after" },
  );

  return NextResponse.json({
    correct,
    outcome: round.outcome,
    delta,
    future: round.future,
    reveal: { symbol: round.symbol, interval: round.interval, startTime: round.startTime },
    stats: {
      score: user?.score ?? 0,
      played: user?.played ?? 0,
      correct: user?.correct ?? 0,
    },
  });
}
