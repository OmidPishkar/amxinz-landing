import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { buildRound } from "@/lib/binance";
<<<<<<< HEAD
import { clientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
=======
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
import type { RoundDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

<<<<<<< HEAD
const DAY_MS = 24 * 60 * 60 * 1000;
const globalForTtl = globalThis as unknown as { _roundTtlIdx?: Promise<unknown> };

// Returns a random real chart. The outcome stays on the server until the player answers.
// Guests can play too (their rounds are not tied to an account and delete themselves after 24h).
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const allowed = userId
    ? await rateLimit(`round:${userId}`, 300, 3600)
    : await rateLimit(`round:guest:${clientIp(req)}`, 120, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Too many charts. Try again in a little while." }, { status: 429 });
=======
// Returns a random real chart. The outcome stays on the server until the user answers.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to play." }, { status: 401 });
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
  }

  try {
    const round = await buildRound();
    const db = await getDb();
<<<<<<< HEAD
    const rounds = db.collection<Omit<RoundDoc, "_id">>("rounds");

    // Unanswered rounds expire after a day; answering clears this for logged-in players (history is kept).
    globalForTtl._roundTtlIdx ??= rounds.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => undefined);
    await globalForTtl._roundTtlIdx;

    const { insertedId } = await rounds.insertOne({
      userId,
      symbol: round.symbol,
      interval: round.interval,
      startTime: round.startTime,
      outcome: round.outcome,
      future: round.future,
      answered: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + DAY_MS),
    });
=======
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
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7

    return NextResponse.json({
      roundId: insertedId.toString(),
      interval: round.interval,
      candles: round.visible,
    });
  } catch (err) {
    console.error("round error:", err);
<<<<<<< HEAD
    return NextResponse.json({ error: "Could not load market data. Try again." }, { status: 502 });
=======
    return NextResponse.json(
      { error: "Could not load market data. Try again." },
      { status: 502 },
    );
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
  }
}
