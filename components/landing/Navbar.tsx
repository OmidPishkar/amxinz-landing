"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "../Logo";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // بستن منوی موبایل وقتی کاربر صفحه را اسکرول می‌کند یا رزولوشن تغییر می‌کند
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scrollToWaitlist = () => {
        setMobileMenuOpen(false);
        const element = document.getElementById("waitlist");
        element?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToFeatures = () => {
        setMobileMenuOpen(false);
        const element = document.getElementById("features");
        element?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <motion.nav
            className="fixed inset-x-0 top-3 sm:top-5 z-50 px-3 sm:px-4 md:px-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <header
                className="mx-auto max-w-7xl rounded-2xl sm:rounded-3xl border border-white/10 bg-background/70 backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,.25)]"
            >
                <div className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-5 md:px-8">
                    {/* LEFT — لوگو */}
                    <motion.div
                        className="flex items-center gap-2 sm:gap-3 shrink-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Logo isCollapsed={false} />
                    </motion.div>

                    {/* CENTER — لینک‌های دسکتاپ */}
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
                            { label: "Features", action: scrollToFeatures },
                            { label: "Waitlist", action: scrollToWaitlist },
                        ].map(({ label, action }) => (
                            <motion.li
                                key={label}
                                variants={{
                                    hidden: { opacity: 0, y: -10 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                            >
                                <button
                                    onClick={action}
                                    className="block rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/[0.05] hover:text-foreground"
                                >
                                    {label}
                                </button>
                            </motion.li>
                        ))}
                    </motion.ul>

                    {/* RIGHT — دکمه‌ها و منوی موبایل */}
                    <motion.div
                        className="flex items-center gap-2 sm:gap-3"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Coming Soon Badge (مخفی در موبایل) */}
                        <motion.aside
                            className="hidden sm:flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-amber-400"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <span aria-hidden="true" className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="hidden sm:inline">Early Access Soon</span>
                        </motion.aside>

                        {/* دکمه CTA دسکتاپ */}
                        <motion.button
                            onClick={scrollToWaitlist}
                            className="hidden sm:flex items-center rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-black transition-all duration-300 shadow-[0_10px_30px_rgba(245,158,11,.25)]"
                            style={{ background: "linear-gradient(135deg,#FFB84D,#F59E0B)" }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Get Early Access
                        </motion.button>

                        {/* دکمه CTA موبایل (آیکون ساده) */}
                        <motion.button
                            onClick={scrollToWaitlist}
                            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-primary text-black shadow-[0_4px_12px_rgba(245,158,11,.4)]"
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="text-sm font-bold">✦</span>
                        </motion.button>

                        {/* دکمه منوی موبایل */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </motion.div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden overflow-hidden border-t border-white/10 bg-background/80 backdrop-blur-xl"
                        >
                            <div className="px-4 py-5 space-y-3">
                                <button
                                    onClick={scrollToFeatures}
                                    className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
                                >
                                    Features
                                </button>
                                <button
                                    onClick={scrollToWaitlist}
                                    className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
                                >
                                    Join Waitlist
                                </button>

                                <hr className="border-white/10" />

                                <div className="flex gap-4 px-4 py-2">
                                    <Link
                                        href="/privacy"
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Privacy
                                    </Link>
                                    <Link
                                        href="/terms"
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Terms
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </motion.nav>
    );
}