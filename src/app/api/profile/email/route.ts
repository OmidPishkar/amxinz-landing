import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rate-limit";
import { emailConfigured, sendEmail, verificationEmail } from "@/lib/email";
import type { EmailTokenDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const globalForTtl = globalThis as unknown as { _emailTokenIdx?: Promise<unknown> };

// Sends a one-hour confirmation link. The email is only saved on the profile once the link is opened.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  if (!emailConfigured()) {
    return NextResponse.json({ error: "Email is not configured on this site yet." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Stops anyone from using this endpoint to spam an inbox.
  if (!(await rateLimit(`email:${session.user.id}`, 10, 3600))) {
    return NextResponse.json({ error: "Too many requests. Try again in an hour." }, { status: 429 });
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const db = await getDb();
  const tokens = db.collection<EmailTokenDoc>("email_tokens");
  globalForTtl._emailTokenIdx ??= tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => undefined);
  await globalForTtl._emailTokenIdx;

  await tokens.deleteMany({ userId: session.user.id }); // one active link per user
  await tokens.insertOne({
    userId: session.user.id,
    email,
    tokenHash,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  const link = `${new URL(req.url).origin}/api/email/verify?token=${token}`;
  const mail = verificationEmail(link);
  const sent = await sendEmail({ to: email, ...mail });
  if (!sent.ok) {
    await tokens.deleteMany({ userId: session.user.id });
    return NextResponse.json(
      { error: "Could not send the email. Check the address and try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
