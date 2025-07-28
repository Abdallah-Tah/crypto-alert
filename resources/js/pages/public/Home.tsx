import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, Bell, Brain, Calculator, CheckCircle, Globe, Mail, Phone, Play, Quote, Star } from 'lucide-react';

interface Feature {
    title: string;
    description: string;
    icon: string;
}

interface Stat {
    label: string;
    value: string;
}

interface Testimonial {
    name: string;
    role: string;
    content: string;
    avatar: string;
}

interface HomeProps {
    features: Feature[];
    stats: Stat[];
    testimonials: Testimonial[];
}

const iconMap = {
    brain: Brain,
    calculator: Calculator,
    bell: Bell,
    chart: BarChart3,
};

export default function Home({ features, stats, testimonials }: HomeProps) {
    return (
        <div className="min-h-screen bg-black text-white">
            <Head title="Home - AI-Powered Crypto Investment Platform" />

            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full border-b border-green-500/20 bg-black/90 backdrop-blur-xl transition-all duration-300">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="group flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 opacity-75 blur transition-opacity duration-300 group-hover:opacity-100"></div>
                            <div className="relative flex h-10 w-10 transform items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg transition-all duration-300 group-hover:scale-110">
                                <Brain className="h-5 w-5 text-white drop-shadow-sm" />
                            </div>
                        </div>
                        <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-xl font-bold text-transparent">
                            CryptoAdvisor
                        </span>
                    </div>

                    <div className="hidden items-center gap-8 md:flex">
                        <Link
                            href="/features"
                            className="group relative text-sm font-medium text-gray-300 transition-all duration-300 hover:text-green-400"
                        >
                            Features
                            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link
                            href="/pricing"
                            className="group relative text-sm font-medium text-gray-300 transition-all duration-300 hover:text-green-400"
                        >
                            Pricing
                            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link
                            href="/about"
                            className="group relative text-sm font-medium text-gray-300 transition-all duration-300 hover:text-green-400"
                        >
                            About
                            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link
                            href="/contact"
                            className="group relative text-sm font-medium text-gray-300 transition-all duration-300 hover:text-green-400"
                        >
                            Contact
                            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-300 transition-colors duration-200 hover:text-green-400">
                            Sign In
                        </Link>
                        <Link href="/register">
                            <Button
                                size="sm"
                                className="relative transform overflow-hidden border-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-500/25"
                            >
                                <span className="relative z-10">Get Started</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 transition-opacity duration-300 hover:opacity-20"></div>
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 sm:px-6 lg:px-8">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black"></div>

                {/* Floating Elements - Responsive positioning */}
                <div className="animate-float absolute top-10 left-4 h-48 w-48 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl filter sm:top-20 sm:left-20 sm:h-72 sm:w-72"></div>
                <div className="animate-float absolute top-20 right-4 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-600/20 blur-3xl filter delay-1000 sm:top-40 sm:right-20 sm:h-96 sm:w-96"></div>
                <div className="animate-float absolute bottom-10 left-1/2 h-56 w-56 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-green-600/20 to-emerald-400/20 blur-3xl filter delay-500 sm:bottom-20 sm:h-80 sm:w-80"></div>

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(34 197 94) 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }}
                ></div>

                <div className="relative z-10 mx-auto w-full max-w-7xl">
                    <div className="text-center">
                        <div className="animate-fadeIn">
                            <Badge
                                variant="outline"
                                className="mb-4 border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 shadow-sm backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2 sm:text-sm"
                            >
                                ✨ AI-Powered Investment Platform
                            </Badge>
                        </div>

                        <h1 className="animate-fadeIn mb-6 text-4xl font-bold tracking-tight text-white delay-100 sm:mb-8 sm:text-5xl md:text-6xl lg:text-7xl">
                            <span className="block">Smart Crypto Investing</span>
                            <span className="mt-1 block sm:mt-2">with </span>
                            <span className="animate-gradient bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                                AI Insights
                            </span>
                        </h1>

                        <p className="animate-fadeIn mx-auto mb-8 max-w-2xl px-4 text-lg leading-relaxed text-gray-300 delay-200 sm:mb-10 sm:px-0 sm:text-xl lg:max-w-3xl">
                            Make informed investment decisions with AI-powered analysis, comprehensive tax tools, and real-time market intelligence.
                            Start building your wealth today.
                        </p>

                        <div className="animate-fadeIn flex flex-col gap-3 px-4 delay-300 sm:flex-row sm:justify-center sm:gap-4 sm:px-0">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="group h-12 w-full transform border-0 bg-gradient-to-r from-green-500 to-emerald-600 px-6 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-emerald-700 hover:shadow-2xl hover:shadow-green-500/25 sm:h-14 sm:w-auto sm:px-8 sm:text-lg"
                                >
                                    <span className="mr-2">Start Free Trial</span>
                                    <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1 sm:h-5 sm:w-5" />
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="lg"
                                className="group h-12 w-full border-green-500/30 bg-green-500/10 px-6 text-base font-semibold text-green-400 backdrop-blur-sm transition-all duration-300 hover:border-green-400 hover:bg-green-500/20 hover:text-green-300 sm:h-14 sm:w-auto sm:px-8 sm:text-lg"
                            >
                                <Play className="mr-2 h-4 w-4 transform transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                                Watch Demo
                            </Button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="animate-fadeIn mt-12 delay-500 sm:mt-16">
                            <p className="mb-3 text-xs text-gray-400 sm:mb-4 sm:text-sm">Trusted by thousands of crypto investors worldwide</p>
                            <div className="flex flex-col items-center justify-center gap-4 opacity-60 sm:flex-row sm:gap-8">
                                {/* Add trust badges/logos here */}
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-green-400 text-green-400 sm:h-4 sm:w-4" />
                                    ))}
                                    <span className="ml-2 text-xs font-medium text-gray-300 sm:text-sm">4.9/5 rating</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Stats Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16 sm:py-20 lg:py-24">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(34,197,94,0.3) 1px, transparent 0)',
                            backgroundSize: '20px 20px',
                        }}
                    ></div>
                </div>

                {/* Floating Orbs */}
                <div className="animate-float absolute top-4 left-4 h-20 w-20 rounded-full bg-green-500/20 blur-xl sm:top-10 sm:left-10 sm:h-32 sm:w-32"></div>
                <div className="animate-float absolute right-4 bottom-4 h-32 w-32 rounded-full bg-emerald-500/20 blur-xl delay-1000 sm:right-10 sm:bottom-10 sm:h-48 sm:w-48"></div>

                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center sm:mb-16">
                        <h2 className="animate-fadeIn mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-3xl lg:text-4xl">
                            Trusted by thousands of investors worldwide
                        </h2>
                        <p className="animate-fadeIn text-lg text-green-100 delay-100 sm:text-xl">
                            Join the community that's already building wealth with AI
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 lg:gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="group animate-fadeIn text-center" style={{ animationDelay: `${index * 100 + 200}ms` }}>
                                <div className="relative h-32 sm:h-36">
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-20 blur transition-opacity duration-300 group-hover:opacity-40 sm:rounded-2xl"></div>
                                    <div className="relative flex h-full transform flex-col justify-center rounded-xl border border-green-500/20 bg-green-500/10 p-4 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-green-500/20 sm:rounded-2xl sm:p-6">
                                        <div className="mb-1 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-2xl font-bold text-transparent sm:mb-2 sm:text-3xl lg:text-4xl">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs leading-tight font-medium tracking-wider text-green-100 uppercase sm:text-sm">
                                            {stat.label}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative bg-gradient-to-br from-black via-gray-900/30 to-black py-16 sm:py-20 lg:py-32">
                {/* Background Elements */}
                <div className="absolute top-10 right-4 h-48 w-48 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl sm:top-20 sm:right-20 sm:h-64 sm:w-64"></div>
                <div className="absolute bottom-10 left-4 h-56 w-56 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-600/20 blur-3xl sm:bottom-20 sm:left-20 sm:h-80 sm:w-80"></div>

                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center sm:mb-16 lg:mb-20">
                        <div className="animate-fadeIn">
                            <Badge
                                variant="outline"
                                className="mb-4 border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2 sm:text-sm"
                            >
                                🚀 Powerful Features
                            </Badge>
                        </div>
                        <h2 className="animate-fadeIn mb-4 text-3xl font-bold text-white delay-100 sm:mb-6 sm:text-4xl lg:text-5xl">
                            Everything you need to
                            <span className="mt-1 block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent sm:mt-2">
                                succeed
                            </span>
                        </h2>
                        <p className="animate-fadeIn mx-auto max-w-2xl px-4 text-base text-gray-300 delay-200 sm:px-0 sm:text-lg lg:text-xl">
                            Professional-grade tools that were once only available to institutional investors, now accessible to everyone.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                        {features.map((feature, index) => {
                            const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || Brain;
                            return (
                                <Card
                                    key={index}
                                    className="group hover-lift animate-fadeIn overflow-hidden border border-green-500/20 bg-green-500/5 backdrop-blur-sm transition-all duration-500 hover:bg-green-500/10"
                                    style={{ animationDelay: `${index * 100 + 300}ms` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                                    <CardHeader className="relative pb-3 sm:pb-4">
                                        <div className="relative mb-4 sm:mb-6">
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 blur transition-opacity duration-500 group-hover:opacity-20 sm:rounded-2xl"></div>
                                            <div className="relative flex h-12 w-12 transform items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 sm:h-14 sm:w-14 sm:rounded-2xl">
                                                <IconComponent className="h-6 w-6 text-white drop-shadow-sm sm:h-7 sm:w-7" />
                                            </div>
                                        </div>
                                        <CardTitle className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-green-400 sm:text-xl">
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative">
                                        <CardDescription className="text-sm leading-relaxed text-gray-300 sm:text-base">
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16 sm:py-20 lg:py-32">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-green-600/10 via-emerald-600/5 to-green-600/10"></div>
                    <div className="animate-float absolute top-10 right-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl sm:top-20 sm:h-96 sm:w-96"></div>
                    <div className="animate-float absolute bottom-10 left-1/4 h-56 w-56 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-600/20 blur-3xl delay-1000 sm:bottom-20 sm:h-80 sm:w-80"></div>
                </div>

                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center sm:mb-16 lg:mb-20">
                        <div className="animate-fadeIn">
                            <Badge
                                variant="outline"
                                className="mb-4 border-green-400/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-300 backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2 sm:text-sm"
                            >
                                ⭐ What our users say
                            </Badge>
                        </div>
                        <h2 className="animate-fadeIn mb-4 text-3xl font-bold text-white delay-100 sm:mb-6 sm:text-4xl lg:text-5xl">
                            Trusted by
                            <span className="mt-1 block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent sm:mt-2">
                                crypto professionals
                            </span>
                        </h2>
                        <p className="animate-fadeIn mx-auto max-w-2xl px-4 text-base text-gray-300 delay-200 sm:px-0 sm:text-lg lg:text-xl">
                            Join thousands of traders who rely on our platform for their crypto success
                        </p>
                    </div>

                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card
                                key={index}
                                className="group hover-lift animate-fadeIn overflow-hidden border border-green-500/20 bg-green-500/5 backdrop-blur-md transition-all duration-500 hover:bg-green-500/10"
                                style={{ animationDelay: `${index * 150 + 300}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                                <div className="absolute inset-0 rounded-lg ring-1 ring-green-500/20 transition-all duration-500 group-hover:ring-green-400/30"></div>

                                <CardContent className="relative p-8">
                                    <div className="mb-6">
                                        <Quote className="mb-4 h-8 w-8 text-green-400 opacity-60" />
                                        <blockquote className="text-lg leading-relaxed text-gray-200 italic">"{testimonial.content}"</blockquote>
                                    </div>

                                    <div className="flex items-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 blur transition-opacity duration-500 group-hover:opacity-30"></div>
                                            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-lg font-bold text-white shadow-lg">
                                                {testimonial.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="font-semibold text-white transition-colors duration-300 group-hover:text-green-300">
                                                {testimonial.name}
                                            </div>
                                            <div className="text-sm text-gray-400">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 py-16 sm:py-20 lg:py-32">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-black/10 via-transparent to-black/10"></div>
                    <div className="animate-float absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl sm:h-96 sm:w-96"></div>
                    <div className="animate-float absolute right-1/4 bottom-1/4 h-56 w-56 rounded-full bg-white/5 blur-3xl delay-1000 sm:h-80 sm:w-80"></div>
                </div>

                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="animate-fadeIn">
                            <Badge
                                variant="outline"
                                className="mb-4 border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2 sm:text-sm"
                            >
                                🚀 Start your journey
                            </Badge>
                        </div>
                        <h2 className="animate-fadeIn mb-4 text-3xl font-bold text-white delay-100 sm:mb-6 sm:text-4xl lg:text-5xl">
                            Ready to revolutionize your
                            <span className="mt-1 block text-green-100 sm:mt-2">crypto trading?</span>
                        </h2>
                        <p className="animate-fadeIn mx-auto mb-8 max-w-2xl px-4 text-base leading-relaxed text-green-100 delay-200 sm:mb-12 sm:px-0 sm:text-lg lg:text-xl">
                            Join thousands of smart investors who are already using AI to maximize their returns. Start your free trial today and
                            experience the future of crypto trading.
                        </p>

                        <div className="animate-fadeIn flex flex-col gap-4 px-4 delay-300 sm:flex-row sm:justify-center sm:gap-6 sm:px-0">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="hover:shadow-3xl group h-12 w-full transform border-0 bg-white px-6 text-base font-semibold text-green-600 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-green-50 sm:h-16 sm:w-auto sm:px-10 sm:text-lg"
                                >
                                    <span className="mr-2">Get Started for Free</span>
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 sm:h-5 sm:w-5" />
                                </Button>
                            </Link>
                            <Link href="/pricing" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-12 w-full transform border-2 border-white/30 bg-white/10 px-6 text-base font-semibold text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20 hover:shadow-2xl sm:h-16 sm:w-auto sm:px-10 sm:text-lg"
                                >
                                    View Pricing
                                </Button>
                            </Link>
                        </div>

                        <div className="animate-fadeIn mt-12 flex flex-col flex-wrap items-center justify-center gap-4 text-green-100 delay-500 sm:mt-16 sm:flex-row sm:gap-6 lg:gap-8">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-300 sm:h-5 sm:w-5" />
                                <span className="text-xs sm:text-sm">No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-300 sm:h-5 sm:w-5" />
                                <span className="text-xs sm:text-sm">14-day free trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-300 sm:h-5 sm:w-5" />
                                <span className="text-xs sm:text-sm">Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative border-t border-green-500/20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-3xl"></div>
                    <div className="absolute right-1/4 bottom-0 h-48 w-48 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-600/10 blur-3xl"></div>
                </div>

                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-5">
                        {/* Brand Section */}
                        <div className="lg:col-span-2">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 opacity-75 blur"></div>
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                                        <Brain className="h-5 w-5 text-white drop-shadow-sm" />
                                    </div>
                                </div>
                                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-2xl font-bold text-transparent">
                                    CryptoAdvisor
                                </span>
                            </div>
                            <p className="mb-8 max-w-md text-lg leading-relaxed text-gray-300">
                                The most advanced AI-powered cryptocurrency investment platform. Make smarter decisions with professional-grade tools
                                and real-time insights.
                            </p>

                            {/* Social Links */}
                            <div className="flex gap-4">
                                <div className="group cursor-pointer">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-green-400/30 group-hover:bg-green-500/20">
                                        <Globe className="h-5 w-5 text-green-400" />
                                    </div>
                                </div>
                                <div className="group cursor-pointer">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-green-400/30 group-hover:bg-green-500/20">
                                        <Mail className="h-5 w-5 text-green-400" />
                                    </div>
                                </div>
                                <div className="group cursor-pointer">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-green-400/30 group-hover:bg-green-500/20">
                                        <Phone className="h-5 w-5 text-green-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h3 className="mb-6 text-lg font-bold text-white">Product</h3>
                            <div className="space-y-3">
                                <Link href="/features" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        Features
                                    </span>
                                </Link>
                                <Link href="/pricing" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        Pricing
                                    </span>
                                </Link>
                                <Link href="/dashboard" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        Dashboard
                                    </span>
                                </Link>
                                <Link href="/api" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        API
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Company Links */}
                        <div>
                            <h3 className="mb-6 text-lg font-bold text-white">Company</h3>
                            <div className="space-y-3">
                                <Link href="/about" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        About
                                    </span>
                                </Link>
                                <Link href="/contact" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        Contact
                                    </span>
                                </Link>
                                <Link href="/blog" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        Blog
                                    </span>
                                </Link>
                                <Link href="/careers" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        Careers
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Legal Links */}
                        <div>
                            <h3 className="mb-6 text-lg font-bold text-white">Legal</h3>
                            <div className="space-y-3">
                                <Link href="/privacy" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        Privacy Policy
                                    </span>
                                </Link>
                                <Link href="/terms" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        Terms of Service
                                    </span>
                                </Link>
                                <Link href="/security" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        Security
                                    </span>
                                </Link>
                                <Link href="/compliance" className="group block text-gray-300 transition-colors duration-200 hover:text-green-400">
                                    <span className="border-b border-transparent transition-all duration-200 group-hover:border-green-400/50">
                                        Compliance
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter Signup */}
                    <div className="mt-16 border-t border-green-500/20 pt-12">
                        <div className="mb-12 text-center">
                            <h3 className="mb-4 text-2xl font-bold text-white">Stay Updated</h3>
                            <p className="mx-auto mb-6 max-w-md text-gray-300">
                                Get the latest crypto insights and platform updates delivered to your inbox.
                            </p>
                            <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
                                <div className="flex-1">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-white placeholder-gray-400 transition-all duration-200 focus:border-green-400 focus:bg-green-500/20 focus:outline-none"
                                    />
                                </div>
                                <Button className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:scale-105 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/25">
                                    Subscribe
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-green-500/20 pt-8">
                        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div className="flex flex-col items-center gap-6 text-sm sm:flex-row">
                                <p className="text-gray-400">© 2025 CryptoAdvisor. All rights reserved.</p>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <span>Made with</span>
                                    <span className="animate-pulse text-red-400">❤️</span>
                                    <span>for crypto investors</span>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                    <span>SOC 2 Compliant</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                    <span>256-bit SSL</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                    <span>GDPR Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
