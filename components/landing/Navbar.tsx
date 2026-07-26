"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "../Logo";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, BookOpen, FileText, HelpCircle } from "lucide-react";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const resourcesRef = useRef<HTMLLIElement>(null);

    // بستن دراپ‌داون Resources با کلیک بیرون
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
                setResourcesOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // بستن منوی موبایل با تغییر سایز
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

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <motion.nav
            className="fixed inset-x-0 top-3 sm:top-5 z-50 px-3 sm:px-4 md:px-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <header className="mx-auto max-w-7xl rounded-2xl sm:rounded-3xl border border-white/10 bg-background/70 backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,.25)]">
                <div className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-5 md:px-8">
                    {/* LEFT — لوگو */}
                    <motion.div
                        className="flex items-center gap-2 sm:gap-3 shrink-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link href="/" aria-label="Amxinz Home">
                            <Logo isCollapsed={false} />
                        </Link>
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
                        <motion.li
                            variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}
                        >
                            <button
                                onClick={scrollToFeatures}
                                className="block rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/[0.05] hover:text-foreground"
                            >
                                Features
                            </button>
                        </motion.li>

                        {/* Resources Dropdown */}
                        <motion.li
                            className="relative"
                            ref={resourcesRef}
                            variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}
                        >
                            <button
                                onClick={() => setResourcesOpen(!resourcesOpen)}
                                className="flex items-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/[0.05] hover:text-foreground"
                            >
                                Resources
                                <ChevronDown className={`h-4 w-4 transition-transform ${resourcesOpen ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {resourcesOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-white/10 bg-card/90 backdrop-blur-xl p-1 shadow-2xl"
                                    >
                                        <Link
                                            href="/documents/what-is-amxinz"
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                                        >
                                            <BookOpen className="h-4 w-4 text-primary" />
                                            What is Amxinz
                                        </Link>
                                        <Link
                                            href="/documents/how-it-works"
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                                        >
                                            <FileText className="h-4 w-4 text-primary" />
                                            How It Works
                                        </Link>
                                        <Link
                                            href="/faq"
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                                        >
                                            <HelpCircle className="h-4 w-4 text-primary" />
                                            FAQ
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.li>
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
                            <div className="px-4 py-5 space-y-4">
                                {/* Product Section */}
                                <div>
                                    <p className="px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Product</p>
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
                                </div>

                                {/* Learn Section */}
                                <div>
                                    <p className="px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Learn</p>
                                    <Link
                                        href="/documents/what-is-amxinz"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        What is Amxinz
                                    </Link>
                                    <Link
                                        href="/documents/how-it-works"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        <FileText className="h-4 w-4 text-primary" />
                                        How It Works
                                    </Link>
                                    <Link
                                        href="/faq"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        <HelpCircle className="h-4 w-4 text-primary" />
                                        FAQ
                                    </Link>
                                </div>

                                <hr className="border-white/10" />

                                {/* Legal Links */}
                                <div className="flex gap-4 px-4 py-2">
                                    <Link
                                        href="/privacy"
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        Privacy
                                    </Link>
                                    <Link
                                        href="/terms"
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={closeMobileMenu}
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