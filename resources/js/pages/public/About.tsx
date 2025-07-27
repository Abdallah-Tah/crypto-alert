import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Brain, Globe, Linkedin, Mail, Phone, Shield, Target, Users, Zap } from 'lucide-react';

interface TeamMember {
    name: string;
    role: string;
    bio: string;
    image: string;
}

interface AboutProps {
    team: TeamMember[];
}

export default function About({ team }: AboutProps) {
    return (
        <>
            <Head title="About - CryptoAdvisor" />

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
                        <Link href="/about" className="text-sm font-medium text-blue-600">
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
                            About CryptoAdvisor
                        </Badge>
                        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Democratizing
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Smart Investing</span>
                        </h1>
                        <p className="mb-8 text-xl text-gray-600">
                            We believe everyone deserves access to institutional-grade investment tools. Our mission is to level the playing field
                            with AI-powered insights and professional analytics.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="bg-gray-50 py-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                            <div>
                                <h2 className="mb-6 text-3xl font-bold text-gray-900">Our Mission</h2>
                                <p className="mb-6 text-lg text-gray-600">
                                    The cryptocurrency market moves fast, and information asymmetry can cost investors millions. We're here to change
                                    that by providing retail investors with the same tools and insights that institutional investors have used for
                                    years.
                                </p>
                                <p className="mb-8 text-lg text-gray-600">
                                    Through advanced AI analysis, comprehensive tax tools, and real-time market intelligence, we're making
                                    professional-grade investing accessible to everyone.
                                </p>
                                <div className="flex gap-4">
                                    <Link href="/register">
                                        <Button size="lg">
                                            Join Our Mission
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 rotate-3 transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"></div>
                                <div className="relative rounded-lg bg-white p-8 shadow-lg">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                                <Target className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Accuracy</h3>
                                                <p className="text-sm text-gray-600">AI-powered insights with 95%+ accuracy</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                                <Shield className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Security</h3>
                                                <p className="text-sm text-gray-600">Bank-level security for your data</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                                <Zap className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Speed</h3>
                                                <p className="text-sm text-gray-600">Real-time analysis and alerts</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20">
                <div className="container px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Our Values</h2>
                        <p className="text-lg text-gray-600">The principles that guide everything we do</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-4">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle className="text-xl">Accessibility</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    Professional-grade tools should be available to everyone, not just institutional investors. We're breaking down
                                    barriers to smart investing.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-4">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-700">
                                    <Brain className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle className="text-xl">Innovation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    We're constantly pushing the boundaries of what's possible with AI and machine learning to provide better insights
                                    and predictions.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-4">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-700">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle className="text-xl">Transparency</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    No hidden fees, no black boxes. We believe in clear communication and transparent methodologies in everything we
                                    do.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="bg-gray-50 py-20">
                <div className="container px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Meet Our Team</h2>
                        <p className="text-lg text-gray-600">The experts behind CryptoAdvisor's cutting-edge technology</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {team.map((member, index) => (
                            <Card key={index} className="border-0 shadow-lg">
                                <CardContent className="pt-6">
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                                        <span className="text-2xl font-bold text-white">
                                            {member.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="mb-1 text-lg font-semibold text-gray-900">{member.name}</h3>
                                        <p className="mb-3 text-sm font-medium text-blue-600">{member.role}</p>
                                        <p className="mb-4 text-sm text-gray-600">{member.bio}</p>
                                        <div className="flex justify-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Linkedin className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">Our Impact</h2>
                            <p className="text-lg text-gray-600">Numbers that show the difference we're making</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            <div className="text-center">
                                <div className="mb-2 text-3xl font-bold text-gray-900">50K+</div>
                                <div className="text-sm text-gray-600">Active Users</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-3xl font-bold text-gray-900">$2B+</div>
                                <div className="text-sm text-gray-600">Assets Analyzed</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-3xl font-bold text-gray-900">95%</div>
                                <div className="text-sm text-gray-600">Accuracy Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-3xl font-bold text-gray-900">24/7</div>
                                <div className="text-sm text-gray-600">Market Monitoring</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-4 text-3xl font-bold text-white">Ready to join thousands of smart investors?</h2>
                        <p className="mb-8 text-lg text-blue-100">Start making better investment decisions with AI-powered insights today</p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Link href="/register">
                                <Button size="lg" variant="secondary" className="h-12 px-8">
                                    Get Started for Free
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button size="lg" variant="outline" className="h-12 border-white px-8 text-white hover:bg-white hover:text-blue-600">
                                    Contact Us
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
