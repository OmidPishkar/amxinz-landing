'use client';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const scrollToWaitlist = () => {
        document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
    };
    const scrollToFeatures = () => {
        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || submitting) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setSubscribed(true);
                setEmail('');
                toast.success(data.message || 'You are on the list!');
                setTimeout(() => setSubscribed(false), 3000);
            } else {
                toast.error(data.message || 'Something went wrong');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.footer
            className="relative overflow-hidden border-t border-white/10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            {/* Glow */}
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.03] to-amber-400/[0.04]" />
            <div aria-hidden="true" className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[140px]" />

            <div className="relative mx-auto max-w-7xl px-6">
                {/* CTA Section */}
                <motion.section
                    id="waitlist"
                    className="py-24 text-center border-b border-white/10"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                        Join The Waitlist
                    </span>

                    <h2 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
                        Be The First To
                        <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-violet-500 bg-clip-text text-transparent">
                            Build Your Reputation
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                        We're onboarding traders in batches. Secure your spot and get exclusive early access to the platform.
                    </p>

                    {/* Waitlist Form */}
                    <motion.form
                        onSubmit={handleSubscribe}
                        className="mt-10 max-w-md mx-auto flex gap-3"
                    >
                        <div className="relative flex-1">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 backdrop-blur-xl outline-none"
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={submitting}
                            className="rounded-2xl px-6 py-3 font-semibold text-black disabled:opacity-50 shadow-[0_10px_30px_rgba(245,158,11,.25)]"
                            style={{ background: 'linear-gradient(135deg,#FFB84D,#F59E0B)' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {submitting ? 'Joining...' : 'Get Early Access'}
                        </motion.button>
                    </motion.form>
                    {subscribed && (
                        <p className="mt-4 text-sm text-green-400">You're on the list! We'll be in touch soon.</p>
                    )}
                </motion.section>

                {/* Main Footer */}
                <div className="py-20 grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
                    {/* Brand */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                    >
                        <h3 className="text-3xl font-black bg-gradient-to-r from-amber-400 to-violet-500 bg-clip-text text-transparent">
                            AMXINZ
                        </h3>
                        <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                            The next generation DEX trading journal,
                            community and ranking platform built for
                            transparent traders.
                        </p>
                    </motion.aside>

                    {/* Product (scroll links) */}
                    <motion.nav
                        aria-label="Product sections"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <h4 className="mb-5 font-semibold">Preview</h4>
                        <ul className="space-y-3 text-sm">
                            <li><button onClick={scrollToFeatures} className="text-muted-foreground hover:text-foreground transition-colors">Journal</button></li>
                            <li><button onClick={scrollToFeatures} className="text-muted-foreground hover:text-foreground transition-colors">Profile</button></li>
                            <li><button onClick={scrollToFeatures} className="text-muted-foreground hover:text-foreground transition-colors">Leaderboard</button></li>
                            <li><button onClick={scrollToWaitlist} className="text-muted-foreground hover:text-foreground transition-colors">Early Access</button></li>
                        </ul>
                    </motion.nav>

                    {/* Resources */}
                    <motion.nav
                        aria-label="Resource links"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <h4 className="mb-5 font-semibold">Resources</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                            <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
                        </ul>
                    </motion.nav>

                    {/* Stay Updated */}
                    <motion.aside
                        aria-label="Stay updated"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <h4 className="mb-5 font-semibold">Stay Updated</h4>
                        <p className="mb-5 text-sm text-muted-foreground">
                            Get notified when we launch and receive exclusive trading insights.
                        </p>
                        <motion.form
                            onSubmit={handleSubscribe}
                            className="space-y-3"
                        >
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 backdrop-blur-xl outline-none"
                                />
                            </div>
                            <motion.button
                                type="submit"
                                disabled={submitting}
                                className="w-full rounded-2xl py-3 font-semibold text-black disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg,#FFB84D,#F59E0B)' }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {submitting ? 'Subscribing...' : 'Subscribe'}
                            </motion.button>
                        </motion.form>
                        {subscribed && (
                            <p className="mt-3 text-xs text-green-400">Thanks for subscribing.</p>
                        )}
                    </motion.aside>
                </div>

                {/* Bottom */}
                <motion.div
                    className="flex flex-col gap-4 border-t border-white/10 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <p>© 2026 AMXINZ. All rights reserved.</p>
                    <nav className="flex gap-5" aria-label="Legal links">
                        <Link href="/privacy">Privacy</Link>
                        <Link href="/terms">Terms</Link>
                    </nav>
                </motion.div>
            </div>
        </motion.footer>
    );
};

export default Footer;