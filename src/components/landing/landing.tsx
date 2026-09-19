import Link from "next/link";
import { ChevronDown, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";
import { AdFrame } from "@/components/ad-frame";
import { JsonLd } from "@/components/json-ld";
import { HeroChart } from "./hero-chart";
import { HAS_IFRAME_AD } from "@/lib/ads";
import { HORIZON, POINTS_CORRECT, VISIBLE_CANDLES } from "@/lib/game";
import { FAQ } from "@/config/faq";
import { landingSchema } from "@/lib/schema";

const STEPS = [
  {
    title: "Study the chart",
    body: `You get ${VISIBLE_CANDLES} real candles pulled from Binance. The asset, the date and the price level are hidden, so there is nothing to look up.`,
  },
  {
    title: "Make your call",
    body: `Decide whether the close ${HORIZON} candles from now will be higher or lower than the last candle you see.`,
  },
  {
    title: "Score and rank",
    body: `The hidden candles are revealed. A right call earns ${POINTS_CORRECT} points and a wrong call costs ${POINTS_CORRECT}. Your total decides your place on the leaderboard.`,
  },
];

export function Landing() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="pb-12 pt-14 sm:pt-24">
        <h1 className="max-w-2xl text-[38px] font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Read the chart. Call the next move.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] text-muted-foreground">
          Amxinz is a free chart prediction game. It shows you a real candlestick chart with the future hidden.
          Decide whether the market goes up or down, score points when you are right, and climb the leaderboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <LoginDialog>
            <Button size="lg">Log in to play</Button>
          </LoginDialog>
          <Button asChild variant="outline" size="lg">
            <Link href="/leaderboard">See the leaderboard</Link>
          </Button>
        </div>
      </section>

      <section aria-label="Sample round" className="pb-16">
        <div className="overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between border-b px-3 py-2 text-xs text-muted-foreground">
            <span>Sample round · 1h candles</span>
            <span>Asset and date hidden</span>
          </div>
          <div className="p-3 sm:p-4">
            <HeroChart />
          </div>
          <div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-muted-foreground">
              Higher or lower than the last candle, {HORIZON} candles from now?
            </p>
            <div className="flex gap-2">
              <LoginDialog>
                <Button variant="up" className="flex-1 sm:flex-none">
                  <TrendingUp /> Up
                </Button>
              </LoginDialog>
              <LoginDialog>
                <Button variant="down" className="flex-1 sm:flex-none">
                  <TrendingDown /> Down
                </Button>
              </LoginDialog>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-it-works" className="pb-16">
        <h2 id="how-it-works" className="text-lg font-semibold tracking-tight">
          How it works
        </h2>
        <ol className="mt-4 divide-y border-y">
          {STEPS.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[1.5rem_1fr] gap-x-3 py-4 sm:grid-cols-[1.5rem_14rem_1fr]">
              <span className="text-muted-foreground tabular-nums">{i + 1}</span>
              <h3 className="font-medium">{step.title}</h3>
              <p className="col-start-2 mt-1 max-w-xl text-muted-foreground sm:col-start-3 sm:mt-0">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq" className="pb-16">
        <h2 id="faq" className="text-lg font-semibold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="mt-4 divide-y border-y">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 max-w-2xl text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Static ad slot: in the server HTML so the network's verification bot can find it. */}
      {HAS_IFRAME_AD && (
        <section aria-label="Advertisement" className="pb-16">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Advertisement</p>
          <AdFrame loading="lazy" />
        </section>
      )}

      <JsonLd data={landingSchema()} />
    </div>
  );
}
