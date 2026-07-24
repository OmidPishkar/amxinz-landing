import Link from 'next/link';
import Logo from '@/components/Logo';

export const metadata = {
    title: 'Privacy Policy | Amxinz',
    description: 'Learn how Amxinz collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
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
                <h1 className="text-4xl font-black mb-6 !text-foreground">Privacy Policy</h1>

                <p>
                    At <strong>Amxinz</strong>, we respect your privacy and are committed to protecting
                    your personal data. This privacy policy explains how we collect, use, store, and
                    protect your information when you visit our website or join our waitlist.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">1. Information We Collect</h2>
                <h3 className="text-lg font-semibold mb-2">a) Waitlist Sign-Up</h3>
                <p>
                    When you join our waitlist, we collect your <strong>email address</strong>. We do
                    not collect your name, wallet address, IP address, or any other personal data at
                    this stage.
                </p>

                <h3 className="text-lg font-semibold mb-2">b) Automatically Collected Data</h3>
                <p>
                    Like most websites, we may automatically receive certain technical information
                    when you visit our site, such as browser type, operating system, referring URL,
                    and time of visit. This data is anonymized and used solely for improving our
                    service.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">2. How We Use Your Information</h2>
                <p>We use the information we collect for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>To notify you when Amxinz launches publicly.</li>
                    <li>To send occasional product updates, feature announcements, and relevant insights (no more than twice a month).</li>
                    <li>To analyze aggregate usage trends and improve our website.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">3. Sharing of Information</h2>
                <p>
                    We <strong>do not sell, rent, or trade</strong> your personal information to third
                    parties. We may share your data only in the following limited circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Service Providers:</strong> With trusted third-party services (e.g., MongoDB Atlas for database hosting, Vercel/Netlify for hosting) solely to operate our platform. These providers are contractually bound to keep your data secure.</li>
                    <li><strong>Legal Requirements:</strong> If required by law, subpoena, or governmental request.</li>
                    <li><strong>Business Transfer:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction.</li>
                </ul>

                <h2 className="text-2xl font-bold mt-10 mb-4">4. Data Security</h2>
                <p>
                    We implement appropriate technical and organizational measures to protect your
                    personal data against unauthorized access, alteration, disclosure, or destruction.
                    Your email is stored in an encrypted database (MongoDB Atlas) with access limited to
                    authorized personnel only.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">5. Your Rights</h2>
                <p>Depending on your jurisdiction (e.g., GDPR for EU residents, CCPA for California residents), you may have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
                    <li><strong>Rectification:</strong> Correct any inaccurate data.</li>
                    <li><strong>Erasure:</strong> Request deletion of your data (the &quot;right to be forgotten&quot;).</li>
                    <li><strong>Objection:</strong> Object to the processing of your data for direct marketing.</li>
                </ul>
                <p>
                    To exercise any of these rights, please contact us at{" "}
                    <a href="mailto:support@amxinz.com" className="text-primary underline">support@amxinz.com</a>.
                    We will respond within a week.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">6. Cookies</h2>
                <p>
                    Our website currently does not use cookies for tracking or advertising. We may
                    introduce essential cookies in the future to improve user experience (e.g.,
                    remembering theme preferences). If we do, we will update this policy accordingly.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">7. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of any
                    material changes by posting the new policy on this page and updating the &quot;Last
                    updated&quot; date. For significant changes, we may also send an email notification.
                </p>

                <h2 className="text-2xl font-bold mt-10 mb-4">8. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy or our data practices, please
                    contact us at:
                </p>
                <p>
                    📧 <a href="mailto:support@amxinz.com" className="text-primary underline">support@amxinz.com</a>
                </p>
                <p className="mt-4">
                    We are committed to protecting your privacy and building a platform you can trust.
                    Thank you for being part of the Amxinz community.
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