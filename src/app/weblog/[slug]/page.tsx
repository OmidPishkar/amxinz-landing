import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getPostBySlug } from "@/lib/blog";
import { renderMarkdown, excerpt } from "@/lib/markdown";
import { TagChips } from "@/components/blog/tag-chips";
import { AdminPostControls } from "@/components/blog/admin-post-controls";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import { blogPostSchema } from "@/lib/schema";
import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function loadForAdmin(slug: string) {
  // Admins can preview their own unpublished drafts; everyone else only sees published posts.
  const session = await getServerSession(authOptions);
  const admin = await isAdminSession(session);
  const post = await getPostBySlug(slug, { includeUnpublished: admin });
  return { post, admin };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await loadForAdmin(slug);
  if (!post) return { title: "Post not found", robots: { index: false, follow: false } };

  const description = post.metaDescription || excerpt(post.description);
  return pageMetadata({
    title: post.title,
    description,
    path: `/weblog/${post.slug}`,
    image: { url: post.bannerUrl, width: 1200, height: 630, alt: post.title },
    article: {
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      tags: post.tags,
    },
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post, admin } = await loadForAdmin(slug);
  if (!post) notFound();

  const description = post.metaDescription || excerpt(post.description);
  const bodyHtml = renderMarkdown(post.description);
  const footerHtml = post.footer ? renderMarkdown(post.footer) : null;

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
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
          <li aria-current="page" className="truncate">
            {post.title}
          </li>
        </ol>
      </nav>

      {!post.published && (
        <p className="mb-4 rounded-md border border-dashed px-3 py-2 text-[13px] text-muted-foreground">
          Draft — only visible to admins.
        </p>
      )}

      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg bg-muted">
        <Image src={post.bannerUrl} alt="" fill unoptimized priority className="object-cover" />
      </div>

      <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight">{post.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {post.authorName} · <time dateTime={post.createdAt.toISOString()}>{formatDate(post.createdAt)}</time>
      </p>
      {post.tags.length > 0 && <TagChips tags={post.tags} className="mt-4" />}

      <div
        className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-foreground prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {footerHtml && (
        <div
          className="mt-8 border-t pt-6 text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-4"
          dangerouslySetInnerHTML={{ __html: footerHtml }}
        />
      )}

      {admin && (
        <div className="mt-10">
          <AdminPostControls id={post._id.toString()} slug={post.slug} />
        </div>
      )}

      <JsonLd
        data={blogPostSchema({
          slug: post.slug,
          title: post.title,
          description,
          bannerUrl: post.bannerUrl.startsWith("http") ? post.bannerUrl : `${SITE_URL}${post.bannerUrl}`,
          authorName: post.authorName,
          tags: post.tags,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })}
      />
    </article>
  );
}
