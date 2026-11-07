import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
<<<<<<< HEAD
import typography from "@tailwindcss/typography";
=======
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
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
<<<<<<< HEAD
  plugins: [animate, typography],
=======
  plugins: [animate],
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
};
export default config;
