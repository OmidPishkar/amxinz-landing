import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminSession } from "@/lib/admin";
import { PostForm } from "@/components/blog/post-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  if (!(await isAdminSession(session))) redirect("/weblog");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      <div className="mt-6">
        <PostForm mode="create" />
      </div>
    </div>
  );
}
