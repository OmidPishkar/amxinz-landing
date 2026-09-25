import { NextResponse } from "next/server";
import { ObjectId, MongoServerError } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rate-limit";
import type { UserDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

// 3-20 chars, lowercase letters/digits/underscore, must start with a letter (keeps it readable, e.g. as a future /u/handle).
const USERNAME_RE = /^[a-z][a-z0-9_]{2,19}$/;
const RESERVED = new Set(["admin", "amxinz", "leaderboard", "profile", "login", "api", "support", "help", "null", "undefined"]);

const globalForIdx = globalThis as unknown as { _usernameIdx?: Promise<unknown> };

async function usersCollection() {
  const db = await getDb();
  const col = db.collection<UserDoc>("users");
  // Enforces uniqueness at the database level; the app-level check below is only a friendly first pass.
  globalForIdx._usernameIdx ??= col
    .createIndex({ username: 1 }, { unique: true, sparse: true })
    .catch(() => undefined);
  await globalForIdx._usernameIdx;
  return col;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  if (!(await rateLimit(`username:${session.user.id}`, 5, 86_400))) {
    return NextResponse.json({ error: "Too many changes today. Try again tomorrow." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "3-20 characters: start with a letter, then letters, numbers or underscores." },
      { status: 400 },
    );
  }
  if (RESERVED.has(username)) {
    return NextResponse.json({ error: "That username is reserved." }, { status: 400 });
  }

  const users = await usersCollection();
  try {
    await users.updateOne({ _id: new ObjectId(session.user.id) }, { $set: { username } });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }
    console.error("Username update failed:", err);
    return NextResponse.json({ error: "Could not save the username." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, username });
}
