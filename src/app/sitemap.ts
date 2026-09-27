import type { MetadataRoute } from "next";
import { SITE, SITE_URL } from "@/config/site";
import { listPostsForSitemap, listAllTags } from "@/lib/blog";

// Only public, indexable pages. /api/* is intentionally excluded.
// Touches the database for blog content, so a Mongo hiccup must degrade to a smaller
// sitemap rather than fail the whole route.
async function safeBlogEntries() {
  try {
    const [posts, tags] = await Promise.all([listPostsForSitemap(), listAllTags()]);
    return { posts, tags };
  } catch (err) {
    console.error("sitemap: could not load blog data:", err);
    return { posts: [], tags: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts, tags } = await safeBlogEntries();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(SITE.landingUpdated),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/weblog`,
      lastModified: posts[0]?.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/weblog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((t) => ({
    url: `${SITE_URL}/weblog/tag/${t.slug}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticEntries, ...postEntries, ...tagEntries];
}
