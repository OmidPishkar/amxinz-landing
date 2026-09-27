import Link from "next/link";
import { slugify } from "@/lib/slug";

export function TagChips({ tags, className }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null;
  return (
    <div className={className ? `flex flex-wrap gap-1.5 ${className}` : "flex flex-wrap gap-1.5"}>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/weblog/tag/${slugify(tag)}`}
          className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
