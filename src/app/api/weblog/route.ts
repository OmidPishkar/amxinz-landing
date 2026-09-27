import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { createPost, InvalidSlugError, SlugTakenError } from "@/lib/blog";
import { rateLimit } from "@/lib/rate-limit";
import { SITE } from "@/config/site";

export const dynamic = "force-dynamic";

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 20_000;
const MAX_FOOTER = 4_000;
const MAX_META_DESCRIPTION = 300;

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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!(await isAdminSession(session))) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  // A generous cap so a compromised/careless admin session can't be scripted into a flood of posts.
  if (!(await rateLimit(`weblog-create:${session!.user.id}`, 20, 3600))) {
    return NextResponse.json({ error: "Too many posts created recently. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const bannerUrl = typeof body.bannerUrl === "string" ? body.bannerUrl : "";
  const description = typeof body.description === "string" ? body.description : "";
  const footer = typeof body.footer === "string" ? body.footer : "";
  const metaDescription = typeof body.metaDescription === "string" ? body.metaDescription : "";
  const tags = Array.isArray(body.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : [];
  const published = body.published !== false;
  const authorName = typeof body.authorName === "string" && body.authorName.trim() ? body.authorName.trim().slice(0, 80) : SITE.name;

  if (!title || title.length > MAX_TITLE) {
    return NextResponse.json({ error: `Title must be 1-${MAX_TITLE} characters.` }, { status: 400 });
  }
  if (!description || description.length > MAX_DESCRIPTION) {
    return NextResponse.json({ error: "The post body is required and too long." }, { status: 400 });
  }
  if (footer.length > MAX_FOOTER) {
    return NextResponse.json({ error: "The footer is too long." }, { status: 400 });
  }
  if (metaDescription.length > MAX_META_DESCRIPTION) {
    return NextResponse.json({ error: "The meta description is too long." }, { status: 400 });
  }
  if (!bannerUrl || !isUploadThingUrl(bannerUrl)) {
    return NextResponse.json({ error: "A valid banner image is required." }, { status: 400 });
  }

  try {
    const post = await createPost({
      title,
      slug: slug || undefined,
      bannerUrl,
      description,
      footer: footer || null,
      metaDescription: metaDescription || null,
      tags,
      authorName,
      published,
    });
    return NextResponse.json({ ok: true, slug: post.slug });
  } catch (err) {
    if (err instanceof SlugTakenError || err instanceof InvalidSlugError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("weblog create error:", err);
    return NextResponse.json({ error: "Could not create the post." }, { status: 500 });
  }
}
