"use client";

import Link from "next/link";
import Logo from "../Logo";
import { motion } from "framer-motion";

export default function Navbar() {
    const scrollToWaitlist = () => {
        document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <motion.nav
            className="fixed inset-x-0 top-5 z-50 px-4 md:px-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <header className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-background/60 backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,.25)]">
                <div className="flex h-20 items-center justify-between px-5 md:px-8">
                    {/* LEFT — لوگو */}
                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Logo isCollapsed={false} />
                    </motion.div>

                    {/* CENTER — لینک‌های ناوبری (ساده‌شده) */}
                    <motion.ul
                        className="hidden lg:flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.05 } },
                        }}
                    >
                        {[
                            { href: "#features", label: "Features" },
                            { href: "#waitlist", label: "Join Waitlist" },
                        ].map(({ href, label }) => (
                            <motion.li
                                key={label}
                                variants={{
                                    hidden: { opacity: 0, y: -10 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                            >
                                <a
                                    href={href}
                                    className="block rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/[0.05] hover:text-foreground"
                                >
                                    {label}
                                </a>
                            </motion.li>
                        ))}
                    </motion.ul>

                    {/* RIGHT — Wait List CTA */}
                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Coming Soon Badge */}
                        <motion.aside
                            className="hidden xl:flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-400"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                            Early Access Soon
                        </motion.aside>

                        {/* دکمه اصلی */}
                        <motion.button
                            onClick={scrollToWaitlist}
                            className="rounded-xl px-5 py-2.5 text-sm font-medium text-black transition-all duration-300 shadow-[0_10px_30px_rgba(245,158,11,.25)]"
                            style={{ background: "linear-gradient(135deg,#FFB84D,#F59E0B)" }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Get Early Access
                        </motion.button>
                    </motion.div>
                </div>
            </header>
        </motion.nav>
    );
}