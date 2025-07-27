import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Head, Link, useForm } from '@inertiajs/react';
import { Brain, Clock, Globe, Mail, MapPin, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/contact', {
            onSuccess: () => {
                toast.success("Message sent successfully! We'll get back to you within 24 hours.");
                reset();
            },
            onError: () => {
                toast.error('Failed to send message. Please try again.');
            },
        });
    };

    return (
        <>
            <Head title="Contact - CryptoAdvisor" />

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
                        <Link href="/contact" className="text-sm font-medium text-blue-600">
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
                            Contact Us
                        </Badge>
                        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Get in
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Touch</span>
                        </h1>
                        <p className="mb-8 text-xl text-gray-600">
                            Have questions about CryptoAdvisor? We're here to help. Reach out to our team and we'll respond within 24 hours.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="pb-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-12 lg:grid-cols-2">
                            {/* Contact Form */}
                            <div>
                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-2xl">Send us a message</CardTitle>
                                        <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="name">Name *</Label>
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Your full name"
                                                        required
                                                    />
                                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                                </div>
                                                <div>
                                                    <Label htmlFor="email">Email *</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="your@email.com"
                                                        required
                                                    />
                                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="subject">Subject *</Label>
                                                <Input
                                                    id="subject"
                                                    type="text"
                                                    value={data.subject}
                                                    onChange={(e) => setData('subject', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="What's this about?"
                                                    required
                                                />
                                                {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="message">Message *</Label>
                                                <Textarea
                                                    id="message"
                                                    value={data.message}
                                                    onChange={(e) => setData('message', e.target.value)}
                                                    className="mt-1 min-h-[120px]"
                                                    placeholder="Tell us more about your question or how we can help..."
                                                    required
                                                />
                                                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                                            </div>

                                            <Button type="submit" size="lg" className="w-full" disabled={processing}>
                                                {processing ? (
                                                    <>
                                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Send Message
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="mb-6 text-2xl font-bold text-gray-900">Get in touch</h3>
                                    <p className="mb-8 text-lg text-gray-600">
                                        We're here to help! Whether you have questions about our platform, need technical support, or want to learn
                                        more about our AI capabilities, don't hesitate to reach out.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <Card className="border-0 bg-gray-50">
                                        <CardContent className="flex items-start gap-4 p-6">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                                <Mail className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Email us</h4>
                                                <p className="text-gray-600">Send us an email and we'll respond within 24 hours</p>
                                                <p className="mt-1 font-medium text-blue-600">support@cryptoadvisor.com</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 bg-gray-50">
                                        <CardContent className="flex items-start gap-4 p-6">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                                <Phone className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Call us</h4>
                                                <p className="text-gray-600">Monday to Friday from 9am to 6pm EST</p>
                                                <p className="mt-1 font-medium text-green-600">+1 (555) 123-4567</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 bg-gray-50">
                                        <CardContent className="flex items-start gap-4 p-6">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                                <MapPin className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Visit us</h4>
                                                <p className="text-gray-600">Come say hello at our headquarters</p>
                                                <p className="mt-1 font-medium text-purple-600">
                                                    123 Tech Street
                                                    <br />
                                                    San Francisco, CA 94105
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 bg-gray-50">
                                        <CardContent className="flex items-start gap-4 p-6">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                                                <Clock className="h-6 w-6 text-orange-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Business hours</h4>
                                                <p className="text-gray-600">
                                                    Monday - Friday: 9:00 AM - 6:00 PM EST
                                                    <br />
                                                    Saturday: 10:00 AM - 4:00 PM EST
                                                    <br />
                                                    Sunday: Closed
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-gray-50 py-20">
                <div className="container px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                            <p className="text-lg text-gray-600">Quick answers to common questions</p>
                        </div>

                        <div className="space-y-8">
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">How accurate are the AI predictions?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Our AI models achieve 95%+ accuracy by analyzing vast amounts of market data, social sentiment, and technical
                                        indicators. However, all investments carry risk and past performance doesn't guarantee future results.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Is my data secure?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Absolutely. We use bank-level encryption and security measures to protect your data. We never share your
                                        personal information with third parties and all data is stored securely in encrypted databases.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Can I cancel my subscription anytime?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Yes, you can cancel your subscription at any time with no cancellation fees. You'll continue to have access to
                                        all features until the end of your current billing period.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Do you offer customer support?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        Yes! We offer 24/7 email support and phone support during business hours. Our team of experts is always ready
                                        to help you make the most of our platform.
                                    </p>
                                </CardContent>
                            </Card>
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
