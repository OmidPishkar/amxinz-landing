// components/docs/DocsSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    BookOpen,
    FileText,
    HelpCircle,
    ArrowRight,
    Star,
} from "lucide-react";

const navItems = [
    {
        href: "/documents/what-is-amxinz",
        label: "What is Amxinz?",
        icon: <BookOpen className="h-4 w-4" />,
    },
    {
        href: "/documents/how-it-works",
        label: "How It Works",
        icon: <ArrowRight className="h-4 w-4" />,
    },
    {
        href: "/documents/whitepaper",
        label: "Whitepaper",
        icon: <FileText className="h-4 w-4" />,
    },
    {
        href: "/faq",
        label: "FAQ",
        icon: <HelpCircle className="h-4 w-4" />,
    },
];

export default function DocsSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-full shrink-0 md:w-56">
            <nav
                aria-label="Documentation navigation"
                className="sticky top-28 space-y-1 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl md:block"
            >
                <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Documentation
                </p>

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                    ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                                    : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                                }`}
                        >
                            {item.icon}
                            {item.label}
                            {isActive && (
                                <motion.div
                                    layoutId="active-sidebar-indicator"
                                    className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                                />
                            )}
                        </Link>
                    );
                })}

                <hr className="my-4 border-white/10" />

                <Link
                    href="/#waitlist"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/10"
                >
                    <Star className="h-4 w-4" />
                    Join Waitlist
                </Link>
            </nav>
        </aside>
    );
}