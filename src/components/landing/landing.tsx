import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdFrame } from "@/components/ad-frame";
import { JsonLd } from "@/components/json-ld";
import { Game } from "@/components/game/game";
import { Reveal } from "@/components/motion/reveal";
import { HeroCandles } from "./hero-candles";
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
        <h1 className="max-w-2xl animate-fade-up text-[38px] font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Read the chart. Call the next move.
        </h1>
        <p style={{ animationDelay: "80ms" }} className="mt-4 max-w-xl animate-fade-up text-[15px] text-muted-foreground">
          Amxinz is a free chart prediction game. It shows you a real candlestick chart with the future hidden.
          Decide whether the market goes up or down, score points when you are right, and climb the leaderboard.
        </p>
        <div style={{ animationDelay: "160ms" }} className="mt-6 flex animate-fade-up flex-wrap gap-2">
          <Button asChild size="lg">
            <a href="#play">Play now, no account needed</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/challenges">Challenges</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/leaderboard">Leaderboard</Link>
          </Button>
        </div>
        <div className="mt-10">
          <HeroCandles />
        </div>
      </section>

      <section id="play" aria-label="Play a round" className="scroll-mt-16 pb-16">
        <Game guest initialStats={{ score: 0, played: 0, correct: 0 }} />
      </section>

      <Reveal>
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

      </Reveal>

      <Reveal>
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
      </Reveal>

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
