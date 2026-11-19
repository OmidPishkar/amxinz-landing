import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { SITE, SITE_URL } from "@/config/site";
import { siteSchema } from "@/lib/schema";
import { Analytics } from "@/components/analytics";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEntitlement } from "@/lib/subscriptions";
import { AdFrame } from "@/components/ad-frame";
import { HAS_IFRAME_AD } from "@/lib/ads";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: SITE.themeColor,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.title, template: "%s · Amxinz" },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "education",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const entitlement = session?.user?.id ? await getEntitlement(session.user.id) : null;
  const showSiteAds = HAS_IFRAME_AD && (!session?.user?.id || !entitlement?.isAdFree);
  return (
    <html lang={SITE.language} suppressHydrationWarning>
      <body className={`${inter.variable} flex min-h-screen flex-col font-sans`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-1.5"
        >
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          {showSiteAds && <div className="mx-auto w-full max-w-5xl px-4 pb-6" aria-label="Advertisement"><p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Advertisement</p><AdFrame loading="lazy" /></div>}
          <Footer />
        </ThemeProvider>
        <Analytics loggedIn={!!session?.user?.id} />
        <JsonLd data={siteSchema()} />
      </body>
    </html>
  );
}
