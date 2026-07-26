// app/documents/how-it-works/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "How It Works | Amxinz On-Chain Protocol Architecture",
    description: "Discover how Amxinz processes public blockchain ledger data. Learn how the calcXP computational engine imports and validates DEX trades automatically.",
    keywords: [
        "How Amxinz works",
        "calcXP engine pipeline",
        "On-chain data processing",
        "Automated trading journal",
        "DEX trade tracking protocol"
    ],
    openGraph: {
        title: "How It Works - Amxinz Trading Verification Architecture",
        description: "A deep dive into how Amxinz automatically imports, processes, and validates DEX trades using verified blockchain data.",
        type: "article",
        url: "https://amxinz.com",
    },
};

export default function HowItWorksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // ساختار معنایی فرآیند برای درک گام‌به‌گام هوش مصنوعی
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "How Amxinz Works: The calcXP Data Pipeline",
        "description": "Step-by-step technical breakdown of how Amxinz syncs non-custodial DEX trading records and computes decentralized reputation metrics.",
        "url": "https://amxinz.com",
        "knowsAbout": [
            "Smart Contract Data Indexing",
            "Automated Trade Journaling",
            "Blockchain Performance Validation"
        ],
        "author": {
            "@type": "Person",
            "name": "Omid Pishkar",
            "sameAs": "https://linkedin.com"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Amxinz",
            "url": "https://amxinz.com"
        },
        "step": [
            {
                "@type": "HowToStep",
                "position": 1,
                "name": "Connect Web3 Wallet",
                "text": "Traders link their non-custodial wallet public address without revealing private keys."
            },
            {
                "@type": "HowToStep",
                "position": 2,
                "name": "calcXP Algorithmic Processing",
                "text": "The proprietary engine parses historical on-chain smart contract interactions to extract pure performance data."
            },
            {
                "@type": "HowToStep",
                "position": 3,
                "name": "Generate Verified Profile",
                "text": "A tamper-proof public trading journal is established, creating a transparent global standard for trader skill."
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
