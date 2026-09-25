import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { EmailTokenDoc, UserDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

// The link in the confirmation email points here. Tokens are single use.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const invalid = () => NextResponse.redirect(new URL("/profile?email=invalid", url));

  const token = url.searchParams.get("token") ?? "";
  if (!/^[a-f0-9]{64}$/.test(token)) return invalid();

  const db = await getDb();
  const doc = await db
    .collection<EmailTokenDoc>("email_tokens")
    .findOneAndDelete({ tokenHash: createHash("sha256").update(token).digest("hex") });
  if (!doc || doc.expiresAt < new Date()) return invalid();

  await db
    .collection<UserDoc>("users")
    .updateOne({ _id: new ObjectId(doc.userId) }, { $set: { email: doc.email, emailVerified: true } });

  return NextResponse.redirect(new URL("/profile?email=verified", url));
}
