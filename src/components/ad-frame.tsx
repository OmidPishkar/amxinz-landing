import { AD_IFRAME_HEIGHT, AD_IFRAME_URL, AD_IFRAME_WIDTH, HAS_IFRAME_AD } from "@/lib/ads";

// The network's ad unit. The unit id stays visible in the HTML (src + data-aa),
// which is what A-ADS's verification bot looks for.
export function AdFrame({ loading = "eager" }: { loading?: "eager" | "lazy" }) {
  if (!HAS_IFRAME_AD) return null;
  const unitId = AD_IFRAME_URL.match(/a-ads\.com\/(\d+)/)?.[1];

  return (
    <iframe
      data-aa={unitId}
      src={AD_IFRAME_URL}
      title="Advertisement"
      width={AD_IFRAME_WIDTH}
      height={AD_IFRAME_HEIGHT}
      loading={loading}
      scrolling="no"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      style={{ border: 0, padding: 0, overflow: "hidden", display: "block", maxWidth: "100%" }}
    />
  );
}
