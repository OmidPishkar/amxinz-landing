import { MetadataRoute } from "next";

const BASE_URL = "https://amxinz.com";

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date("2026-07-26");

    return [
        {
            url: BASE_URL,
            lastModified,
            changeFrequency: "weekly",
            priority: 1.0,
        },

        {
            url: `${BASE_URL}/documents`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.95,
        },

        {
            url: `${BASE_URL}/documents/what-is-amxinz`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.95,
        },

        {
            url: `${BASE_URL}/documents/how-it-works`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.90,
        },

        {
            url: `${BASE_URL}/documents/whitepaper`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.80,
        },

        {
            url: `${BASE_URL}/faq`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.80,
        },

        {
            url: `${BASE_URL}/privacy`,
            lastModified,
            changeFrequency: "yearly",
            priority: 0.40,
        },

        {
            url: `${BASE_URL}/terms`,
            lastModified,
            changeFrequency: "yearly",
            priority: 0.30,
        },
    ];
}