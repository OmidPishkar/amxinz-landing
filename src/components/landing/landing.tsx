import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { Game } from "@/components/game/game";
import { Reveal } from "@/components/motion/reveal";
import { HeroCandles } from "./hero-candles";
import { HORIZON, POINTS_CORRECT, VISIBLE_CANDLES } from "@/lib/game";
import { FAQ } from "@/config/faq";
import { landingSchema } from "@/lib/schema";

const STEPS = [
  { title: "Practice with hidden futures", body: `Make decisions on historical market charts before the next ${HORIZON} candles are revealed.` },
  { title: "Build evidence about your skills", body: "Track repeated decisions across trend, structure, support and resistance, breakouts, reversals, momentum and risk." },
  { title: "Train what needs work", body: "Use Daily Mission, adaptive Personal Missions and Risk Lab to build a more consistent practice routine." },
];

export function Landing({ showAds = true }: { showAds?: boolean }) {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="pb-12 pt-14 sm:pt-24">
        <h1 className="max-w-2xl animate-fade-up text-[38px] font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Train your trading decisions. Prove your progress.
        </h1>
        <p style={{ animationDelay: "80ms" }} className="mt-4 max-w-xl animate-fade-up text-[15px] text-muted-foreground">
          Amxinz is a trading practice arena built around historical market scenarios. Practise reading price action, complete structured missions, review your decision-making and build a record of measurable progress.
        </p>
        <div style={{ animationDelay: "160ms" }} className="mt-6 flex animate-fade-up flex-wrap gap-2">
          <Button asChild size="lg">
            <a href="#play">Try a practice round</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/pricing">Explore plans</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/documents">How it works</Link>
          </Button>
        </div>
        <div className="mt-10">
          <HeroCandles />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">{[["Daily Mission","Five shared historical scenarios. Make each decision before the future is revealed."],["Skill Assessment","Measure trend, structure, levels, breakouts, reversals, momentum and risk evidence."],["Personal Missions","Train the weakest skill supported by your own practice data."],["Risk Lab","Choose Long or Short, define stop-loss and take-profit, then review the result."],["Weekly Reports","Compare recent practice and skill evidence over time."],["XP & Streaks","Build a consistent routine with progress that is separate from Game Score."]].map(([title,body]) => <div key={title} className="rounded-xl border bg-card p-4"><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{body}</p></div>)}</div>
        </div>
      </section>

      <section id="play" aria-label="Play a round" className="scroll-mt-16 pb-16">
        <Game guest showAds={showAds} initialStats={{ score: 0, played: 0, correct: 0 }} />
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
      <section aria-labelledby="product-tools" className="pb-16"><h2 id="product-tools" className="text-lg font-semibold tracking-tight">A complete practice loop</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[["Daily Mission","A shared daily challenge for consistent decision-making.","/daily-mission"],["Skill Assessment","Evidence-based ratings with visible sample counts and confidence.","/skills"],["Personal Missions","Adaptive practice for demonstrated weak areas.","/personal-missions"],["Risk Lab","Practice position direction and risk parameters on historical data.","/risk-lab"],["Weekly Reports","Review changes in practice volume and skill performance.","/reports/weekly"],["Plans","Compare Free, Essential, Pro and Elite access.","/pricing"]].map(([title,body,href])=><Link key={href} href={href} className="rounded-xl border p-4 transition-colors hover:bg-muted"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{body}</p><span className="mt-3 inline-block text-xs font-semibold text-violet-600">Explore →</span></Link>)}</div></section>
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

      <JsonLd data={landingSchema()} />
    </div>
  );
}
