import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
<<<<<<< HEAD
import { clientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
=======
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
import { POINTS_CORRECT, POINTS_WRONG } from "@/lib/game";
import type { RoundDoc, UserDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
<<<<<<< HEAD
  const userId = session?.user?.id ?? null;

  if (!userId && !(await rateLimit(`predict:guest:${clientIp(req)}`, 240, 3600))) {
    return NextResponse.json({ error: "Too many predictions. Try again in a little while." }, { status: 429 });
=======
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to play." }, { status: 401 });
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
  }

  const body = await req.json().catch(() => null);
  const direction = body?.direction;
  const roundId = body?.roundId;
  if ((direction !== "up" && direction !== "down") || !ObjectId.isValid(roundId)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const db = await getDb();
  const rounds = db.collection<RoundDoc>("rounds");
<<<<<<< HEAD
  // A logged-in player can only answer their own rounds; a guest only guest rounds.
  const round = await rounds.findOne({ _id: new ObjectId(roundId), userId });
=======
  const round = await rounds.findOne({
    _id: new ObjectId(roundId),
    userId: session.user.id,
  });
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
  if (!round) return NextResponse.json({ error: "Round not found." }, { status: 404 });

  const correct = round.outcome === direction;

  // The `answered: false` filter makes double submissions a no-op.
  const claimed = await rounds.updateOne(
    { _id: round._id, answered: false },
<<<<<<< HEAD
    {
      $set: { answered: true, choice: direction, correct, answeredAt: new Date() },
      // A logged-in player's answered round is history: stop it from expiring.
      ...(userId ? { $unset: { expiresAt: "" as const } } : {}),
    },
=======
    { $set: { answered: true, choice: direction, correct, answeredAt: new Date() } },
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
  );
  if (claimed.modifiedCount === 0) {
    return NextResponse.json({ error: "This round is already answered." }, { status: 409 });
  }

  const delta = correct ? POINTS_CORRECT : POINTS_WRONG;
<<<<<<< HEAD
  const reveal = { symbol: round.symbol, interval: round.interval, startTime: round.startTime };

  // Guests have no saved score: the browser keeps their running total for the session.
  if (!userId) {
    return NextResponse.json({ correct, outcome: round.outcome, delta, future: round.future, reveal, stats: null });
  }

  const user = await db.collection<UserDoc>("users").findOneAndUpdate(
    { _id: new ObjectId(userId) },
=======
  const user = await db.collection<UserDoc>("users").findOneAndUpdate(
    { _id: new ObjectId(session.user.id) },
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
    { $inc: { score: delta, played: 1, correct: correct ? 1 : 0 } },
    { returnDocument: "after" },
  );

  return NextResponse.json({
    correct,
    outcome: round.outcome,
    delta,
    future: round.future,
<<<<<<< HEAD
    reveal,
    stats: { score: user?.score ?? 0, played: user?.played ?? 0, correct: user?.correct ?? 0 },
=======
    reveal: { symbol: round.symbol, interval: round.interval, startTime: round.startTime },
    stats: {
      score: user?.score ?? 0,
      played: user?.played ?? 0,
      correct: user?.correct ?? 0,
    },
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
  });
}
