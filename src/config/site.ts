// Single source of truth for everything SEO-related.
// Set NEXT_PUBLIC_SITE_URL in Netlify to your real production URL.
const configuredSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://amxinz.com").trim();
export const SITE_URL = configuredSiteUrl.replace(/^https:\/\/www\./i, "https://").replace(/\/+$/, "");

export const SITE = {
  name: "Amxinz",
  title: "Amxinz — Trading Practice Arena",
  description:
    "Build trading skill through historical chart practice, daily missions, risk exercises and evidence-led performance review.",
  language: "en",
  locale: "en_US",
  keywords: [
    "trading practice",
    "historical chart replay",
    "daily trading mission",
    "trading skill assessment",
    "candlestick chart practice",
    "trading decision training",
  ],
  themeColor: "#ffffff",
  // Add real profile URLs when you have them, e.g. ["https://x.com/amxinz"].
  social: [] as string[],
  // Optional "@handle" used for Twitter/X cards.
  twitterHandle: undefined as string | undefined,
  // Replace with a real logo (min 112x112, PNG/SVG) when you have one.
  logoPath: "/apple-icon",
  // Bump this when the landing page content changes (used by the sitemap).
  landingUpdated: "2026-11-20",
  // Set true to ask AI training crawlers not to use the site (search bots stay allowed).
  blockAiTraining: false as boolean,
} as const;

export const OG_ALT = "Amxinz: structured trading practice and skill development";
