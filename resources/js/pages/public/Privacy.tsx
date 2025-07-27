import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { Brain, Globe, Mail, Phone } from 'lucide-react';

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy - CryptoAdvisor" />

            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                            <Brain className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">CryptoAdvisor</span>
                    </div>

                    <div className="hidden items-center gap-8 md:flex">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            Home
                        </Link>
                        <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            Features
                        </Link>
                        <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            Pricing
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            About
                        </Link>
                        <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            Contact
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            Sign In
                        </Link>
                        <Link href="/register">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-16">
                <div className="container px-4 py-20">
                    <div className="mx-auto max-w-4xl text-center">
                        <Badge variant="outline" className="mb-4">
                            Legal Document
                        </Badge>
                        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Privacy
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Policy</span>
                        </h1>
                        <p className="mb-8 text-xl text-gray-600">Last updated: January 1, 2025</p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="pb-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="prose prose-lg max-w-none">
                            <h2>Introduction</h2>
                            <p>
                                At CryptoAdvisor ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you about how we look after your personal data when you visit our website (regardless
                                of where you visit it from) and tell you about your privacy rights and how the law protects you.
                            </p>

                            <h2>Information We Collect</h2>
                            <h3>Personal Information You Provide</h3>
                            <ul>
                                <li>
                                    <strong>Account Information:</strong> Name, email address, password when you create an account
                                </li>
                                <li>
                                    <strong>Profile Information:</strong> Investment preferences, portfolio data, risk tolerance
                                </li>
                                <li>
                                    <strong>Payment Information:</strong> Billing address, payment method details (processed securely by our payment
                                    providers)
                                </li>
                                <li>
                                    <strong>Communication Data:</strong> Your correspondence with us, including support requests
                                </li>
                            </ul>

                            <h3>Information We Collect Automatically</h3>
                            <ul>
                                <li>
                                    <strong>Usage Data:</strong> How you interact with our platform, features used, time spent
                                </li>
                                <li>
                                    <strong>Device Information:</strong> Browser type, operating system, IP address, device identifiers
                                </li>
                                <li>
                                    <strong>Log Data:</strong> Server logs, error reports, performance data
                                </li>
                                <li>
                                    <strong>Cookies:</strong> We use cookies and similar technologies to enhance your experience
                                </li>
                            </ul>

                            <h2>How We Use Your Information</h2>
                            <p>We use your personal information for the following purposes:</p>
                            <ul>
                                <li>
                                    <strong>Provide Services:</strong> Deliver AI-powered investment analysis, portfolio tracking, and alerts
                                </li>
                                <li>
                                    <strong>Improve Platform:</strong> Enhance our AI models, fix bugs, and develop new features
                                </li>
                                <li>
                                    <strong>Communicate:</strong> Send you important updates, notifications, and marketing communications
                                </li>
                                <li>
                                    <strong>Security:</strong> Protect against fraud, abuse, and security threats
                                </li>
                                <li>
                                    <strong>Legal Compliance:</strong> Comply with applicable laws and regulations
                                </li>
                            </ul>

                            <h2>Information Sharing</h2>
                            <p>
                                We do not sell, trade, or rent your personal information to third parties. We may share your information in limited
                                circumstances:
                            </p>
                            <ul>
                                <li>
                                    <strong>Service Providers:</strong> Trusted third parties who help us operate our platform (payment processors,
                                    cloud hosting, analytics)
                                </li>
                                <li>
                                    <strong>Legal Requirements:</strong> When required by law, court order, or government regulation
                                </li>
                                <li>
                                    <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
                                </li>
                                <li>
                                    <strong>Consent:</strong> When you explicitly consent to sharing
                                </li>
                            </ul>

                            <h2>Data Security</h2>
                            <p>We implement appropriate technical and organizational security measures to protect your personal data:</p>
                            <ul>
                                <li>Encryption in transit and at rest using industry-standard protocols</li>
                                <li>Regular security audits and penetration testing</li>
                                <li>Access controls and authentication requirements for our staff</li>
                                <li>Secure data centers with physical security measures</li>
                                <li>Regular backups and disaster recovery procedures</li>
                            </ul>

                            <h2>Your Rights</h2>
                            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
                            <ul>
                                <li>
                                    <strong>Access:</strong> Request a copy of your personal data
                                </li>
                                <li>
                                    <strong>Rectification:</strong> Correct inaccurate or incomplete data
                                </li>
                                <li>
                                    <strong>Erasure:</strong> Request deletion of your personal data
                                </li>
                                <li>
                                    <strong>Portability:</strong> Receive your data in a machine-readable format
                                </li>
                                <li>
                                    <strong>Objection:</strong> Object to processing based on legitimate interests
                                </li>
                                <li>
                                    <strong>Restriction:</strong> Request limitation of processing
                                </li>
                            </ul>

                            <h2>Data Retention</h2>
                            <p>
                                We retain your personal data only as long as necessary for the purposes outlined in this policy or as required by law.
                                When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are
                                legally required to retain it longer.
                            </p>

                            <h2>International Transfers</h2>
                            <p>
                                Your personal data may be processed in countries other than your own. We ensure appropriate safeguards are in place to
                                protect your data during international transfers, including adequacy decisions, standard contractual clauses, or other
                                approved mechanisms.
                            </p>

                            <h2>Cookies and Tracking</h2>
                            <p>We use cookies and similar technologies to:</p>
                            <ul>
                                <li>Remember your preferences and settings</li>
                                <li>Analyze platform usage and performance</li>
                                <li>Provide personalized content and recommendations</li>
                                <li>Ensure security and prevent fraud</li>
                            </ul>
                            <p>You can manage cookie preferences through your browser settings.</p>

                            <h2>Children's Privacy</h2>
                            <p>
                                Our services are not intended for children under 18 years of age. We do not knowingly collect personal information
                                from children under 18. If you are a parent or guardian and believe your child has provided us with personal
                                information, please contact us immediately.
                            </p>

                            <h2>Changes to This Policy</h2>
                            <p>
                                We may update this privacy policy from time to time. We will notify you of any material changes by posting the new
                                privacy policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                            </p>

                            <h2>Contact Us</h2>
                            <p>If you have any questions about this privacy policy or our data practices, please contact us:</p>
                            <ul>
                                <li>
                                    <strong>Email:</strong> privacy@cryptoadvisor.com
                                </li>
                                <li>
                                    <strong>Phone:</strong> +1 (555) 123-4567
                                </li>
                                <li>
                                    <strong>Address:</strong> 123 Tech Street, San Francisco, CA 94105
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-gray-50">
                <div className="container px-4 py-16">
                    <div className="grid gap-8 lg:grid-cols-5">
                        <div className="lg:col-span-2">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                    <Brain className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">CryptoAdvisor</span>
                            </div>
                            <p className="mb-4 text-gray-600">
                                The most advanced AI-powered cryptocurrency investment platform. Make smarter decisions with professional-grade tools.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200">
                                    <Phone className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-gray-900">Product</h3>
                            <div className="space-y-2">
                                <Link href="/features" className="block text-gray-600 hover:text-gray-900">
                                    Features
                                </Link>
                                <Link href="/pricing" className="block text-gray-600 hover:text-gray-900">
                                    Pricing
                                </Link>
                                <Link href="/dashboard" className="block text-gray-600 hover:text-gray-900">
                                    Dashboard
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-gray-900">Company</h3>
                            <div className="space-y-2">
                                <Link href="/about" className="block text-gray-600 hover:text-gray-900">
                                    About
                                </Link>
                                <Link href="/contact" className="block text-gray-600 hover:text-gray-900">
                                    Contact
                                </Link>
                                <Link href="/careers" className="block text-gray-600 hover:text-gray-900">
                                    Careers
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 font-semibold text-gray-900">Legal</h3>
                            <div className="space-y-2">
                                <Link href="/privacy" className="block text-blue-600">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms" className="block text-gray-600 hover:text-gray-900">
                                    Terms of Service
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 border-t pt-8">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <p className="text-gray-600">© 2025 CryptoAdvisor. All rights reserved.</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Made with ❤️ for crypto investors</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
