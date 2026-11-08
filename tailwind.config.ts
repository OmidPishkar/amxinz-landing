import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(10px)" } },
        "candle-grow": { from: { opacity: "0", transform: "scaleY(0)" } },
        "grow-x": { from: { transform: "scaleX(0)" } },
        "grow-y": { from: { transform: "scaleY(0)" } },
        "draw-ring": { from: { "stroke-dasharray": "0 var(--ring)" } },
        "soft-pulse": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.3" } },
        pop: { "0%": { transform: "scale(1)" }, "40%": { transform: "scale(1.12)" }, "100%": { transform: "scale(1)" } },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) backwards",
        "candle-grow": "candle-grow 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) backwards",
        "grow-x": "grow-x 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) backwards",
        "grow-y": "grow-y 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) backwards",
        "draw-ring": "draw-ring 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) backwards",
        "soft-pulse": "soft-pulse 1.6s ease-in-out infinite",
        pop: "pop 0.35s ease-out",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        up: "var(--up)",
        down: "var(--down)",
      },
    },
  },
  plugins: [animate, typography],
};
export default config;
