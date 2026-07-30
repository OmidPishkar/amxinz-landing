import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: 'Amxinz — Verified DEX Trading Journal & Community',
  description: 'Every trade builds your reputation. Automatically verify your DEX trades across Jupiter & Hyperliquid, analyze performance with AI, and build a verified on-chain profile traders can trust.',
  alternates: {
    canonical: 'https://amxinz.com',
  },
  openGraph: {
    title: 'Amxinz — Verified DEX Trading Journal & Community',
    description: 'Every trade builds your reputation. Automatically verify your DEX trades across Jupiter & Hyperliquid, analyze performance with AI, and build a verified on-chain profile traders can trust.',
    url: 'https://amxinz.com',
    siteName: 'Amxinz',
    images: [
      {
        url: 'https://amxinz.com', // یک عکس گرافیکی جذاب از محیط پلتفرم یا لیدربورد در پوشه public قرار بده
        width: 1200,
        height: 630,
        alt: 'Amxinz - On-chain Reputation Layer for DEX Traders',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amxinz — Verified DEX Trading Journal & Community',
    description: 'Every trade builds your reputation. Automatically verify your DEX trades across Jupiter & Hyperliquid, analyze performance with AI, and build a verified on-chain profile traders can trust.',
    images: ['https://amxinz.com'],
    creator: '@amxinz',
    site: '@amxinz',
  },
  keywords: [
    'DEX Trading Journal',
    'On-chain Trading Portfolio',
    'Jupiter Journal',
    'Hyperliquid Trading Journal',
    'Verified Trading Performance',
    'Crypto Trading Network',
    'DeFi Trading Track',
    'Omid Pishkar',
  ],
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
    "sameAs": [
      "https://www.producthunt.com/products/amxinz" // لینک محصول دقیقاً به سازمان متصل شد
    ],
    "founders": [
      {
        "@type": "Person",
        "name": "Omid Pishkar",
        "jobTitle": "Founder & Developer",
        "sameAs": [
          "https://www.linkedin.com/in/omid-pishkar-jr"
        ]
      }
    ]
  };



  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}  // <-- "dark" removed
    >
      <body className="bg-background min-h-full flex flex-col antialiased ">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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