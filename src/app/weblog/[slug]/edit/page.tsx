import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { getPostBySlug } from "@/lib/blog";
import { PostForm } from "@/components/blog/post-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!(await isAdminSession(session))) redirect("/weblog");

  const { slug } = await params;
  const post = await getPostBySlug(slug, { includeUnpublished: true });
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
      <div className="mt-6">
        <PostForm
          mode="edit"
          postId={post._id.toString()}
          initial={{
            title: post.title,
            slug: post.slug,
            bannerUrl: post.bannerUrl,
            description: post.description,
            footer: post.footer ?? "",
            tags: post.tags.join(", "),
            metaDescription: post.metaDescription ?? "",
            authorName: post.authorName,
            published: post.published,
          }}
        />
      </div>
    </div>
  );
}
