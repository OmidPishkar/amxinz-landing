import type { MetadataRoute } from "next";
import { SITE, SITE_URL } from "@/config/site";

const AI_TRAINING_BOTS = ["GPTBot", "CCBot", "Google-Extended", "ClaudeBot", "anthropic-ai", "Bytespider"];

export default function robots(): MetadataRoute.Robots {
  // Netlify sets CONTEXT to "deploy-preview" / "branch-deploy" for non-production builds.
  const isProduction = !process.env.CONTEXT || process.env.CONTEXT === "production";
  if (!isProduction) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      // /api holds auth and game endpoints. Never block /_next: Google needs its CSS/JS to render pages.
<<<<<<< HEAD
      { userAgent: "*", allow: "/", disallow: ["/api/", "/profile", "/challenges", "/weblog/new", "/weblog/*/edit"] },
=======
      { userAgent: "*", allow: "/", disallow: ["/api/", "/profile", "/weblog/new", "/weblog/*/edit"] },
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
      ...(SITE.blockAiTraining ? [{ userAgent: [...AI_TRAINING_BOTS], disallow: "/" }] : []),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
