'use client';

import dynamic from 'next/dynamic';

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import ScreenshotSlider from "@/components/landing/ScreenshotSlider";
import Footer from "@/components/landing/Footer";

const ThreeBackground = dynamic(
  () => import('@/components/landing/ThreeBackground'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">

      {/* Background Layer */}
      <ThreeBackground />

      {/* Decorative Gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[10%] top-[10%] h-[500px] w-[500px] rounded-full bg-secondary/15 blur-[140px]" />
        <div className="absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <Navbar />

      <main>
        <Hero />
        <Features />
        <ScreenshotSlider />
      </main>

      <Footer />
    </div>
  );
}