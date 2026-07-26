// app/documents/how-it-works/page.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Wallet, BarChart3, Star, Share2 } from "lucide-react";

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
/*  steps data                                         */
/* -------------------------------------------------- */
const steps = [
    {
        step: "01",
        icon: <Wallet className="h-5 w-5 md:h-8 md:w-8 text-primary" />,
        title: "Connect Your Wallet",
        description:
            "Link your Hyperliquid, Jupiter, or Uniswap wallet in one click. No private keys or API secrets are ever stored.",
        image: "/documents/images/how-it-works-step1.png",
    },
    {
        step: "02",
        icon: <BarChart3 className="h-5 w-5 md:h-8 md:w-8 text-emerald-400" />,
        title: "Automatic Trade Import",
        description:
            "Your complete trading history is pulled directly from the blockchain and transformed into a clean, searchable journal.",
        image: "/documents/images/how-it-works-step2.png",
    },
    {
        step: "03",
        icon: <Star className="h-5 w-5 md:h-8 md:w-8 text-amber-400" />,
        title: "Receive Your Daily Score",
        description:
            "Every day you get a personal rating (1‑5) based on discipline, risk management, consistency, profitability, and more — always compared to your own history.",
        image: "/documents/images/how-it-works-step3.png",
    },
    {
        step: "04",
        icon: <Share2 className="h-5 w-5 md:h-8 md:w-8 text-violet-400" />,
        title: "Share Your Verified Profile",
        description:
            "A single link proves your track record to prop firms, investors, and the community. No more fake screenshots.",
        image: "/documents/images/how-it-works-step4.png",
    },
];

/* -------------------------------------------------- */
/*  main page                                          */
/* -------------------------------------------------- */
export default function HowItWorksPage() {
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
                    Step‑by‑Step Guide
                </div>

                <h1 className="text-3xl md:text-6xl font-black tracking-tight">
                    How{" "}
                    <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                        Amxinz
                    </span>{" "}
                    Works
                </h1>

                <p className="mt-4 md:mt-5 max-w-3xl text-base md:text-lg leading-relaxed text-muted-foreground">
                    From wallet connection to a verifiable reputation — four simple steps
                    that turn your on‑chain activity into a professional trading resume.
                </p>
            </motion.header>

            {/* ───── Steps ───── */}
            <section className="space-y-12 md:space-y-16 py-6 md:py-10">
                {steps.map((step, index) => (
                    <motion.article
                        key={step.step}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.55, delay: index * 0.1 }}
                        className="flex flex-col gap-6 md:gap-8"
                    >
                        {/* image block (first in mobile) */}
                        <div className="flex-1 w-full">
                            <motion.figure
                                initial={{ opacity: 0, scale: 0.96 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.55, delay: 0.2 }}
                                className="relative overflow-hidden rounded-2xl md:rounded-[32px] border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl"
                            >
                                <div className="relative aspect-video overflow-hidden rounded-xl md:rounded-[24px]">
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </motion.figure>
                        </div>

                        {/* text block (second in mobile) */}
                        <div className="flex-1 space-y-3 md:space-y-4">
                            <span className="inline-flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-primary/10 text-xl md:text-2xl font-black text-primary">
                                {step.step}
                            </span>
                            <div className="flex items-center gap-2 md:gap-3">
                                {step.icon}
                                <h2 className="text-xl md:text-3xl font-bold">
                                    {step.title}
                                </h2>
                            </div>
                            <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                                {step.description}
                            </p>
                        </div>
                    </motion.article>
                ))}
            </section>

            {/* ───── Quick tips ───── */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-10 md:mt-16 grid gap-4 md:gap-6 sm:grid-cols-2"
            >
                <GlowCard>
                    <h3 className="text-base md:text-xl font-bold">🔒 Privacy first</h3>
                    <p className="mt-2 text-sm md:text-base text-muted-foreground">
                        Amxinz never asks for private keys. All trade data is read directly
                        from public blockchain records.
                    </p>
                </GlowCard>
                <GlowCard>
                    <h3 className="text-base md:text-xl font-bold">⚡ Always up‑to‑date</h3>
                    <p className="mt-2 text-sm md:text-base text-muted-foreground">
                        Your journal syncs automatically. New trades appear within minutes,
                        even when you&apos;re offline.
                    </p>
                </GlowCard>
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
                <h2 className="text-xl md:text-2xl font-black">Ready to get started?</h2>
                <p className="max-w-xl text-sm md:text-base text-muted-foreground">
                    Join the waitlist today and be among the first traders to experience
                    the future of on‑chain journaling.
                </p>
                <button onClick={scrollToWaitlist} className="btn-primary w-full md:w-auto px-6 md:px-8 py-3 md:py-4">
                    Join the Waitlist
                    <ArrowRight className="ml-2 h-5 w-5" />
                </button>
            </motion.aside>
        </>
    );
}