import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getUserById } from "@/lib/users";
import type { UserDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

// Makes the player's page at /u/<username> public or private.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (typeof body?.public !== "boolean") return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  try {
    const user = await getUserById(session.user.id);
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    // The public address is /u/<username>, so a public page needs one.
    if (body.public && !user.username) {
      return NextResponse.json({ error: "Pick a username first. It becomes your public address." }, { status: 400 });
    }

    const db = await getDb();
    await db
      .collection<UserDoc>("users")
      .updateOne({ _id: new ObjectId(session.user.id) }, { $set: { profilePublic: body.public } });
    return NextResponse.json({ ok: true, public: body.public });
  } catch (err) {
    console.error("visibility error:", err);
    return NextResponse.json({ error: "Could not save this setting. Try again." }, { status: 502 });
  }
}
