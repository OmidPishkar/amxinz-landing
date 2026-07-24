import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/journal/",
                    "/login",
                    "/signup",
                    "/profile",
                ],
            },
            {
                userAgent: "GPTBot",
                disallow: "/",
            },
        ],
        sitemap: "https://amxinz.com/sitemap.xml",
    };
}