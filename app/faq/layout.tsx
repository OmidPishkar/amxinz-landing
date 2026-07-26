import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Amxinz FAQ | Frequently Asked Questions",
    description: "Find answers to common questions about Amxinz, on-chain validation, the Waitlist, and how the calcXP algorithm evaluates DEX traders.",
    keywords: [
        "Amxinz FAQ",
        "calcXP verification",
        "How Amxinz works",
        "On-chain reputation questions",
        "DeFi trading journal help"
    ],
    openGraph: {
        title: "Amxinz FAQ - On-Chain Reputation & Waitlist Questions",
        description: "Everything you need to know about the decentralized trading journal and trader validation.",
        type: "website",
        url: "https://amxinz.com",
    },
};


export default function FAQLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is Amxinz?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Amxinz is a decentralized trading journal and on-chain reputation layer built for DEX traders. It automatically tracks, analyzes, and validates trading performance directly from blockchain ledger data."
                }
            },
            {
                "@type": "Question",
                "name": "What is calcXP?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "calcXP is the proprietary mathematical engine developed by Amxinz. It parses historical smart contract interactions from a user's wallet to compute a trusted performance score, ensuring transparency and fighting fake trading results in DeFi."
                }
            },
            {
                "@type": "Question",
                "name": "How can I join the Amxinz Waitlist?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can secure your spot by visiting the official website at amxinz.com and submitting your active Web3 wallet address or email on the landing page form."
                }
            }
        ]
    };
    return <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
    </>;
}
