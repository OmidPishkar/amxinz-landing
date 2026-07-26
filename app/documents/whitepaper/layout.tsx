// app/documents/whitepaper/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Amxinz Whitepaper | calcXP Mathematical Framework",
    description: "Deep dive into the calcXP algorithm, mathematical validation formulas, and on-chain reputation architecture for DEX traders.",
    keywords: [
        "calcXP formula",
        "On-Chain Reputation Algorithm",
        "DEX Trading Mathematics",
        "Amxinz Whitepaper"
    ],
    openGraph: {
        title: "Amxinz Technical Whitepaper & calcXP Specification",
        description: "The mathematical and technical framework driving decentralized trader reputation.",
        type: "article",
        url: "https://amxinz.com",
    },
};

export default function WhitepaperLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Amxinz Whitepaper: The calcXP Mathematical Framework",
        "description": "Technical specification of the calcXP scoring algorithm used to validate on-chain trading history and establish decentralized reputation.",
        "inLanguage": "en",
        "url": "https://amxinz.com",
        "conceptuid": "calcXP",
        "knowsAbout": [
            "DeFi Analytics",
            "Algorithmic Trading Validation",
            "On-Chain Data Scoring",
            "Risk Management Mathematics"
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
        "dependencies": "On-chain blockchain historical ledger data"
    };
    return <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
    </>;
}
