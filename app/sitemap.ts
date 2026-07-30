// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://amxinz.com'

    // آدرس‌های استاتیک پلتفرم شما همراه با اولویت ایندکس (Priority)
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0, // بالاترین اولویت برای لندینگ پیج اصلی و لیست انتظار
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/documents/what-is-amxinz`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.9, // اولویت بالا برای معرفی ماهیت پروژه به هوش مصنوعی
        },
        {
            url: `${baseUrl}/documents`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9, // اولویت بالا به عنوان صفحه مرجع مستندات
        },
        {
            url: `${baseUrl}/documents/how-it-works`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/documents/whitepaper`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const, // فرکانس بالاتر چون ممکن است فرمول‌های ریاضی آپدیت شوند
            priority: 0.9,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const, // فرکانس بالاتر چون ممکن است فرمول‌های ریاضی آپدیت شوند
            priority: 0.9,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const, // فرکانس بالاتر چون ممکن است فرمول‌های ریاضی آپدیت شوند
            priority: 0.9,
        },
    ]

    return routes
}
