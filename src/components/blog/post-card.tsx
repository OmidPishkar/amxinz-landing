import Link from "next/link";
import Image from "next/image";
import type { BlogPostDoc } from "@/lib/types";
import { TagChips } from "./tag-chips";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function PostCard({
  post,
}: {
  post: Pick<BlogPostDoc, "slug" | "title" | "bannerUrl" | "tags" | "createdAt" | "metaDescription">;
}) {
  return (
    <article className="overflow-hidden rounded-lg border transition-colors hover:border-foreground/20">
      <Link href={`/weblog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <Image src={post.bannerUrl} alt="" fill unoptimized className="object-cover" />
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
          <h3 className="mt-1 font-semibold tracking-tight">{post.title}</h3>
          {post.metaDescription && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.metaDescription}</p>
          )}
        </div>
      </Link>
      {post.tags.length > 0 && (
        <div className="px-4 pb-4">
          <TagChips tags={post.tags} />
        </div>
      )}
    </article>
  );
}
