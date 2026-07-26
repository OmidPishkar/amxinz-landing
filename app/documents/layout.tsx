// app/documents/layout.tsx

import { Metadata } from "next";
import DocsLayoutClient from "@/components/docs/DocsLayoutClient";

export const metadata: Metadata = {
    title: {
        default:
            "Amxinz Documentation | On-Chain Trading Journal & DEX Reputation Network",
        template: "%s | Amxinz Documentation",
    },

    description:
        "Explore the official Amxinz documentation. Learn how Amxinz automatically tracks DEX trades, analyzes trading performance with AI, generates Daily Scores, and helps traders build a verifiable on-chain reputation.",


    keywords: [
        "Amxinz",
        "Amxinz documentation",
        "on-chain trading journal",
        "DEX trading journal",
        "crypto trading journal",
        "DEX trader reputation",
        "blockchain trading analytics",
        "AI trading analysis",
        "verified trading performance",
        "Hyperliquid trading journal",
        "Jupiter trading journal",
        "Uniswap trade tracker",
        "DeFi trading tools",
    ],


    authors: [
        {
            name: "Amxinz Team",
            url: "https://amxinz.com",
        },
    ],


    creator: "Amxinz",


    publisher: "Amxinz",


    openGraph: {
        title:
            "Amxinz Documentation | Build Your On-Chain Trading Reputation",

        description:
            "Official guides explaining how Amxinz transforms DEX trading activity into verified journals, AI insights, and transparent trader profiles.",

        url: "https://amxinz.com/documents",

        siteName: "Amxinz",

        images: [
            {
                url:
                    "https://amxinz.com/documents/images/what-is-amxinz-hero.png",

                width: 1200,
                height: 630,

                alt:
                    "Amxinz Documentation - On-Chain Trading Journal",
            },
        ],

        locale: "en_US",

        type: "website",
    },


    twitter: {
        card: "summary_large_image",

        title:
            "Amxinz Documentation | On-Chain Trading Journal",

        description:
            "Learn how Amxinz tracks DEX trades, generates AI-powered trading insights, and builds verifiable trader reputation.",

        images: [
            "https://amxinz.com/documents/images/what-is-amxinz-hero.png",
        ],

        creator: "@amxinz",
    },


    robots: {
        index: true,
        follow: true,

        googleBot: {
            index: true,
            follow: true,

            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },


    alternates: {
        canonical:
            "https://amxinz.com/documents",
    },


    category:
        "DeFi, Cryptocurrency, Trading Technology",
};


export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DocsLayoutClient>{children}</DocsLayoutClient>;
}