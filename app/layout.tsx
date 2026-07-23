import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Amxinz | DEX Trading Journal & Reputation Network",
    template: "%s | Amxinz",
  },
  description:
    "The first on-chain trading journal that turns your DEX trades into a verified professional reputation. Track, analyze, and compete with traders worldwide.",
  keywords: [
    // برند و پلتفرم
    "amxinz",
    "amxinz dex journal",
    "amxinz trading network",
    // صرافی‌ها
    "hyperliquid journal",
    "jupiter dex journal",
    "uniswap trade tracker",
    // مفاهیم اصلی
    "dex trading journal",
    "on-chain trade journal",
    "defi trading journal",
    "crypto trading journal",
    "blockchain trade tracker",
    "transparent trading journal",
    // تحلیل و عملکرد
    "trade performance analysis",
    "trading analytics",
    "win rate tracker",
    "pnl tracker",
    "profit factor analysis",
    // جامعه و رقابت
    "trader ranking",
    "trader leaderboard",
    "crypto trader community",
    "verified trader profile",
    "trading reputation",
    "proof of trading skill",
    // استخدام و سرمایه‌گذاری
    "find traders for prop firm",
    "hire crypto traders",
    "trader resume on chain",
    // فارسی
    "ژورنال معاملاتی",
    "ثبت معاملات غیرمتمرکز",
    "ردیاب سود و ضرر",
    "رتبه‌بندی تریدرها",
    "اثبات مهارت ترید",
  ],
  openGraph: {
    title: "Amxinz — Build Your Trading Reputation On-Chain",
    description:
      "Automatically sync your DEX trades, analyze performance with AI, and compete globally. The most transparent trading journal for DeFi traders.",
    url: "https://amxinz.com",
    siteName: "Amxinz",
    images: [
      {
        url: "https://amxinz.com/landing/banner.png", // می‌تونی یک تصویر اختصاصی OG بسازی
        width: 1200,
        height: 630,
        alt: "Amxinz DEX Trading Journal Dashboard",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amxinz — On-Chain Trading Journal",
    description:
      "Turn every trade into a reputation milestone. The most transparent DEX journal.",
    images: ["https://amxinz.com/landing/banner.png"],
    creator: "@amxinz",
    site: "@amxinz",
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://amxinz.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} dark h-full antialiased`}
    >
      <head>
        {/* JSON‑LD برای Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Amxinz",
              url: "https://amxinz.com",
              logo: "https://amxinz.com/logo.png",
              description:
                "Decentralized trading journal and reputation network for DEX traders.",
              foundingDate: "2026",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: "hello@amxinz.com",
              },
              sameAs: [
                "https://twitter.com/amxinz",
                // بقیه شبکه‌های اجتماعی در آینده
              ],
            }),
          }}
        />
      </head>
      <body className="bg-background min-h-full flex flex-col antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          containerStyle={{ zIndex: 9999999 }}
          toastOptions={{ className: 'z-[9999999]' }}
        />
      </body>
    </html>
  );
}