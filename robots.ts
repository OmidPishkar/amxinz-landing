import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',        // از ایندکس شدن APIها جلوگیری می‌کنه
                    '/dashboard/',   // صفحات خصوصی کاربران (اگر داری)
                    '/login',        // صفحه لاگین
                    '/signup',       // صفحه ثبت‌نام
                ],
            },
            {
                userAgent: 'GPTBot',  // جلوگیری از خزیدن ربات‌های AI (اختیاری)
                disallow: '/',
            },
        ],
        sitemap: 'https://amxinz.com/sitemap.xml',
    }
}