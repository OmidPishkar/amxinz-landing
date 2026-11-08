import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { classifySource, cleanRef, hostFromUrl } from "@/lib/analytics";
import { getUserById } from "@/lib/users";
import type { UserDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

const NEW_ACCOUNT_MS = 24 * 60 * 60 * 1000;

// Records where a NEW player first came from, using what their browser remembered from
// their first visit. Set once; accounts older than a day are ignored so an old account is
// never credited to whatever link its owner happens to click today.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const user = await getUserById(session.user.id);
    if (!user || user.source || Date.now() - user.createdAt.getTime() > NEW_ACCOUNT_MS) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const body = await req.json().catch(() => null);
    const ref = cleanRef(body?.ref);
    const host = hostFromUrl(body?.referrer);
    const { channel, source } = classifySource({ ref, referrerHost: host, siteHost: null });
    const path = typeof body?.path === "string" && body.path.startsWith("/") ? body.path.slice(0, 200) : null;

    const db = await getDb();
    await db.collection<UserDoc>("users").updateOne(
      { _id: new ObjectId(session.user.id), source: { $exists: false } },
      { $set: { source: { label: source, channel, ref, host, path, at: new Date() } } },
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("attribute error:", err);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
