"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
    Shield,
    TrendingUp,
    Globe,
    Wallet,
    ArrowRight,
    Star,
    Quote,
} from "lucide-react";

/* -------------------------------------------------- */
/*  animation variants                                 */
/* -------------------------------------------------- */
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } },
};

/* -------------------------------------------------- */
/*  components                                         */
/* -------------------------------------------------- */
function Section({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
            className={`py-6 md:py-10 ${className}`}
        >
            {children}
        </motion.section>
    );
}

function GlowCard({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-8 backdrop-blur-xl transition-all duration-300 hover:border-primary/20 hover:shadow-[0_20px_60px_rgba(245,158,11,.08)]"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            {children}
        </motion.div>
    );
}

/* -------------------------------------------------- */
/*  main page                                          */
/* -------------------------------------------------- */
export default function WhatIsAmxinzPage() {
    const scrollToWaitlist = () => {
        document
            .getElementById("waitlist")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
            {/* ───── Hero ───── */}
            <motion.header
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="pb-6 md:pb-10 pt-2 md:pt-4"
            >
                <div className="mb-5 md:mb-6 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-3 md:px-4 py-1 md:py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                    Documentation
                </div>

                <h1 className="text-3xl md:text-6xl font-black tracking-tight">
                    What is{" "}
                    <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                        Amxinz
                    </span>
                    ?
                </h1>

                <p className="mt-4 md:mt-5 max-w-3xl text-base md:text-lg leading-relaxed text-muted-foreground">
                    Amxinz is the first{" "}
                    <strong className="text-foreground">
                        on‑chain trading journal &amp; reputation network
                    </strong>{" "}
                    built exclusively for DEX traders. We turn every trade into a
                    verifiable proof of skill — no spreadsheets, no fake screenshots,
                    no noise.
                </p>

                {/* hero image */}
                <motion.figure
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative mt-6 md:mt-10 overflow-hidden rounded-2xl md:rounded-[32px] border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl"
                >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl md:rounded-[24px]">
                        <Image
                            src="/documents/images/what-is-amxinz-hero.png"
                            alt="Amxinz platform overview"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </motion.figure>
            </motion.header>

            {/* ───── Problem ───── */}
            <Section>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    The problem with traditional journals
                </h2>
                <div className="mt-5 md:mt-6 grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
                    <GlowCard>
                        <Shield className="mb-3 md:mb-4 h-6 w-6 md:h-8 md:w-8 text-rose-400" />
                        <h3 className="text-lg md:text-xl font-bold">Easy to fake</h3>
                        <p className="mt-2 text-sm md:text-base text-muted-foreground">
                            Screenshots and spreadsheets can be edited in seconds. There is
                            no way to prove performance.
                        </p>
                    </GlowCard>
                    <GlowCard>
                        <TrendingUp className="mb-3 md:mb-4 h-6 w-6 md:h-8 md:w-8 text-amber-400" />
                        <h3 className="text-lg md:text-xl font-bold">Time consuming</h3>
                        <p className="mt-2 text-sm md:text-base text-muted-foreground">
                            Manually logging every entry, exit, and stop loss steals hours
                            from actual trading.
                        </p>
                    </GlowCard>
                    <GlowCard>
                        <Globe className="mb-3 md:mb-4 h-6 w-6 md:h-8 md:w-8 text-violet-400" />
                        <h3 className="text-lg md:text-xl font-bold">No global standard</h3>
                        <p className="mt-2 text-sm md:text-base text-muted-foreground">
                            Every trader uses a different format. There is no universal way
                            to showcase a track record.
                        </p>
                    </GlowCard>
                </div>
            </Section>

            {/* ───── Solution ───── */}
            <Section>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    How Amxinz fixes this
                </h2>
                <div className="mt-6 md:mt-8 grid items-center gap-8 md:gap-12 lg:grid-cols-2">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            {
                                step: "01",
                                title: "Connect your DEX wallet",
                                desc: "One click — Hyperliquid, Jupiter, or Uniswap. No private keys required.",
                            },
                            {
                                step: "02",
                                title: "Automatic trade import",
                                desc: "Your complete history is pulled from the blockchain and structured into a clean journal.",
                            },
                            {
                                step: "03",
                                title: "Get your Daily Score",
                                desc: "An AI‑powered rating (1‑5) analyses discipline, risk, and emotional patterns.",
                            },
                            {
                                step: "04",
                                title: "Share your verified profile",
                                desc: "A single link proves your skill to prop firms, investors, and the community.",
                            },
                        ].map((item, _i) => (
                            <motion.div
                                key={item.step}
                                variants={fadeUp}
                                className="mb-6 md:mb-8 flex gap-3 md:gap-4"
                            >
                                <span className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-primary/10 text-base md:text-lg font-black text-primary">
                                    {item.step}
                                </span>
                                <div>
                                    <h3 className="text-base md:text-lg font-semibold">{item.title}</h3>
                                    <p className="text-sm md:text-base text-muted-foreground">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.figure
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        className="relative overflow-hidden rounded-2xl md:rounded-[32px] border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl"
                    >
                        <div className="relative aspect-[4/5] overflow-hidden rounded-xl md:rounded-[24px]">
                            <Image
                                src="/documents/images/how-it-works-flow.png"
                                alt="How Amxinz works"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </motion.figure>
                </div>
            </Section>

            {/* ───── Mission ───── */}
            <Section>
                <blockquote className="relative rounded-2xl md:rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-12">
                    <Quote className="absolute -top-3 left-4 md:left-6 h-8 w-8 md:h-10 md:w-10 rotate-180 text-primary/30" />
                    <p className="text-lg md:text-2xl font-semibold leading-relaxed">
                        We believe every disciplined trader deserves to be discovered — not
                        by luck, but by transparent, verifiable data.
                    </p>
                    <footer className="mt-4 md:mt-6 text-sm text-muted-foreground">
                        — Amxinz Mission
                    </footer>
                </blockquote>
            </Section>

            {/* ───── Core Features ───── */}
            <Section>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Built for modern DEX traders
                </h2>
                <motion.ul
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mt-6 md:mt-8 grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                >
                    {[
                        {
                            icon: <Wallet className="h-5 w-5 md:h-6 md:w-6 text-primary" />,
                            title: "One‑click wallet connection",
                            desc: "No API keys, no sensitive permissions.",
                        },
                        {
                            icon: <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />,
                            title: "Daily Score (1‑5)",
                            desc: "Context‑aware rating based on your own history.",
                        },
                        {
                            icon: <Star className="h-5 w-5 md:h-6 md:w-6 text-amber-400" />,
                            title: "Performance Cards",
                            desc: "20+ metrics including Sharpe Ratio, Expectancy, and Max Drawdown.",
                        },
                        {
                            icon: <Shield className="h-5 w-5 md:h-6 md:w-6 text-violet-400" />,
                            title: "Verifiable reputation",
                            desc: "Share a link that proves your track record.",
                        },
                        {
                            icon: <Globe className="h-5 w-5 md:h-6 md:w-6 text-sky-400" />,
                            title: "Global Leaderboard",
                            desc: "Compete with traders worldwide based on discipline, not luck.",
                        },
                    ].map((feature, idx) => (
                        <motion.li key={idx} variants={fadeUp}>
                            <GlowCard>
                                <figure className="mb-4 md:mb-5 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                    {feature.icon}
                                </figure>
                                <h3 className="mb-2 text-base md:text-lg font-bold">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {feature.desc}
                                </p>
                            </GlowCard>
                        </motion.li>
                    ))}
                </motion.ul>
            </Section>

            {/* ───── CTA ───── */}
            <motion.aside
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-12 md:mt-16 flex flex-col items-center gap-5 md:gap-6 rounded-2xl md:rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 md:px-8 md:py-12 text-center backdrop-blur-xl"
            >
                <Star className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                <h2 className="text-xl md:text-2xl font-black">Ready to build your reputation?</h2>
                <p className="max-w-xl text-sm md:text-base text-muted-foreground">
                    Join the waitlist today and be among the first traders to claim your
                    verified profile.
                </p>
                <button onClick={scrollToWaitlist} className="btn-primary w-full md:w-auto px-6 md:px-8 py-3 md:py-4">
                    Join the Waitlist
                    <ArrowRight className="ml-2 h-5 w-5" />
                </button>
            </motion.aside>
        </>
    );
}