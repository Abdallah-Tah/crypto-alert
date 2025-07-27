import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { Brain, Check, Globe, Mail, Phone, Star, Zap } from 'lucide-react';

interface PricingPlan {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    popular?: boolean;
    buttonText: string;
    buttonVariant: 'default' | 'outline';
}

interface FAQ {
    question: string;
    answer: string;
}

interface PricingProps {
    plans: PricingPlan[];
    faqs: FAQ[];
}

export default function Pricing({ plans, faqs }: PricingProps) {
    return (
        <>
            <Head title="Pricing - CryptoAdvisor" />

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
                        <Link href="/pricing" className="text-sm font-medium text-blue-600">
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
                            Simple, Transparent Pricing
                        </Badge>
                        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Choose the
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Perfect Plan</span>
                        </h1>
                        <p className="mb-8 text-xl text-gray-600">
                            Start with our free plan and upgrade as your portfolio grows. All plans include our core AI features with no hidden fees.
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-8 lg:grid-cols-3">
                            {plans.map((plan, index) => (
                                <Card key={index} className={`relative border-0 shadow-lg ${plan.popular ? 'scale-105 ring-2 ring-blue-600' : ''}`}>
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                                <Star className="mr-1 h-3 w-3" />
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}

                                    <CardHeader className="pt-8 pb-8">
                                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                        <CardDescription className="text-base">{plan.description}</CardDescription>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                            <span className="text-gray-600">/{plan.period}</span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start gap-3">
                                                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                                    <span className="text-gray-600">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Link href="/register" className="block">
                                            <Button variant={plan.buttonVariant} size="lg" className="w-full">
                                                {plan.buttonText}
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="bg-gray-50 py-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">Compare Features</h2>
                            <p className="text-lg text-gray-600">See what's included in each plan</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full rounded-lg bg-white shadow-lg">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-6 text-left font-semibold text-gray-900">Feature</th>
                                        <th className="p-6 text-center font-semibold text-gray-900">Starter</th>
                                        <th className="p-6 text-center font-semibold text-gray-900">Professional</th>
                                        <th className="p-6 text-center font-semibold text-gray-900">Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { feature: 'AI Market Analysis', starter: true, professional: true, enterprise: true },
                                        { feature: 'Real-time Alerts', starter: '5/month', professional: 'Unlimited', enterprise: 'Unlimited' },
                                        { feature: 'Portfolio Tracking', starter: '3 coins', professional: '50 coins', enterprise: 'Unlimited' },
                                        { feature: 'Tax Reporting', starter: false, professional: true, enterprise: true },
                                        { feature: 'Advanced Analytics', starter: false, professional: true, enterprise: true },
                                        { feature: 'API Access', starter: false, professional: false, enterprise: true },
                                        { feature: 'Priority Support', starter: false, professional: true, enterprise: true },
                                        { feature: 'Custom Strategies', starter: false, professional: false, enterprise: true },
                                    ].map((row, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            <td className="p-6 font-medium text-gray-900">{row.feature}</td>
                                            <td className="p-6 text-center">
                                                {typeof row.starter === 'boolean' ? (
                                                    row.starter ? (
                                                        <Check className="mx-auto h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )
                                                ) : (
                                                    <span className="text-gray-600">{row.starter}</span>
                                                )}
                                            </td>
                                            <td className="p-6 text-center">
                                                {typeof row.professional === 'boolean' ? (
                                                    row.professional ? (
                                                        <Check className="mx-auto h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )
                                                ) : (
                                                    <span className="text-gray-600">{row.professional}</span>
                                                )}
                                            </td>
                                            <td className="p-6 text-center">
                                                {typeof row.enterprise === 'boolean' ? (
                                                    row.enterprise ? (
                                                        <Check className="mx-auto h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )
                                                ) : (
                                                    <span className="text-gray-600">{row.enterprise}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                            <p className="text-lg text-gray-600">Everything you need to know about our pricing</p>
                        </div>

                        <div className="space-y-8">
                            {faqs.map((faq, index) => (
                                <Card key={index} className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Money Back Guarantee */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-8 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                <Zap className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h2 className="mb-4 text-3xl font-bold text-white">30-Day Money Back Guarantee</h2>
                        <p className="mb-8 text-lg text-blue-100">
                            Try CryptoAdvisor risk-free. If you're not satisfied within 30 days, we'll refund your money, no questions asked.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Link href="/register">
                                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                                    Start Free Trial
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                    Contact Sales
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-white">
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
