'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/pagination';

const slides = [
    {
        id: 1,
        tag: 'Coming Soon',
        title: 'Your Trades, Finally Organized',
        description:
            'Every DEX trade you make will be automatically synced into a clean, searchable journal. No more messy spreadsheets.',
        imageUrl: '/landing/journal.png',
    },
    {
        id: 2,
        tag: 'Coming Soon',
        title: 'A Resume That Speaks for Itself',
        description:
            'Share a single link that proves your skill. Your verified performance profile will open doors to prop firms and investors.',
        imageUrl: '/landing/profile.png',
    },
    {
        id: 3,
        tag: 'Coming Soon',
        title: 'Where the World Sees Your Edge',
        description:
            'Climb the global leaderboard by trading with discipline. Your rank will be earned, never bought.',
        imageUrl: '/landing/ranking.png',
    }
];

export default function ScreenshotSlider() {
    return (
        <motion.section
            className="relative py-32"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div className="mx-auto max-w-7xl px-6">
                <motion.header
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-16 text-center"
                >
                    <span className="mb-4 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                        Sneak Peek
                    </span>

                    <h2 className="text-4xl font-black tracking-tight md:text-6xl">
                        Built For The Next Generation of
                        <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-violet-500 bg-clip-text text-transparent">
                            DEX Traders
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                        We're crafting the tools to turn your on-chain history into your greatest asset. Here's a first look.
                    </p>
                </motion.header>

                <Swiper
                    modules={[Autoplay, Pagination]}
                    slidesPerView={1}
                    loop
                    autoplay={{
                        delay: 4500,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    className="amxinz-swiper"
                >
                    {slides.map((slide) => (
                        <SwiperSlide key={slide.id}>
                            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                                <motion.article
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-amber-400">
                                        {slide.tag}
                                    </span>

                                    <h3 className="mt-6 text-3xl font-black md:text-5xl">
                                        {slide.title}
                                    </h3>

                                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                                        {slide.description}
                                    </p>
                                </motion.article>

                                <motion.figure
                                    className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                >
                                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-violet-500/10" />
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-[24px]">
                                        <Image
                                            src={slide.imageUrl}
                                            alt={slide.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority={slide.id === 1}
                                            className="object-cover transition-transform duration-700 hover:scale-105"
                                        />
                                    </div>
                                </motion.figure>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </motion.section>
    );
}