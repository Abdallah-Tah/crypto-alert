import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { Brain, Globe, Mail, Phone } from 'lucide-react';

export default function Terms() {
    return (
        <>
            <Head title="Terms of Service - CryptoAdvisor" />

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
                            Terms of
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Service</span>
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
                            <h2>Agreement to Terms</h2>
                            <p>
                                By accessing and using CryptoAdvisor ("the Service"), you accept and agree to be bound by the terms and provision of
                                this agreement. If you do not agree to abide by the above, please do not use this service.
                            </p>

                            <h2>Description of Service</h2>
                            <p>
                                CryptoAdvisor is an AI-powered cryptocurrency investment analysis platform that provides market insights, portfolio
                                tracking, risk assessment, and tax reporting tools. Our service is for informational and educational purposes only.
                            </p>

                            <h2>Investment Disclaimer</h2>
                            <div className="my-6 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                                <p className="mb-2 font-semibold text-yellow-800">IMPORTANT INVESTMENT DISCLAIMER:</p>
                                <p className="text-yellow-700">
                                    CryptoAdvisor provides analysis and information for educational purposes only. This is NOT financial advice.
                                    Cryptocurrency investments are highly volatile and risky. You may lose all or part of your investment. Always
                                    conduct your own research and consult with qualified financial advisors before making investment decisions.
                                </p>
                            </div>

                            <h2>User Accounts</h2>
                            <p>To access certain features, you must create an account. You agree to:</p>
                            <ul>
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain the security of your password and account</li>
                                <li>Notify us immediately of any unauthorized use</li>
                                <li>Be responsible for all activities under your account</li>
                                <li>Use the service only for lawful purposes</li>
                            </ul>

                            <h2>Acceptable Use</h2>
                            <p>You agree NOT to use the service to:</p>
                            <ul>
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on intellectual property rights</li>
                                <li>Transmit malicious code or viruses</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Reverse engineer or modify our software</li>
                                <li>Use automated systems to scrape data</li>
                                <li>Resell or redistribute our services</li>
                            </ul>

                            <h2>Subscription and Payment</h2>
                            <h3>Billing</h3>
                            <ul>
                                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                                <li>All fees are non-refundable except as required by law</li>
                                <li>We may change pricing with 30 days' notice</li>
                                <li>Failed payments may result in service suspension</li>
                            </ul>

                            <h3>Cancellation</h3>
                            <ul>
                                <li>You may cancel your subscription at any time</li>
                                <li>Cancellation takes effect at the end of the current billing period</li>
                                <li>No partial refunds for unused time</li>
                                <li>We may terminate accounts for violations of these terms</li>
                            </ul>

                            <h2>Intellectual Property</h2>
                            <p>
                                All content, features, and functionality of CryptoAdvisor are owned by us and protected by copyright, trademark, and
                                other intellectual property laws. You may not copy, modify, distribute, or create derivative works without permission.
                            </p>

                            <h2>Data and Privacy</h2>
                            <p>
                                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy,
                                which is incorporated into these terms by reference.
                            </p>

                            <h2>Service Availability</h2>
                            <p>
                                We strive to maintain high service availability but cannot guarantee uninterrupted access. We may temporarily suspend
                                service for maintenance, updates, or other operational reasons.
                            </p>

                            <h2>Limitation of Liability</h2>
                            <div className="my-6 rounded-lg border border-red-200 bg-red-50 p-6">
                                <p className="mb-2 font-semibold text-red-800">LIMITATION OF LIABILITY:</p>
                                <p className="text-red-700">
                                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, CRYPTOADVISOR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                                    CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO INVESTMENT LOSSES, LOST PROFITS, OR DATA LOSS,
                                    ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
                                </p>
                            </div>

                            <h2>Disclaimers</h2>
                            <p>
                                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS
                                OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                            </p>

                            <h2>AI and Data Accuracy</h2>
                            <p>
                                While our AI models are trained on extensive data and achieve high accuracy rates, no prediction or analysis is
                                guaranteed to be correct. Market conditions can change rapidly, and past performance does not guarantee future
                                results.
                            </p>

                            <h2>Indemnification</h2>
                            <p>
                                You agree to indemnify and hold harmless CryptoAdvisor from any claims, damages, or expenses arising from your use of
                                the service, violation of these terms, or infringement of any rights.
                            </p>

                            <h2>Dispute Resolution</h2>
                            <p>
                                Any disputes arising from these terms or your use of the service will be resolved through binding arbitration in
                                accordance with the rules of the American Arbitration Association. You waive your right to a jury trial or to
                                participate in class action lawsuits.
                            </p>

                            <h2>Governing Law</h2>
                            <p>
                                These terms are governed by the laws of the State of California, without regard to conflict of law principles. Any
                                legal proceedings must be brought in the federal or state courts located in San Francisco, California.
                            </p>

                            <h2>Severability</h2>
                            <p>
                                If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full force and
                                effect.
                            </p>

                            <h2>Changes to Terms</h2>
                            <p>
                                We may modify these terms at any time. Material changes will be posted on our website with an updated effective date.
                                Continued use of the service after changes constitutes acceptance of the new terms.
                            </p>

                            <h2>Contact Information</h2>
                            <p>If you have questions about these Terms of Service, please contact us:</p>
                            <ul>
                                <li>
                                    <strong>Email:</strong> legal@cryptoadvisor.com
                                </li>
                                <li>
                                    <strong>Phone:</strong> +1 (555) 123-4567
                                </li>
                                <li>
                                    <strong>Address:</strong> 123 Tech Street, San Francisco, CA 94105
                                </li>
                            </ul>

                            <div className="my-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
                                <p className="mb-2 font-semibold text-blue-800">By using CryptoAdvisor, you acknowledge that:</p>
                                <ul className="space-y-1 text-blue-700">
                                    <li>• You have read and understood these Terms of Service</li>
                                    <li>• You agree to be bound by these terms</li>
                                    <li>• You understand the risks of cryptocurrency investing</li>
                                    <li>• You will not rely solely on our analysis for investment decisions</li>
                                </ul>
                            </div>
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
                                <Link href="/privacy" className="block text-gray-600 hover:text-gray-900">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms" className="block text-blue-600">
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
