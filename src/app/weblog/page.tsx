import Link from "next/link";
import { getServerSession } from "next-auth";
import { PenSquare } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { listPosts, listAllTags } from "@/lib/blog";
import { PostCard } from "@/components/blog/post-card";
import { TagChips } from "@/components/blog/tag-chips";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import { blogIndexSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Guides on reading candlestick charts, market structure and risk — written to practice on Amxinz's real chart rounds.";

export const metadata = pageMetadata({ title: "Weblog", description: DESCRIPTION, path: "/weblog" });

export default async function WeblogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number.parseInt(sp.page ?? "1", 10) || 1;

  const [session, { posts, pages, page: current }, tags] = await Promise.all([
    getServerSession(authOptions),
    listPosts(page),
    listAllTags(),
  ]);
  const admin = await isAdminSession(session);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Weblog</h1>
          <p className="mt-1 max-w-xl text-muted-foreground">{DESCRIPTION}</p>
        </div>
        {admin && (
          <Button asChild size="sm">
            <Link href="/weblog/new">
              <PenSquare /> New post
            </Link>
          </Button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="mt-6">
          <TagChips tags={tags.map((t) => t.tag)} />
        </div>
      )}

      {posts.length === 0 ? (
        <div className="mt-8 rounded-lg border p-8 text-center">
          <p className="font-medium">No posts yet.</p>
          {admin && <p className="mt-1 text-muted-foreground">Use "New post" above to publish the first one.</p>}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">
            Page {current} of {pages}
          </span>
          <span className="flex gap-1">
            {current > 1 && (
              <Link href={`/weblog?page=${current - 1}`} className="rounded-md border px-2.5 py-1 hover:bg-accent">
                Previous
              </Link>
            )}
            {current < pages && (
              <Link href={`/weblog?page=${current + 1}`} className="rounded-md border px-2.5 py-1 hover:bg-accent">
                Next
              </Link>
            )}
          </span>
        </nav>
      )}

      <JsonLd data={blogIndexSchema(DESCRIPTION)} />
    </div>
  );
}
