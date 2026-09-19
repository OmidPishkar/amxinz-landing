// Single source of truth for everything SEO-related.
// Set NEXT_PUBLIC_SITE_URL in Netlify to your real production URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.amxinz.com").replace(/\/+$/, "");

export const SITE = {
  name: "Amxinz",
  title: "Amxinz: Chart Prediction Game with Real Market Data",
  description:
    "Study real candlestick charts with the future hidden, call up or down, earn points and climb the global leaderboard. Free trading practice.",
  language: "en",
  locale: "en_US",
  keywords: [
    "chart prediction game",
    "candlestick chart practice",
    "trading practice game",
    "learn to read charts",
    "crypto chart quiz",
    "price prediction leaderboard",
  ],
  themeColor: "#ffffff",
  // Add real profile URLs when you have them, e.g. ["https://x.com/amxinz"].
  social: [] as string[],
  // Optional "@handle" used for Twitter/X cards.
  twitterHandle: undefined as string | undefined,
  // Replace with a real logo (min 112x112, PNG/SVG) when you have one.
  logoPath: "/apple-icon",
  // Bump this when the landing page content changes (used by the sitemap).
  landingUpdated: "2026-09-19",
  // Set true to ask AI training crawlers not to use the site (search bots stay allowed).
  blockAiTraining: false as boolean,
} as const;

export const OG_ALT = "Amxinz: predict real candlestick charts and climb the leaderboard";
