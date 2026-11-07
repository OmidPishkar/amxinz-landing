"use client";

import { useMemo, useRef, useState } from "react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  SquareCode,
} from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

interface Edit {
  text: string;
  start: number;
  end: number;
}

export function MarkdownEditor({
  id,
  value,
  onChange,
  maxLength = 20_000,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("blogImage", { onUploadError: (err) => setError(err.message) });
  const previewHtml = useMemo(() => (tab === "preview" ? renderMarkdown(value) : ""), [tab, value]);

  // Applies a text edit and puts the selection back where the editor expects it.
  function apply(edit: (text: string, start: number, end: number) => Edit) {
    const ta = ref.current;
    if (!ta) return;
    const result = edit(value, ta.selectionStart, ta.selectionEnd);
    if (result.text.length > maxLength) return setError(`The post can be at most ${maxLength.toLocaleString()} characters.`);
    setError(null);
    onChange(result.text);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.start, result.end);
    });
  }

  function wrap(before: string, after: string, placeholder: string) {
    apply((text, s, e) => {
      const selected = text.slice(s, e) || placeholder;
      const start = s + before.length;
      return { text: text.slice(0, s) + before + selected + after + text.slice(e), start, end: start + selected.length };
    });
  }

  // Adds a prefix to every selected line, or removes it when every line already has it.
  function toggleLines(prefixFor: (i: number) => string, has: RegExp, strip: RegExp) {
    apply((text, s, e) => {
      const lineStart = text.lastIndexOf("\n", s - 1) + 1;
      const nl = text.indexOf("\n", e);
      const lineEnd = nl === -1 ? text.length : nl;
      const lines = text.slice(lineStart, lineEnd).split("\n");
      const allHave = lines.every((l) => has.test(l));
      const next = lines.map((l, i) => (allHave ? l.replace(strip, "") : prefixFor(i) + l.replace(strip, ""))).join("\n");
      return { text: text.slice(0, lineStart) + next + text.slice(lineEnd), start: lineStart, end: lineStart + next.length };
    });
  }

  function insertBlock(block: string, selectFrom?: number, selectLen?: number) {
    apply((text, s, e) => {
      const before = text.slice(0, s);
      const lead = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
      const inserted = lead + block + "\n\n";
      const base = s + lead.length;
      return {
        text: before + inserted + text.slice(e),
        start: selectFrom !== undefined ? base + selectFrom : s + inserted.length,
        end: selectFrom !== undefined ? base + selectFrom + (selectLen ?? 0) : s + inserted.length,
      };
    });
  }

  function insertLink() {
    const raw = linkUrl.trim();
    if (!raw) return;
    const url = /^(https?:\/\/|mailto:|\/|#)/i.test(raw) ? raw : `https://${raw}`;
    wrap("[", `](${url})`, "link text");
    setLinkUrl("");
    setLinkOpen(false);
  }

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > MAX_IMAGE_BYTES) return setError("The image must be 4 MB or smaller.");

    setError(null);
    setUploading(true);
    try {
      const uploaded = await startUpload([file]);
      const first = uploaded?.[0] as { ufsUrl?: string; url?: string } | undefined;
      const url = first?.ufsUrl ?? first?.url;
      if (!url) throw new Error("Upload failed. Try again.");
      // The alt text is pre-selected so you can type a description right away (good for SEO and accessibility).
      const alt = "Describe the image";
      insertBlock(`![${alt}](${url})`, 2, alt.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    if (key === "b") {
      e.preventDefault();
      wrap("**", "**", "bold text");
    } else if (key === "i") {
      e.preventDefault();
      wrap("*", "*", "italic text");
    } else if (key === "k") {
      e.preventDefault();
      setLinkOpen(true);
    }
  }

  // A single "#" is shown as H2 on the page (the post title is the only H1), "##" as H3.
  const tools: { label: string; icon: React.ReactNode; run: () => void }[] = [
    { label: "Bold (Ctrl+B)", icon: <Bold />, run: () => wrap("**", "**", "bold text") },
    { label: "Italic (Ctrl+I)", icon: <Italic />, run: () => wrap("*", "*", "italic text") },
    { label: "Heading 2", icon: <Heading2 />, run: () => toggleLines(() => "# ", /^# /, /^#{1,6} /) },
    { label: "Heading 3", icon: <Heading3 />, run: () => toggleLines(() => "## ", /^## /, /^#{1,6} /) },
    { label: "Link (Ctrl+K)", icon: <Link2 />, run: () => setLinkOpen((v) => !v) },
    { label: "Bulleted list", icon: <List />, run: () => toggleLines(() => "- ", /^- /, /^(- |\d+\. |> )/) },
    { label: "Numbered list", icon: <ListOrdered />, run: () => toggleLines((i) => `${i + 1}. `, /^\d+\. /, /^(- |\d+\. |> )/) },
    { label: "Quote", icon: <Quote />, run: () => toggleLines(() => "> ", /^> /, /^(- |\d+\. |> )/) },
    { label: "Inline code", icon: <Code />, run: () => wrap("`", "`", "code") },
    { label: "Code block", icon: <SquareCode />, run: () => insertBlock("```\ncode\n```", 4, 4) },
    { label: "Divider", icon: <Minus />, run: () => insertBlock("---") },
  ];

  const btn =
    "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 [&_svg]:size-4";

  return (
    <div className="overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-ring">
      <div className="flex flex-wrap items-center justify-between gap-1 border-b bg-muted px-1.5 py-1">
        <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5">
          {tools.map((t) => (
            <button
              key={t.label}
              type="button"
              title={t.label}
              aria-label={t.label}
              disabled={tab === "preview"}
              onMouseDown={(e) => e.preventDefault()} // keeps the text selection while clicking
              onClick={t.run}
              className={btn}
            >
              {t.icon}
            </button>
          ))}
          <button
            type="button"
            title="Insert image"
            aria-label="Insert image"
            disabled={tab === "preview" || uploading}
            onClick={() => fileInput.current?.click()}
            className={btn}
          >
            {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
          </button>
          <input ref={fileInput} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={onImage} />
        </div>

        <div role="tablist" aria-label="Editor mode" className="flex gap-0.5 text-[13px]">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn("rounded-md px-2.5 py-1 capitalize", tab === t ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {linkOpen && tab === "write" && (
        <div className="flex items-center gap-2 border-b px-2 py-1.5">
          <label htmlFor={`${id}-link`} className="sr-only">
            Link address
          </label>
          <input
            id={`${id}-link`}
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                insertLink();
              } else if (e.key === "Escape") {
                setLinkOpen(false);
                ref.current?.focus();
              }
            }}
            placeholder="https://example.com"
            className="h-7 flex-1 rounded-md border bg-background px-2 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button type="button" onClick={insertLink} className="rounded-md border px-2.5 py-1 text-[13px] hover:bg-accent">
            Add link
          </button>
        </div>
      )}

      {tab === "write" ? (
        <textarea
          id={id}
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={18}
          maxLength={maxLength}
          spellCheck
          className="block w-full resize-y bg-background px-3 py-2 text-[14px] leading-relaxed outline-none"
        />
      ) : (
        <div className="min-h-[18rem] bg-background px-3 py-3">
          {value.trim() ? (
            <div
              className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-foreground prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <p className="text-[13px] text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t bg-muted px-3 py-1 text-xs text-muted-foreground">
        <span>
          Select text and use the buttons. Images upload to your library and are inserted where the cursor is.
        </span>
        <span className="shrink-0 tabular-nums">
          {value.length.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
      </div>
      {error && (
        <p role="alert" className="border-t px-3 py-1.5 text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
