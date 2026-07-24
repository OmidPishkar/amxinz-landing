"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LogoProps {
    isCollapsed: boolean;
}

export default function Logo({ isCollapsed }: LogoProps) {
    return (
        <motion.div
            className={`flex items-center cursor-pointer select-none ${isCollapsed
                ? "justify-center"
                : "gap-3"
                }`}
            initial="rest"
            animate="rest"
            whileHover="hover"
        >
            {/* Logo Box */}
            <motion.div
                className="
        relative
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-background
        shadow-[0_0_40px_rgba(139,92,246,.12)]
    "
                variants={{
                    rest: {
                        scale: 1,
                        rotate: 0,
                    },
                    hover: {
                        scale: 1.06,
                        rotate: 4,
                    },
                }}
                transition={{
                    duration: 0.25,
                }}
            >
                {/* Purple Glow */}
                <div
                    className="
            absolute
            -top-2
            -left-2
            h-8
            w-8
            rounded-full
            bg-secondary/20
            blur-xl
        "
                />

                {/* Golden Glow */}
                <div
                    className="
            absolute
            -bottom-2
            -right-2
            h-8
            w-8
            rounded-full
            bg-primary/20
            blur-xl
        "
                />

                {/* Left Stroke */}
                <motion.div
                    className="
            absolute
            h-6
            w-[4px]
            rounded-full
            bg-primary
            shadow-[0_0_12px_rgba(255,184,77,.6)]
        "
                    variants={{
                        rest: {
                            rotate: -32,
                            x: -5,
                            y: -1,
                        },
                        hover: {
                            rotate: -24,
                            x: -5,
                            y: -1,
                        },
                    }}
                />

                {/* Right Stroke */}
                <motion.div
                    className="
            absolute
            h-6
            w-[4px]
            rounded-full
            bg-primary
            shadow-[0_0_12px_rgba(255,184,77,.6)]
        "
                    variants={{
                        rest: {
                            rotate: 32,
                            x: 5,
                            y: -1,
                        },
                        hover: {
                            rotate: 24,
                            x: 5,
                            y: -1,
                        },
                    }}
                />

                {/* Center Connector */}
                <motion.div
                    className="
            absolute
            h-[4px]
            w-4
            rounded-full
            bg-secondary
            shadow-[0_0_12px_rgba(168,85,247,.7)]
        "
                    style={{
                        translateY: 5,
                    }}
                    variants={{
                        rest: {
                            scaleX: 1,
                        },
                        hover: {
                            scaleX: 1.15,
                        },
                    }}
                />
            </motion.div>

            {/* Text */}
            <AnimatePresence mode="wait">
                {!isCollapsed && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            x: -10,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        exit={{
                            opacity: 0,
                            x: -10,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        className="
              flex
              flex-col
              overflow-hidden
              whitespace-nowrap
            "
                    >
                        <span
                            className="
                text-[18px]
                font-black
                leading-none
                tracking-tight
                text-foreground
              "
                        >
                            Amxinz
                        </span>

                        <span
                            className="
                mt-1
                text-[9px]
                font-bold
                uppercase
                tracking-[0.28em]
                text-muted-foreground
              "
                        >
                            DEX TRADER NETWORK
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}