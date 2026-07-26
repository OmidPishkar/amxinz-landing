// app/documents/what-is-amxinz/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "What is Amxinz? | On-Chain Trading Journal Documentation",
    description: "Learn how Amxinz builds the first non-custodial on-chain trading journal and reputation network exclusively for DEX traders using verified blockchain ledger data.",
    keywords: [
        "What is Amxinz",
        "Non-custodial trading journal",
        "DEX trade tracking",
        "On-chain performance analytics",
        "Web3 trader profile"
    ],
    openGraph: {
        title: "What is Amxinz? - On-Chain Reputation Network",
        description: "Discover how Amxinz turns every DEX trade into a verifiable proof of skill without spreadsheets or fake screenshots.",
        type: "article",
        url: "https://amxinz.com",
        images: [
            {
                url: "https://amxinz.com",
                width: 1200,
                height: 630,
                alt: "Amxinz platform overview",
            },
        ],
    },
};

export default function WhatIsAmxinzLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // ساختار اسکیما برای این بخش متنی (TechArticle) جهت درک بهتر هوش مصنوعی
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "What is Amxinz? On-Chain Trading Journal Overview",
        "description": "An introduction to the Amxinz platform, explaining its non-custodial architecture and how it solves fake trading reputation in DeFi.",
        "url": "https://amxinz.com",
        "image": "https://amxinz.com",
        "knowsAbout": [
            "DEX Trading Journals",
            "Blockchain Performance Verification",
            "Non-custodial Analytics"
        ],
        "author": {
            "@type": "Person",
            "name": "Omid Pishkar",
            "sameAs": "www.linkedin.com/in/omid-pishkar-jr"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Amxinz",
            "url": "https://amxinz.com"
        }
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
