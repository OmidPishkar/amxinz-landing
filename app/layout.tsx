import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from "@/components/ThemeProvider";


export const metadata: Metadata = {
  title: "Amxinz | DEX Trading Journal & Community",

  description:
    "Track every DEX trade automatically. Build your trading journal, analyze performance, and connect with other traders.",

  keywords: [
    "DEX Trading",
    "Trading Journal",
    "Crypto Journal",
    "Web3 Trading",
    "DeFi",
    "Trader Community",
    "Crypto Analytics"
  ],

  openGraph: {
    title: "Amxinz",
    description:
      "The trading journal built for DEX traders.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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