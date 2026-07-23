"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export default function AnimatedBackground() {


    const { resolvedTheme } = useTheme();

    const isDark = resolvedTheme === "dark";

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">

            {/* Base Background */}

            <div
                className="
            absolute inset-0
            bg-background
        "
            />

            {/* Main Glow */}

            <motion.div
                className="
            absolute
            left-[10%]
            top-[10%]
            h-[500px]
            w-[500px]
            rounded-full
            blur-[140px]
        "
                style={{
                    background: isDark
                        ? "rgba(255,184,77,.12)"
                        : "rgba(245,158,11,.08)"
                }}
                animate={{
                    x: [0, 80, -40, 0],
                    y: [0, -60, 60, 0]
                }}
                transition={{
                    duration: 24,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Purple Glow */}

            <motion.div
                className="
            absolute
            right-[5%]
            top-[15%]
            h-[600px]
            w-[600px]
            rounded-full
            blur-[180px]
        "
                style={{
                    background: isDark
                        ? "rgba(139,92,246,.12)"
                        : "rgba(139,92,246,.08)"
                }}
                animate={{
                    x: [0, -80, 40, 0],
                    y: [0, 80, -80, 0]
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Bottom Orb */}

            <motion.div
                className="
            absolute
            bottom-[-200px]
            left-1/2
            h-[700px]
            w-[700px]
            -translate-x-1/2
            rounded-full
            blur-[220px]
        "
                style={{
                    background: isDark
                        ? "rgba(255,184,77,.08)"
                        : "rgba(255,184,77,.05)"
                }}
                animate={{
                    scale: [1, 1.15, 1]
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Grid */}

            <div
                className="
            absolute inset-0
            opacity-[0.04]
            dark:opacity-[0.06]
        "
                style={{
                    backgroundImage: `
                    linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
                `,
                    backgroundSize: "80px 80px"
                }}
            />

            {/* Radial Overlay */}

            <div
                className="
            absolute inset-0
        "
                style={{
                    background:
                        "radial-gradient(circle at center, transparent 0%, transparent 55%, rgba(0,0,0,.05) 100%)"
                }}
            />

        </div>
    );

}
