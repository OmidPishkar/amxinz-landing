import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPostsByTag, listAllTags } from "@/lib/blog";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import { blogTagSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";

async function findTag(tagSlug: string) {
  const tags = await listAllTags();
  return tags.find((t) => t.slug === tagSlug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagSlug: string }>;
}): Promise<Metadata> {
  const { tagSlug } = await params;
  const tag = await findTag(tagSlug);
  if (!tag) return { title: "Tag not found", robots: { index: false, follow: false } };

  return pageMetadata({
    title: `${tag.tag} — Weblog`,
    description: `${tag.count} post${tag.count === 1 ? "" : "s"} tagged "${tag.tag}" on the Amxinz weblog.`,
    path: `/weblog/tag/${tag.slug}`,
  });
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tagSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { tagSlug } = await params;
  const tag = await findTag(tagSlug);
  // An empty/unknown tag is a thin, low-value page — a real 404 is better for SEO than an empty listing.
  if (!tag) notFound();

  const sp = await searchParams;
  const page = Number.parseInt(sp.page ?? "1", 10) || 1;
  const { posts, pages, page: current } = await listPostsByTag(tagSlug, page);
  const description = `${tag.count} post${tag.count === 1 ? "" : "s"} tagged "${tag.tag}" on the Amxinz weblog.`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/weblog" className="hover:text-foreground hover:underline">
              Weblog
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page">{tag.tag}</li>
        </ol>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight">{tag.tag}</h1>
      <p className="mt-1 text-muted-foreground">{description}</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">
            Page {current} of {pages}
          </span>
          <span className="flex gap-1">
            {current > 1 && (
              <Link
                href={`/weblog/tag/${tagSlug}?page=${current - 1}`}
                className="rounded-md border px-2.5 py-1 hover:bg-accent"
              >
                Previous
              </Link>
            )}
            {current < pages && (
              <Link
                href={`/weblog/tag/${tagSlug}?page=${current + 1}`}
                className="rounded-md border px-2.5 py-1 hover:bg-accent"
              >
                Next
              </Link>
            )}
          </span>
        </nav>
      )}

      <JsonLd data={blogTagSchema(tag.tag, tag.slug, description)} />
    </div>
  );
}
