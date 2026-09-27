"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BannerUploader } from "./banner-uploader";
import { slugify } from "@/lib/slug";

export interface PostFormValues {
  title: string;
  slug: string;
  bannerUrl: string;
  description: string;
  footer: string;
  tags: string; // comma-separated in the UI; split into an array on submit
  metaDescription: string;
  authorName: string;
  published: boolean;
}

const EMPTY: PostFormValues = {
  title: "",
  slug: "",
  bannerUrl: "",
  description: "",
  footer: "",
  tags: "",
  metaDescription: "",
  authorName: "",
  published: true,
};

export function PostForm({
  mode,
  postId,
  initial,
}: {
  mode: "create" | "edit";
  postId?: string;
  initial?: PostFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PostFormValues>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function onTitleChange(title: string) {
    set("title", title);
    if (!slugTouched) set("slug", slugify(title));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.bannerUrl) return setError("Upload a banner image first.");
    if (!values.title.trim()) return setError("Title is required.");
    if (!values.description.trim()) return setError("The post body is required.");

    setBusy(true);
    try {
      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim().toLowerCase(),
        bannerUrl: values.bannerUrl,
        description: values.description,
        footer: values.footer,
        metaDescription: values.metaDescription,
        authorName: values.authorName,
        tags: values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        published: values.published,
      };

      const res = await fetch(mode === "create" ? "/api/weblog" : `/api/weblog/${postId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save the post.");

      router.push(`/weblog/${data.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the post.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <label htmlFor="banner" className="mb-1.5 block text-[13px] font-medium">
          Banner image
        </label>
        <BannerUploader value={values.bannerUrl} onChange={(url) => set("bannerUrl", url)} />
      </div>

      <div>
        <label htmlFor="title" className="mb-1.5 block text-[13px] font-medium">
          Title
        </label>
        <input
          id="title"
          value={values.title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={200}
          required
          className="h-9 w-full rounded-md border bg-background px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="slug" className="mb-1.5 block text-[13px] font-medium">
          URL
        </label>
        <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
          <span className="whitespace-nowrap">/weblog/</span>
          <input
            id="slug"
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value.toLowerCase());
            }}
            maxLength={80}
            className="h-8 w-full rounded-md border bg-background px-2 text-[13px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Lowercase letters, numbers and hyphens only.</p>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-[13px] font-medium">
          Body (Markdown)
        </label>
        <textarea
          id="description"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={16}
          required
          maxLength={20_000}
          className="w-full rounded-md border bg-background px-3 py-2 text-[14px] leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Headings, bold/italic, links, lists and images are supported.
        </p>
      </div>

      <div>
        <label htmlFor="footer" className="mb-1.5 block text-[13px] font-medium">
          Footer <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="footer"
          value={values.footer}
          onChange={(e) => set("footer", e.target.value)}
          rows={3}
          maxLength={4_000}
          placeholder="A short closing note, disclaimer, or call to action."
          className="w-full rounded-md border bg-background px-3 py-2 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="tags" className="mb-1.5 block text-[13px] font-medium">
          Tags
        </label>
        <input
          id="tags"
          value={values.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="Candlestick Patterns, Risk Management"
          className="h-9 w-full rounded-md border bg-background px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Comma-separated, up to 10. Each tag gets its own indexable archive page at /weblog/tag/…
        </p>
      </div>

      <div>
        <label htmlFor="metaDescription" className="mb-1.5 block text-[13px] font-medium">
          SEO description <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="metaDescription"
          value={values.metaDescription}
          onChange={(e) => set("metaDescription", e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="Shown in Google search results and social previews. Falls back to an excerpt of the body."
          className="w-full rounded-md border bg-background px-3 py-2 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="authorName" className="mb-1.5 block text-[13px] font-medium">
          Author <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="authorName"
          value={values.authorName}
          onChange={(e) => set("authorName", e.target.value)}
          maxLength={80}
          placeholder="Amxinz"
          className="h-9 w-full max-w-xs rounded-md border bg-background px-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <label className="flex items-center gap-2 text-[13px]">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) => set("published", e.target.checked)}
          className="size-4 rounded border"
        />
        Published (visible on /weblog and in search engines)
      </label>

      {error && (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      )}

      <div>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          {mode === "create" ? "Publish post" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
