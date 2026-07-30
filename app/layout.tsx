import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from "@/components/ThemeProvider";


export const metadata: Metadata = {
  title: "Amxinz | DEX Trading Journal & On-Chain Reputation Layer",

  description:
    "Track every DEX trade automatically. Build your trading journal, validate on-chain performance with calcXP, and connect with verified traders.",

  keywords: [
    "DEX Trading Journal",
    "On-Chain Reputation",
    "Trader Validation",
    "Crypto Analytics",
    "Web3 Trading Portfolio",
    "DeFi Analytics",
    "calcXP"
  ],

  icons: {
    icon: '/favicon.ico', // یا '/logo.png'
    shortcut: '/logo.png',
    apple: '/apple-touch-icon.png',
  },

  openGraph: {
    title: "Amxinz | On-Chain Trading Journal",
    description: "The decentralized trading journal built for DEX traders to validate their performance.",
    type: "website",
    url: "https://amxinz.com",
    siteName: "Amxinz",
    images: [
      {
        url: "https://amxinz.com", // یک تصویر جذاب برای پیش‌نمایش لینک اینجا قرار بده
        width: 1200,
        height: 630,
        alt: "Amxinz - On-Chain Trading Journal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Amxinz | DEX Trading Journal",
    description: "Track every DEX trade automatically and build your on-chain reputation.",
    creator: "@OJR17", // آیدی توییتر خودت یا پروژه
    images: ["https://amxinz.com"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Amxinz",
    "url": "https://amxinz.com",
    "logo": "https://amxinz.com/favicon.ico",
    "description": "A decentralized trading journal and on-chain reputation layer built for DEX traders.",
    "foundingDate": "2024",
    "sameAs": [],
    "founder": {
      "@type": "Person",
      "name": "Omid Pishkar",
      "jobTitle": "Founder & Developer",
      "sameAs": [
        "https://www.linkedin.com/in/omid-pishkar-jr"
      ]
    }
  };


  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}  // <-- "dark" removed
    >
      <body className="bg-background min-h-full flex flex-col antialiased ">

        {/* <AnimatedBackground /> */}
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