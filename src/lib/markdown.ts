import { Marked } from "marked";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Links and images may only point to web addresses, same-site paths or #anchors
// (and mailto: for links). Anything else, such as javascript:, is dropped.
function safeUrl(href: string, allowMail: boolean): string | null {
  const url = href.trim();
  const ok = /^(https?:\/\/|\/(?!\/)|#)/i.test(url) || (allowMail && /^mailto:/i.test(url));
  return ok ? encodeURI(url).replace(/%25/g, "%") : null;
}

// Safety without a sanitizer library: raw HTML typed into a post is shown as plain
// text (never run), and unsafe URLs are removed. Only the admin writes posts, but
// the output must still never be able to run a script.
//
// The post title is the page's only <h1>, so every Markdown heading is pushed down
// one level (a single '#' becomes <h2>, max <h6>).
const marked = new Marked({
  renderer: {
    heading({ tokens, depth }) {
      const level = Math.min(depth + 1, 6);
      const text = this.parser.parseInline(tokens);
      return `<h${level}>${text}</h${level}>\n`;
    },
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const url = safeUrl(href, true);
      if (!url) return text;
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      const external = /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${escapeHtml(url)}"${titleAttr}${external}>${text}</a>`;
    },
    image({ href, title, text }) {
      const url = safeUrl(href, false);
      if (!url) return escapeHtml(text);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<img src="${escapeHtml(url)}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" />`;
    },
  },
});

/** Renders admin-authored Markdown to HTML that is safe to use with dangerouslySetInnerHTML. */
export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false }) as string;
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
