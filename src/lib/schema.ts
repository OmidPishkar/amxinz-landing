import { SITE, SITE_URL } from "@/config/site";
import { FAQ } from "@/config/faq";

// Stable @id values let the graph nodes reference each other.
const ID = {
  org: `${SITE_URL}/#organization`,
  site: `${SITE_URL}/#website`,
  app: `${SITE_URL}/#app`,
};

const organization = {
  "@type": "Organization",
  "@id": ID.org,
  name: SITE.name,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}${SITE.logoPath}`, width: 180, height: 180 },
  ...(SITE.social.length ? { sameAs: [...SITE.social] } : {}),
};

const website = {
  "@type": "WebSite",
  "@id": ID.site,
  url: SITE_URL,
  name: SITE.name,
  description: SITE.description,
  inLanguage: SITE.language,
  publisher: { "@id": ID.org },
};

/** Site-wide graph (rendered once, in the root layout). */
export function siteSchema() {
  return { "@context": "https://schema.org", "@graph": [organization, website] };
}

/** Landing page: the web app itself, the page, and the FAQ shown on it. */
export function landingSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: SITE.title,
        description: SITE.description,
        inLanguage: SITE.language,
        isPartOf: { "@id": ID.site },
        about: { "@id": ID.app },
        dateModified: SITE.landingUpdated,
      },
      {
        "@type": "WebApplication",
        "@id": ID.app,
        name: SITE.name,
        url: `${SITE_URL}/`,
        description: SITE.description,
        applicationCategory: "GameApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        inLanguage: SITE.language,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": ID.org },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}

/** Reusable breadcrumb trail: Home > ... > current page. */
function breadcrumbList(url: string, trail: { name: string; item: string }[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: trail.map((step, i) => ({ "@type": "ListItem", position: i + 1, ...step })),
  };
}

/** /weblog: the listing page plus its breadcrumb. */
export function blogIndexSchema(description: string) {
  const url = `${SITE_URL}/weblog`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: "Weblog",
        description,
        inLanguage: SITE.language,
        isPartOf: { "@id": ID.site },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      breadcrumbList(url, [
        { name: "Home", item: `${SITE_URL}/` },
        { name: "Weblog", item: url },
      ]),
    ],
  };
}

/** /weblog/tag/[tag]: the archive page plus its breadcrumb. */
export function blogTagSchema(tag: string, tagSlug: string, description: string) {
  const url = `${SITE_URL}/weblog/tag/${tagSlug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: `${tag} — Weblog`,
        description,
        inLanguage: SITE.language,
        isPartOf: { "@id": ID.site },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      breadcrumbList(url, [
        { name: "Home", item: `${SITE_URL}/` },
        { name: "Weblog", item: `${SITE_URL}/weblog` },
        { name: tag, item: url },
      ]),
    ],
  };
}

export interface BlogPostSchemaInput {
  slug: string;
  title: string;
  description: string; // plain-text excerpt, not the full body
  bannerUrl: string;
  authorName: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** /weblog/[slug]: BlogPosting + breadcrumb. */
export function blogPostSchema(post: BlogPostSchemaInput) {
  const url = `${SITE_URL}/weblog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        mainEntityOfPage: `${url}#webpage`,
        headline: post.title,
        description: post.description,
        image: post.bannerUrl,
        datePublished: post.createdAt.toISOString(),
        dateModified: post.updatedAt.toISOString(),
        inLanguage: SITE.language,
        author: { "@type": "Person", name: post.authorName },
        publisher: { "@id": ID.org },
        ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: post.title,
        description: post.description,
        inLanguage: SITE.language,
        isPartOf: { "@id": ID.site },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      breadcrumbList(url, [
        { name: "Home", item: `${SITE_URL}/` },
        { name: "Weblog", item: `${SITE_URL}/weblog` },
        { name: post.title, item: url },
      ]),
    ],
  };
}

/** Leaderboard page: the page plus its breadcrumb trail. */
export function leaderboardSchema(description: string) {
  const url = `${SITE_URL}/leaderboard`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: "Top Chart Predictors Leaderboard",
        description,
        inLanguage: SITE.language,
        isPartOf: { "@id": ID.site },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      breadcrumbList(url, [
        { name: "Home", item: `${SITE_URL}/` },
        { name: "Leaderboard", item: url },
      ]),
    ],
  };
}
