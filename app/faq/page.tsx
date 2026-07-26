// app/faq/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    ChevronDown,
    HelpCircle,
    ArrowRight,
    Mail,
} from "lucide-react";

/* -------------------------------------------------- */
/*  data                                                */
/* -------------------------------------------------- */
const faqs = [
    {
        question: "What is Amxinz?",
        answer:
            "Amxinz is an on-chain trading journal and reputation network built for DEX traders. It automatically imports your trades from Hyperliquid, Jupiter, and Uniswap, analyses your performance, and helps you build a verifiable track record.",
    },
    {
        question: "Is Amxinz free to use?",
        answer:
            "Yes. The core platform (journal, daily scores, and public profile) will always be free. In the future, we may offer premium features for institutions via a B2B API.",
    },
    {
        question: "Which wallets are supported?",
        answer:
            "You can connect any Ethereum or Solana wallet (e.g. MetaMask, Phantom, Rabby). Amxinz only reads your public trade history — we never ask for private keys or seed phrases.",
    },
    {
        question: "How does the Daily Score work?",
        answer:
            "Your Daily Score (1‑5) is a context‑aware rating based on your own historical averages. It evaluates discipline, risk management, consistency, profitability, trade health, and XP earned — always compared to your personal baseline.",
    },
    {
        question: "Are my trades public?",
        answer:
            "You have full control. You can choose to make your journal public (to build reputation) or keep it private. Amxinz never shares your data without your consent.",
    },
    {
        question: "When will Amxinz launch?",
        answer:
            "We are currently in Waitlist mode. Sign up on the homepage to be notified as soon as we open public access. Early supporters receive a permanent badge.",
    },
    {
        question: "Can I delete my account?",
        answer:
            "Yes. You can request full account deletion at any time by contacting us at support@amxinz.com. We will remove all your data within 7 business days.",
    },
    {
        question: "Does Amxinz support CEX (centralised exchanges)?",
        answer:
            "Currently no. Amxinz is built for DEX traders (Hyperliquid, Jupiter, Uniswap). CEX integration may be considered in the future, but DEX remains our core focus.",
    },
];

/* -------------------------------------------------- */
/*  component                                           */
/* -------------------------------------------------- */
function FaqItem({
    question,
    answer,
    isOpen,
    onClick,
}: {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
        >
            <button
                onClick={onClick}
                className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/[0.05]"
            >
                <h2 className="pr-4 text-base font-semibold md:text-lg">
                    {question}
                </h2>
                <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-white/5 px-5 pb-5 pt-4">
                            <p className="leading-relaxed text-muted-foreground">{answer}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}

/* -------------------------------------------------- */
/*  main page                                          */
/* -------------------------------------------------- */
export default function FaqPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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
                className="pb-8 pt-4 px-4"
            >
                <div className="mb-6 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                    Help Center
                </div>

                <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                    Frequently Asked{" "}
                    <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                        Questions
                    </span>
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                    Everything you need to know about Amxinz — from wallet connection to
                    your Daily Score.
                </p>
            </motion.header>

            {/* ───── FAQ list ───── */}
            <section className="py-10 space-y-4 px-4" aria-label="FAQ list">
                {faqs.map((faq, index) => (
                    <FaqItem
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openIndex === index}
                        onClick={() => toggle(index)}
                    />
                ))}
            </section>

            {/* ───── Still need help? ───── */}
            <motion.aside
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-16 px-4 flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-12 text-center backdrop-blur-xl"
            >
                <HelpCircle className="h-10 w-10 text-primary" />
                <h2 className="text-2xl font-black">Still have questions?</h2>
                <p className="max-w-xl text-muted-foreground">
                    We are here to help. Reach out to our support team and we will get
                    back to you within 24 hours.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a
                        href="mailto:support@amxinz.com"
                        className="btn-secondary inline-flex items-center gap-2 px-6 py-3"
                    >
                        <Mail className="h-4 w-4" />
                        support@amxinz.com
                    </a>
                    <button
                        onClick={scrollToWaitlist}
                        className="btn-primary inline-flex items-center gap-2 px-6 py-3"
                    >
                        Join the Waitlist
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </motion.aside>

            {/* ───── Back to docs ───── */}
            <nav className="mt-12 text-center mx-4" aria-label="Back to documentation">
                <Link
                    href="/documents"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    ← Back to Documentation
                </Link>
            </nav>
        </>
    );
}