// app/documents/whitepaper/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight,
    Shield,
    BarChart3,
    TrendingUp,
    Star,
    Globe,
    Wallet,
    FileText,
} from "lucide-react";

/* -------------------------------------------------- */
/*  reusable helpers                                   */
/* -------------------------------------------------- */
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

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
/*  roadmap data                                       */
/* -------------------------------------------------- */
const roadmap = [
    {
        phase: "Phase 1",
        title: "Core Platform & Profile",
        items: [
            "Trade journal with automated import",
            "Public trader profile & performance cards",
            "Context‑Aware Daily Score (Rule‑Based AI)",
        ],
        status: "completed",
    },
    {
        phase: "Phase 2",
        title: "Leaderboard & Community",
        items: [
            "Global leaderboard with multi‑filters",
            "Trader ranking system (XP & Discipline)",
            "Waitlist launch & early adopter badges",
        ],
        status: "in‑progress",
    },
    {
        phase: "Phase 3",
        title: "B2B & Data API",
        items: [
            "Verified trader data API for prop firms",
            "Custom analytics reports for investors",
            "Monthly subscription plans for institutions",
        ],
        status: "upcoming",
    },
];

/* -------------------------------------------------- */
/*  main page                                          */
/* -------------------------------------------------- */
export default function WhitepaperPage() {
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
                className="pb-6 md:pb-8 pt-2 md:pt-4"
            >
                <div className="mb-5 md:mb-6 inline-flex items-center rounded-full border border-violet-400/20 bg-violet-400/10 px-3 md:px-4 py-1 md:py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                    Whitepaper v1.0
                </div>

                <h1 className="text-3xl md:text-6xl font-black tracking-tight">
                    Amxinz{" "}
                    <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                        Whitepaper
                    </span>
                </h1>

                <p className="mt-4 md:mt-5 max-w-3xl text-base md:text-lg leading-relaxed text-muted-foreground">
                    A technical overview of the first on‑chain trading journal and
                    reputation network built for professional DEX traders. This document
                    describes the core scoring algorithm, technology stack, and our
                    vision for the future of verifiable trading performance.
                </p>
            </motion.header>

            {/* ───── Mission ───── */}
            <motion.section
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="py-6 md:py-10"
            >
                <blockquote className="relative rounded-2xl md:rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-12">
                    <FileText className="absolute -top-3 left-4 md:left-6 h-8 w-8 md:h-10 md:w-10 rotate-180 text-primary/30" />
                    <p className="text-lg md:text-2xl font-semibold leading-relaxed">
                        Every disciplined trader deserves to be discovered — not by luck,
                        but by transparent, verifiable data. Amxinz replaces fake
                        screenshots with immutable on‑chain proof.
                    </p>
                    <footer className="mt-4 md:mt-6 text-sm text-muted-foreground">
                        — Amxinz Mission Statement
                    </footer>
                </blockquote>
            </motion.section>

            {/* ───── Core Innovation ───── */}
            <section className="py-6 md:py-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Core Innovation: Context‑Aware Scoring
                </h2>
                <p className="mt-3 md:mt-4 max-w-3xl text-base md:text-lg text-muted-foreground">
                    Unlike generic scoring systems, Amxinz compares today&apos;s
                    performance against your own historical averages — not a fixed
                    benchmark. This means every trader is measured by their own standards
                    of discipline.
                </p>

                <motion.div
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } },
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                >
                    {[
                        {
                            icon: <Shield className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />,
                            title: "Stop‑Loss Discipline",
                            desc: "Evaluates the presence and respect of stop losses. Decorative stops are penalised.",
                        },
                        {
                            icon: <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-amber-400" />,
                            title: "Personal Risk Management",
                            desc: "Compares risk per trade with your own historical average, not a global fixed number.",
                        },
                        {
                            icon: <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-sky-400" />,
                            title: "Routine Consistency",
                            desc: "Detects over‑trading or under‑trading compared to your typical daily volume.",
                        },
                        {
                            icon: <Star className="h-5 w-5 md:h-6 md:w-6 text-amber-400" />,
                            title: "Profitability vs History",
                            desc: "Measures win rate today against your lifetime win rate. Comeback rewards included.",
                        },
                        {
                            icon: <Globe className="h-5 w-5 md:h-6 md:w-6 text-violet-400" />,
                            title: "Trade Health Score",
                            desc: "Uses per‑trade health metrics (entry/exit timing, RRR) aggregated and normalised.",
                        },
                        {
                            icon: <Wallet className="h-5 w-5 md:h-6 md:w-6 text-rose-400" />,
                            title: "Reputation Earned",
                            desc: "Tracks XP gained today relative to your average daily XP — your proof of skill.",
                        },
                    ].map((item, idx) => (
                        <GlowCard key={idx}>
                            <figure className="mb-4 md:mb-5 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                {item.icon}
                            </figure>
                            <h3 className="mb-2 text-base md:text-lg font-bold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </GlowCard>
                    ))}
                </motion.div>
            </section>

            {/* ───── Technology Stack ───── */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="py-6 md:py-10"
            >
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Technology Stack
                </h2>
                <div className="mt-5 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {[
                        { name: "Next.js 15", desc: "React framework with Turbopack" },
                        { name: "MongoDB Atlas", desc: "Encrypted database" },
                        { name: "Framer Motion", desc: "Animations & interactions" },
                        { name: "Netlify", desc: "Global CDN & deployment" },
                    ].map((tech, idx) => (
                        <GlowCard key={idx}>
                            <h3 className="text-base md:text-lg font-bold">{tech.name}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1">{tech.desc}</p>
                        </GlowCard>
                    ))}
                </div>
            </motion.section>

            {/* ───── B2B Model ───── */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="py-6 md:py-10"
            >
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    B2B Data API
                </h2>
                <p className="mt-3 md:mt-4 max-w-3xl text-base md:text-lg text-muted-foreground">
                    Amxinz provides a verified data stream for institutions. Prop firms,
                    hedge funds, and copy‑trading platforms can access our API to
                    discover disciplined traders with transparent, on‑chain track records.
                </p>

                <div className="mt-5 md:mt-6 overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full border-collapse text-left text-sm md:text-base">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="py-3 px-4 font-semibold">Plan</th>
                                <th className="py-3 px-4 font-semibold">Price</th>
                                <th className="py-3 px-4 font-semibold">Features</th>
                            </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                            <tr className="border-b border-white/5">
                                <td className="py-3 px-4 font-medium text-foreground">
                                    Silver
                                </td>
                                <td className="py-3 px-4">$499/mo</td>
                                <td className="py-3 px-4">Basic API, top 100 traders</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3 px-4 font-medium text-foreground">
                                    Gold
                                </td>
                                <td className="py-3 px-4">$1,999/mo</td>
                                <td className="py-3 px-4">Advanced filters, AI search</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 font-medium text-foreground">
                                    Platinum
                                </td>
                                <td className="py-3 px-4">$4,999/mo</td>
                                <td className="py-3 px-4">Custom reports, full data feed</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </motion.section>

            {/* ───── Roadmap ───── */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="py-6 md:py-10"
            >
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Roadmap</h2>
                <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
                    {roadmap.map((phase, idx) => (
                        <motion.div
                            key={phase.phase}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -10 : 10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            className={`rounded-2xl border p-5 md:p-8 ${phase.status === "completed"
                                    ? "border-emerald-400/20 bg-emerald-500/5"
                                    : phase.status === "in‑progress"
                                        ? "border-amber-400/20 bg-amber-500/5"
                                        : "border-white/10 bg-white/[0.02]"
                                }`}
                        >
                            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-0">
                                <span
                                    className={`rounded-full px-2.5 md:px-3 py-0.5 md:py-1 text-xs font-semibold ${phase.status === "completed"
                                            ? "bg-emerald-400/10 text-emerald-400"
                                            : phase.status === "in‑progress"
                                                ? "bg-amber-400/10 text-amber-400"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {phase.phase}
                                </span>
                                <h3 className="text-lg md:text-xl font-bold">{phase.title}</h3>
                            </div>
                            <ul className="list-inside list-disc space-y-1.5 md:space-y-2 text-sm md:text-base text-muted-foreground">
                                {phase.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ───── CTA ───── */}
            <motion.aside
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-12 md:mt-20 flex flex-col items-center gap-5 md:gap-6 rounded-2xl md:rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 md:px-8 md:py-12 text-center backdrop-blur-xl"
            >
                <Star className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                <h2 className="text-xl md:text-2xl font-black">Want to be part of this?</h2>
                <p className="max-w-xl text-sm md:text-base text-muted-foreground">
                    Join the waitlist and be among the first traders to shape the future
                    of on‑chain reputation.
                </p>
                <button onClick={scrollToWaitlist} className="btn-primary w-full md:w-auto px-6 md:px-8 py-3 md:py-4">
                    Join the Waitlist
                    <ArrowRight className="ml-2 h-5 w-5" />
                </button>
            </motion.aside>
        </>
    );
}