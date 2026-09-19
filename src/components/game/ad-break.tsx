"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdFrame } from "@/components/ad-frame";
import { HAS_IFRAME_AD } from "@/lib/ads";
import { HOUSE_ADS } from "@/lib/house-ads";
import { AD_SKIP_SECONDS } from "@/lib/game";

export function AdBreak({ onClose }: { onClose: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(AD_SKIP_SECONDS);
  const [houseAd] = useState(() => HOUSE_ADS[Math.floor(Math.random() * HOUSE_ADS.length)]);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Lock page scroll while the ad covers the screen.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-label="Advertisement" className="fixed inset-0 z-[60] flex flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Advertisement</span>
        <Button
          size="sm"
          variant={secondsLeft === 0 ? "default" : "outline"}
          disabled={secondsLeft > 0}
          onClick={onClose}
        >
          {secondsLeft > 0 ? `Continue in ${secondsLeft}s` : "Continue"}
        </Button>
      </div>

      <div className="grid flex-1 place-items-center overflow-auto p-4">
        {HAS_IFRAME_AD ? (
          <AdFrame />
        ) : (
          <div className="w-full max-w-md rounded-lg border p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Sponsored</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{houseAd.title}</h2>
            <p className="mt-2 text-muted-foreground">{houseAd.body}</p>
            <Button asChild className="mt-4">
              <a href={houseAd.href} target="_blank" rel="noopener noreferrer sponsored">
                {houseAd.cta} <ExternalLink />
              </a>
            </Button>
          </div>
        )}
      </div>

      <p className="shrink-0 border-t px-4 py-2 text-center text-xs text-muted-foreground">
        Ads keep Amxinz free to play.
      </p>
    </div>
  );
}
