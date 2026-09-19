import type { MetadataRoute } from "next";
import { SITE, SITE_URL } from "@/config/site";

// Only public, indexable pages. /api/* is intentionally excluded.
// Built at deploy time (no database access), so it can never fail a build.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
  ];
}
