import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, Bell, Brain, Calculator, Globe, Lock, Mail, Phone, Shield, Smartphone, TrendingUp, Users, Zap } from 'lucide-react';

interface Feature {
    title: string;
    description: string;
    icon?: string;
    status?: string;
    [key: string]: any;
}

interface FeaturesProps {
    features: {
        ai?: Feature[];
        analytics?: Feature[];
        alerts?: Feature[];
        portfolio?: Feature[];
        security?: Feature[];
        mobile?: Feature[];
        [key: string]: Feature[] | undefined;
    };
}

export default function Features({ features }: FeaturesProps) {
    const featureCategories = [
        {
            title: 'AI-Powered Analysis',
            description: 'Advanced machine learning algorithms analyze market data to provide actionable insights',
            icon: Brain,
            features: features.ai || [],
        },
        {
            title: 'Portfolio Management',
            description: 'Comprehensive tools to track, analyze, and optimize your cryptocurrency portfolio',
            icon: BarChart3,
            features: features.portfolio || [],
        },
        {
            title: 'Risk & Tax Tools',
            description: 'Professional-grade risk assessment and tax reporting capabilities',
            icon: Calculator,
            features: features.tax || [],
        },
        {
            title: 'Security & Privacy',
            description: 'Bank-level security measures to protect your data and investments',
            icon: Shield,
            features: features.security || [],
        },
    ];

    return (
        <>
            <Head title="Features - CryptoAdvisor" />

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
                        <Link href="/features" className="text-sm font-medium text-blue-600">
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
                            Powerful Features
                        </Badge>
                        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Everything you need for
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Smart Investing</span>
                        </h1>
                        <p className="mb-8 text-xl text-gray-600">
                            Professional-grade tools powered by AI to help you make informed investment decisions and maximize your cryptocurrency
                            portfolio returns.
                        </p>
                        <Link href="/register">
                            <Button size="lg">
                                Start Free Trial
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Categories */}
            <section className="py-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-7xl">
                        {featureCategories.map((category, categoryIndex) => (
                            <div key={categoryIndex} className={categoryIndex > 0 ? 'mt-32' : ''}>
                                <div className="mb-16 text-center">
                                    <div className="mb-6 flex justify-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                            <category.icon className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <h2 className="mb-4 text-3xl font-bold text-gray-900">{category.title}</h2>
                                    <p className="text-lg text-gray-600">{category.description}</p>
                                </div>

                                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {category.features.map((feature: Feature, featureIndex: number) => (
                                        <Card key={featureIndex} className="border-0 shadow-lg transition-shadow hover:shadow-xl">
                                            <CardHeader>
                                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription className="text-base">{feature.description}</CardDescription>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform Benefits */}
            <section className="bg-gray-50 py-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">Why Choose CryptoAdvisor?</h2>
                            <p className="text-lg text-gray-600">The advantages that set us apart from other platforms</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="border-0 text-center shadow-lg">
                                <CardContent className="pt-8 pb-6">
                                    <div className="mb-4 flex justify-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                            <Zap className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">Real-time Analysis</h3>
                                    <p className="text-gray-600">Get instant AI-powered insights as market conditions change</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 text-center shadow-lg">
                                <CardContent className="pt-8 pb-6">
                                    <div className="mb-4 flex justify-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                            <TrendingUp className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">95% Accuracy</h3>
                                    <p className="text-gray-600">Our AI models achieve industry-leading prediction accuracy</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 text-center shadow-lg">
                                <CardContent className="pt-8 pb-6">
                                    <div className="mb-4 flex justify-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                            <Users className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">50K+ Users</h3>
                                    <p className="text-gray-600">Join thousands of successful crypto investors</p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 text-center shadow-lg">
                                <CardContent className="pt-8 pb-6">
                                    <div className="mb-4 flex justify-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                                            <Lock className="h-6 w-6 text-orange-600" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">Bank-level Security</h3>
                                    <p className="text-gray-600">Your data is protected with military-grade encryption</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Integration */}
            <section className="py-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                            <div>
                                <h2 className="mb-6 text-3xl font-bold text-gray-900">Access Anywhere, Anytime</h2>
                                <p className="mb-6 text-lg text-gray-600">
                                    Our platform works seamlessly across all your devices. Whether you're at your desk or on the go, you'll have
                                    access to real-time market analysis and portfolio insights.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100">
                                            <Smartphone className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Mobile-first responsive design</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-green-100">
                                            <Bell className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Push notifications for alerts</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-100">
                                            <Globe className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Works in any browser</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 rotate-3 transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"></div>
                                <div className="relative rounded-lg bg-white p-8 shadow-lg">
                                    <div className="text-center">
                                        <div className="mb-6 flex justify-center">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                                                <Brain className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="mb-4 text-xl font-bold text-gray-900">Start Your Journey</h3>
                                        <p className="mb-6 text-gray-600">
                                            Join thousands of investors who are already using AI to maximize their returns
                                        </p>
                                        <Link href="/register">
                                            <Button size="lg" className="w-full">
                                                Get Started for Free
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
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
