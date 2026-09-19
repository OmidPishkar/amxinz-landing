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
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Leaderboard", item: url },
        ],
      },
    ],
  };
}
