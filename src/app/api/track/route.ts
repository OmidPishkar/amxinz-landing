import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { classifySource, cleanRef, hostFromUrl, recordEvent } from "@/lib/analytics";
import { clientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";

const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|monitor/i;
const VISITOR_RE = /^[A-Za-z0-9_-]{8,64}$/;
const SKIP_PATH = /^\/(api|admin|_next)(\/|$)/;

// Page-view beacon. Always answers 204: a tracking problem must never be visible to a visitor.
export async function POST(req: Request) {
  const done = () => new NextResponse(null, { status: 204 });
  try {
    if (BOT_RE.test(req.headers.get("user-agent") ?? "")) return done();

    const body = await req.json().catch(() => null);
    const path = typeof body?.path === "string" ? body.path : "";
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId : "";
    if (!path.startsWith("/") || path.length > 200 || SKIP_PATH.test(path) || !VISITOR_RE.test(visitorId)) return done();

    if (!(await rateLimit(`track:${clientIp(req)}`, 400, 3600))) return done();

    const landing = body?.landing === true;
    const siteHost = req.headers.get("host") ?? hostFromUrl(SITE_URL);
    const { channel, source } = landing
      ? classifySource({
          ref: cleanRef(body?.ref),
          referrerHost: hostFromUrl(body?.referrer),
          siteHost: siteHost?.toLowerCase() ?? null,
        })
      : { channel: "internal" as const, source: "internal" };

    const session = await getServerSession(authOptions);
    await recordEvent({ type: "pageview", path, visitorId, userId: session?.user?.id ?? null, landing, channel, source });
  } catch (err) {
    console.error("track error:", err);
  }
  return done();
}
