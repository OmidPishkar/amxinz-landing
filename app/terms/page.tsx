import Link from 'next/link';
import Logo from '@/components/Logo';

export const metadata = {
    title: 'Terms of Service | Amxinz',
    description: 'The terms and conditions governing your use of the Amxinz platform.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header ساده با لوگو */}
            <header className="border-b border-border/50">
                <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <Logo isCollapsed={false} />
                    </Link>
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </header>

            {/* محتوای اصلی */}
            <main className="max-w-3xl mx-auto px-6 py-16 prose prose-invert prose-headings:font-bold prose-a:text-primary prose-p:text-muted-foreground prose-li:text-muted-foreground">
                <p className="text-sm text-muted-foreground">Last updated: July 24, 2026</p>
                <h1 className="text-4xl font-black mb-6 !text-foreground">Terms of Service</h1>

                <p>
                    Welcome to <strong>Amxinz</strong>. These Terms of Service (&quot;Terms&quot;) govern your use of
                    the Amxinz website, platform, and any related services (collectively, the
                    &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these
                    Terms. If you do not agree, please do not use the Service.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">1. Eligibility</h2>
                <p>
                    You must be at least 13 years old to use the Service. By using the Service, you
                    represent and warrant that you have the legal capacity to enter into a binding
                    agreement.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">2. Description of Service</h2>
                <p>
                    Amxinz is a decentralized exchange (DEX) trading journal and reputation network.
                    The Service allows traders to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Connect their blockchain wallets to automatically import trade history.</li>
                    <li>Generate verifiable trading performance profiles.</li>
                    <li>Access AI‑powered insights and daily discipline scores.</li>
                    <li>Participate in a global trader leaderboard.</li>
                    <li>Share public trading journals and receive community feedback.</li>
                </ul>
                <p>
                    We are continuously improving the Service and reserve the right to modify, suspend,
                    or discontinue any aspect of the Service at any time without prior notice.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">3. User Accounts</h2>
                <p>
                    To access certain features, you must register for an account. You are responsible
                    for maintaining the confidentiality of your login credentials and for all
                    activities that occur under your account. You agree to provide accurate and
                    complete information during registration and to keep your account information
                    updated.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">4. User Content</h2>
                <p>
                    The Service may allow you to upload, post, or share content, including but not
                    limited to trading data, comments, and profile information (&quot;User Content&quot;).
                    You retain ownership of your User Content. By submitting User Content, you grant
                    Amxinz a worldwide, non‑exclusive, royalty‑free license to use, reproduce,
                    display, and distribute your User Content in connection with the operation of
                    the Service.
                </p>
                <p>
                    You are solely responsible for your User Content and represent that you have all
                    necessary rights to it. Amxinz does not endorse or guarantee the accuracy of
                    any User Content.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">5. Prohibited Conduct</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Use the Service for any illegal or unauthorized purpose.</li>
                    <li>Upload or share content that is defamatory, obscene, or infringes the rights of others.</li>
                    <li>Attempt to manipulate or falsify trading data displayed on the platform.</li>
                    <li>Interfere with or disrupt the Service, servers, or networks.</li>
                    <li>Use any automated means (bots, scrapers) to access or extract data without our express written permission.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">6. Intellectual Property</h2>
                <p>
                    The Service and its original content (excluding User Content), features, and
                    functionality are and will remain the exclusive property of Amxinz. The Amxinz
                    name, logo, and all related branding are trademarks of Amxinz and may not be
                    used without our prior written permission.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">7. Disclaimer of Warranties</h2>
                <p>
                    The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties,
                    express or implied. Amxinz does not warrant that the Service will be uninterrupted,
                    error‑free, or completely secure. You use the Service at your own risk.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">8. Limitation of Liability</h2>
                <p>
                    To the fullest extent permitted by applicable law, Amxinz and its founders,
                    employees, and affiliates shall not be liable for any indirect, incidental,
                    special, consequential, or punitive damages arising from or related to your
                    use of the Service. Our total liability for any claim under these Terms shall
                    not exceed the amount paid by you (if any) to Amxinz in the twelve (12) months
                    preceding the event giving rise to the claim.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">9. Indemnification</h2>
                <p>
                    You agree to indemnify and hold harmless Amxinz and its affiliates from any
                    claims, damages, liabilities, and expenses (including reasonable legal fees)
                    arising out of your use of the Service, your User Content, or your violation
                    of these Terms.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">10. Termination</h2>
                <p>
                    We reserve the right to suspend or terminate your access to the Service at any
                    time, with or without cause, and without prior notice. Upon termination, all
                    provisions of these Terms that by their nature should survive termination shall
                    survive.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">11. Governing Law &amp; Disputes</h2>
                <p>
                    These Terms shall be governed by and construed in accordance with the laws of
                    the United Kingdom, without regard to its conflict of law provisions. Any
                    dispute arising from or relating to these Terms shall be resolved exclusively
                    in the courts located in London, United Kingdom.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">12. Changes to These Terms</h2>
                <p>
                    We may update these Terms from time to time. We will notify you of material
                    changes by posting the new Terms on this page and updating the &quot;Last updated&quot;
                    date. For significant changes, we may also send an email notification to
                    registered users. Your continued use of the Service after the changes take
                    effect constitutes your acceptance of the revised Terms.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">13. Contact</h2>
                <p>
                    If you have any questions about these Terms, please contact us at{" "}
                    <a href="mailto:support@amxinz.com" className="text-primary underline">support@amxinz.com</a>.
                </p>

                {/* امضای برند */}
                <div className="mt-16 pt-8 border-t border-border/50 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">© 2026 Amxinz. All rights reserved.</p>
                    <Link
                        href="/"
                        className="text-sm text-primary hover:underline"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}