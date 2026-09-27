import type { Metadata } from "next";
import { OG_ALT, SITE } from "@/config/site";

/**
 * Builds a complete metadata object for a page. In the App Router a page's
 * `openGraph` REPLACES the layout's (no deep merge), so every page must define
 * the full set. This helper keeps that in one place.
 */
export function pageMetadata({
  title,
  description,
  path,
  image: customImage,
  article,
}: {
  title?: string;
  description: string;
  path: string;
  image?: { url: string; width: number; height: number; alt: string };
  article?: { publishedTime: string; modifiedTime?: string; tags?: string[] };
}): Metadata {
  const shareTitle = title ? `${title} · ${SITE.name}` : SITE.title;
  const image = customImage ?? { url: "/opengraph-image", width: 1200, height: 630, alt: OG_ALT };

  const openGraphBase = {
    siteName: SITE.name,
    locale: SITE.locale,
    url: path,
    title: shareTitle,
    description,
    images: [image],
  };
  const openGraph: Metadata["openGraph"] = article
    ? { ...openGraphBase, type: "article", publishedTime: article.publishedTime, modifiedTime: article.modifiedTime, tags: article.tags }
    : { ...openGraphBase, type: "website" };

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [image.url],
      ...(SITE.twitterHandle ? { site: SITE.twitterHandle, creator: SITE.twitterHandle } : {}),
    },
  };
}
