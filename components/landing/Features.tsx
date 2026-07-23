'use client';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    BookOpen,
    Trophy,
    Wallet,
    Sparkles,
    User
} from "lucide-react";

const features = [
    {
        icon: <Wallet className="h-6 w-6 text-primary" />,
        title: "One-Click Wallet Connection",
        description:
            "Connect your trading wallet and start tracking DEX activity in seconds. No manual logging, no spreadsheets."
    },
    {
        icon: <BookOpen className="h-6 w-6 text-primary" />,
        title: "Automatic Trading Journal",
        description:
            "Trades are imported directly from the blockchain. Every entry, exit, and PnL is recorded and verified on-chain."
    },
    {
        icon: <ShieldCheck className="h-6 w-6 text-primary" />,
        title: "Verifiable Trade History",
        description:
            "Every trade is backed by immutable blockchain data. Your track record becomes your strongest asset — impossible to fake."
    },
    {
        icon: <Sparkles className="h-6 w-6 text-primary" />,
        title: "AI-Powered Daily Score",
        description:
            "Receive a daily rating (1–5) based on your discipline, risk management, and emotional patterns. No chat, just actionable insights."
    },
    {
        icon: <Trophy className="h-6 w-6 text-primary" />,
        title: "Trader Leaderboard",
        description:
            "Earn XP through disciplined trading and climb the global ranking. Show the world what consistent performance looks like."
    },
    {
        icon: <User className="h-6 w-6 text-primary" />,
        title: "Public Trading Profile",
        description:
            "Share your verified performance metrics with a single link. Build the reputation you need for prop firms and investors."
    }
];

const Features = () => {
    const scrollToWaitlist = () => {
        document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <motion.section
            id="features"
            className="relative py-32 overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            {/* Background Glow */}
            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <div className="absolute left-0 top-20 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[140px]" />
                <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[140px]" />
            </div>

            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto mb-20 max-w-3xl text-center"
                >
                    <div className="mb-4 inline-flex items-center rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary">
                        Why Traders Choose Amxinz
                    </div>

                    <h2 className="text-4xl font-black tracking-tight md:text-6xl">
                        Everything Needed To
                        <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                            Build Trading Reputation
                        </span>
                    </h2>

                    <p className="mt-6 text-lg text-muted-foreground">
                        Automatic journaling, blockchain transparency,
                        AI-powered daily scores, and global rankings —
                        all in one ecosystem.
                    </p>
                </motion.header>

                {/* Features Grid */}
                <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" role="list">
                    {features.map((feature, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_20px_60px_rgba(245,158,11,.08)]"
                        >
                            {/* Hover Glow */}
                            <div aria-hidden="true" className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
                                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/10 blur-3xl" />
                            </div>

                            <div className="relative z-10">
                                <figure className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                    {feature.icon}
                                </figure>

                                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                                <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                            </div>
                        </motion.li>
                    ))}
                </ul>

                {/* Bottom CTA */}
                <motion.aside
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mt-20 flex justify-center"
                    aria-label="Call to action"
                >
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-6 backdrop-blur-xl text-center max-w-lg">
                        <p className="text-2xl font-black">
                            Ready to build your reputation?
                        </p>
                        <p className="mt-2 text-muted-foreground">
                            Be among the first traders to claim your verified profile. Early supporters get a permanent badge.
                        </p>
                        <motion.button
                            onClick={scrollToWaitlist}
                            className="mt-6 rounded-xl px-6 py-3 font-semibold text-black shadow-[0_10px_30px_rgba(245,158,11,.25)]"
                            style={{ background: "linear-gradient(135deg,#FFB84D,#F59E0B)" }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Join the Waitlist
                        </motion.button>
                    </div>
                </motion.aside>
            </div>
        </motion.section>
    );
};

export default Features;