import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { UTApi } from "uploadthing/server";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rate-limit";
import type { UserDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

// Only accept images hosted by UploadThing, never arbitrary URLs.
function isUploadThingUrl(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      (u.hostname === "utfs.io" || u.hostname.endsWith(".utfs.io") || u.hostname.endsWith(".ufs.sh"))
    );
  } catch {
    return false;
  }
}

// Best effort: free the storage used by the previous photo.
async function deleteStoredFile(url: string | null | undefined) {
  if (!url || !isUploadThingUrl(url)) return;
  try {
    const key = new URL(url).pathname.split("/").pop();
    if (key) await new UTApi().deleteFiles([key]);
  } catch (err) {
    console.error("Could not delete old avatar:", err);
  }
}

async function setAvatar(userId: string, url: string | null) {
  const db = await getDb();
  const users = db.collection<UserDoc>("users");
  const previous = await users.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { avatarUrl: url } },
    { returnDocument: "before" },
  );
  if (previous?.avatarUrl && previous.avatarUrl !== url) await deleteStoredFile(previous.avatarUrl);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  if (!(await rateLimit(`avatar:${session.user.id}`, 10, 3600))) {
    return NextResponse.json({ error: "Too many changes. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";
  if (url.length > 500 || !isUploadThingUrl(url)) {
    return NextResponse.json({ error: "Invalid image." }, { status: 400 });
  }

  await setAvatar(session.user.id, url);
  return NextResponse.json({ ok: true, url });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  await setAvatar(session.user.id, null);
  return NextResponse.json({ ok: true });
}
