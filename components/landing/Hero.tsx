"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import "@fontsource/plus-jakarta-sans";
import "@fontsource/plus-jakarta-sans/800.css";
import "@fontsource/plus-jakarta-sans/800-italic.css";

const Hero = () => {
    const scrollToWaitlist = () => {
        document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToFeatures = () => {
        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <motion.section
            className="relative flex min-h-screen items-center overflow-hidden px-6 pt-40 pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <div className="absolute left-[10%] top-[15%] h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[150px]" />
                <div className="absolute right-[5%] top-[20%] h-[400px] w-[400px] rounded-full bg-primary/20 blur-[120px]" />
            </div>

            <div className="mx-auto w-full max-w-7xl">
                <div className="grid items-center gap-20 lg:grid-cols-2">
                    {/* ستون چپ — محتوای اصلی */}
                    <motion.header
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-8 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-xs md:text-sm font-medium text-secondary"
                        >
                            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            Your trading history deserves more than screenshots.
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="plus-font text-5xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-[88px]"
                        >
                            <span className="block">Every Trade</span>
                            <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                                Builds Your
                            </span>
                            <span className="block">Reputation</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8 max-w-xl text-base md:text-xl leading-relaxed text-muted-foreground"
                        >
                            Automatically verify your DEX trades,
                            analyze performance with AI,
                            and build a reputation traders can trust.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.nav
                            aria-label="Call to action"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-10 flex flex-wrap gap-4"
                        >
                            <motion.button
                                onClick={scrollToWaitlist}
                                className="rounded-2xl px-7 py-4 font-semibold text-black shadow-[0_10px_40px_rgba(245,158,11,.25)] transition-all"
                                style={{ background: "linear-gradient(135deg,#FFB84D,#F59E0B)" }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Join the Waitlist
                            </motion.button>

                            <motion.button
                                onClick={scrollToFeatures}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-4 font-medium backdrop-blur-xl transition-all hover:bg-white/[0.05]"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Learn More
                            </motion.button>
                        </motion.nav>

                        <motion.ul
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-8 max-w-xl"
                        >
                            <li>
                                <strong className="text-sm font-black tracking-wider text-primary">VERIFIED</strong>
                                <p className="mt-1 text-sm text-muted-foreground">On-Chain Trades</p>
                            </li>
                            <li>
                                <strong className="text-sm font-black tracking-wider text-secondary">AI REVIEW</strong>
                                <p className="mt-1 text-sm text-muted-foreground">Performance Analysis</p>
                            </li>
                            <li>
                                <strong className="text-sm font-black tracking-wider text-green-400">REPUTATION</strong>
                                <p className="mt-1 text-sm text-muted-foreground">Community Driven</p>
                            </li>
                        </motion.ul>
                    </motion.header>

                    {/* ستون راست — تصویر و المان‌های شناور */}
                    <motion.aside
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        {/* کامنت شناور */}
                        <motion.figure
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.4 }}
                            className="absolute -top-5 left-10 z-20 hidden rounded-2xl border border-white/10 bg-background/80 px-4 py-3 backdrop-blur-xl lg:block"
                            aria-hidden="true"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-secondary/20" />
                                <div>
                                    <p className="text-xs font-semibold">Alex</p>
                                    <p className="text-xs text-muted-foreground">Clean breakout setup 🔥</p>
                                </div>
                            </div>
                        </motion.figure>

                        {/* حباب سود شناور */}
                        <motion.figure
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 0.4 }}
                            className="absolute bottom-8 -left-8 z-20 hidden rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4 backdrop-blur-xl lg:block"
                            aria-hidden="true"
                        >
                            <p className="text-xs text-primary">TAKE PROFIT HIT</p>
                            <p className="mt-1 text-2xl font-black text-primary">+18.4%</p>
                        </motion.figure>

                        {/* تصویر اصلی داشبورد */}
                        <motion.figure
                            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-3 backdrop-blur-2xl shadow-[0_0_100px_rgba(139,92,246,.15)]"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.6 }}
                        >
                            <Image
                                src="/landing/banner.png"
                                alt="AMXINZ Trading Journal Dashboard"
                                width={1200}
                                height={1200}
                                className="w-full rounded-[24px]"
                                priority
                            />
                        </motion.figure>
                    </motion.aside>
                </div>
            </div>
        </motion.section>
    );
};

export default Hero;