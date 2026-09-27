import { Marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

// The post title is the page's only <h1>. Markdown '#' would normally also produce
// an <h1>, so every heading level is pushed down one (max h6) to keep that true.
const marked = new Marked({
  renderer: {
    heading({ tokens, depth }) {
      const level = Math.min(depth + 1, 6);
      const text = this.parser.parseInline(tokens);
      return `<h${level}>${text}</h${level}>\n`;
    },
  },
});

/** Renders admin-authored Markdown to sanitized HTML. Safe to use with dangerouslySetInnerHTML. */
export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false }) as string;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "hr",
      "h2", "h3", "h4", "h5", "h6",
      "strong", "em", "del", "code", "pre",
      "ul", "ol", "li",
      "blockquote",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel"],
  });
}

/** Plain-text excerpt for meta descriptions and listing cards (Markdown syntax stripped). */
export function excerpt(source: string, maxLength = 160): string {
  const text = source
    .replace(/!\[[^\]]*]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1") // links -> label only
    .replace(/[#*_`>~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
