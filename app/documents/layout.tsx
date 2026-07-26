// app/documents/layout.tsx
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import DocsSidebar from "@/components/docs/DocsSidebar";
import { Menu, X } from "lucide-react";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* هدر */}
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <Logo isCollapsed={false} />
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="hidden md:block text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            ← Back to Home
                        </Link>

                        {/* دکمه سایدبار در موبایل */}
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden p-2 -mr-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-7xl gap-0 md:gap-8 px-4 md:px-6 py-6 md:py-10">
                {/* سایدبار – دسکتاپ: همیشه نمایش، موبایل: overlay */}
                <aside className="hidden md:block">
                    <DocsSidebar onLinkClick={closeSidebar} />
                </aside>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={closeSidebar}
                        />
                        <div className="relative z-10 w-64 h-full overflow-y-auto bg-background border-r border-border/50 p-4 animate-in slide-in-from-left duration-200">
                            <DocsSidebar onLinkClick={closeSidebar} />
                        </div>
                    </div>
                )}

                {/* محتوای اصلی */}
                <main className="min-w-0 flex-1 prose prose-sm md:prose-base prose-invert prose-headings:font-bold prose-a:text-primary prose-p:text-muted-foreground prose-li:text-muted-foreground max-w-none">
                    {children}
                </main>
            </div>
        </div>
    );
}