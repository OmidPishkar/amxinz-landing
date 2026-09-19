// Which ad source fills the full-screen break. Set in .env.local:
//   NEXT_PUBLIC_AD_PROVIDER = "house" | "iframe" | "none"
//   - house  : your own sponsor creatives from src/lib/house-ads.ts (default)
//   - iframe : a network ad unit embedded by URL (e.g. an A-ADS unit)
//   - none   : ads disabled
export type AdProvider = "house" | "iframe" | "none";

const PROVIDERS: AdProvider[] = ["house", "iframe", "none"];
const rawProvider = process.env.NEXT_PUBLIC_AD_PROVIDER as AdProvider | undefined;
export const AD_PROVIDER: AdProvider = rawProvider && PROVIDERS.includes(rawProvider) ? rawProvider : "house";

// Ad networks often hand out protocol-relative URLs ("//host/path"). Browsers block
// plain http inside an https page, so only https is accepted.
function normalizeUrl(raw: string | undefined) {
  const value = (raw ?? "").trim();
  if (value.startsWith("//")) return `https:${value}`;
  return value.startsWith("https://") ? value : "";
}

export const AD_IFRAME_URL = normalizeUrl(process.env.NEXT_PUBLIC_AD_IFRAME_URL);
export const AD_IFRAME_WIDTH = Number(process.env.NEXT_PUBLIC_AD_IFRAME_WIDTH) || 300;
export const AD_IFRAME_HEIGHT = Number(process.env.NEXT_PUBLIC_AD_IFRAME_HEIGHT) || 250;

// True when a network ad unit is configured and usable.
export const HAS_IFRAME_AD = AD_PROVIDER === "iframe" && AD_IFRAME_URL !== "";
