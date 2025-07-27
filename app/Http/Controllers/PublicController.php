<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicController extends Controller
{
    /**
     * Show the home page
     */
    public function home(): Response
    {
        return Inertia::render('public/Home', [
            'features' => [
                [
                    'title' => 'AI-Powered Analysis',
                    'description' => 'Get professional investment insights powered by advanced artificial intelligence and real-time market data.',
                    'icon' => 'brain',
                ],
                [
                    'title' => 'Tax Optimization',
                    'description' => 'Comprehensive tax reporting with automated capital gains calculations and tax-loss harvesting suggestions.',
                    'icon' => 'calculator',
                ],
                [
                    'title' => 'Real-Time Alerts',
                    'description' => 'Smart notifications for price movements, portfolio changes, and market opportunities.',
                    'icon' => 'bell',
                ],
                [
                    'title' => 'Portfolio Management',
                    'description' => 'Advanced portfolio tracking with performance analytics and risk assessment tools.',
                    'icon' => 'chart',
                ],
            ],
            'stats' => [
                ['label' => 'Active Users', 'value' => '10,000+'],
                ['label' => 'Cryptocurrencies Tracked', 'value' => '500+'],
                ['label' => 'AI Analyses Generated', 'value' => '50,000+'],
                ['label' => 'User Satisfaction', 'value' => '98%'],
            ],
            'testimonials' => [
                [
                    'name' => 'Sarah Chen',
                    'role' => 'Portfolio Manager',
                    'content' => 'The AI insights have helped me optimize my crypto portfolio and save thousands on taxes.',
                    'avatar' => '/images/testimonials/sarah.jpg',
                ],
                [
                    'name' => 'Marcus Rodriguez',
                    'role' => 'Day Trader',
                    'content' => 'Real-time alerts and market sentiment analysis give me the edge I need in volatile markets.',
                    'avatar' => '/images/testimonials/marcus.jpg',
                ],
                [
                    'name' => 'Jennifer Kim',
                    'role' => 'Investor',
                    'content' => 'Finally, a platform that handles both investment tracking and tax compliance seamlessly.',
                    'avatar' => '/images/testimonials/jennifer.jpg',
                ],
            ],
        ]);
    }

    /**
     * Show the about page
     */
    public function about(): Response
    {
        return Inertia::render('public/About', [
            'mission' => 'To democratize professional-grade cryptocurrency investment tools and make them accessible to everyone.',
            'vision' => 'A world where every investor has access to AI-powered insights and comprehensive financial tools.',
            'values' => [
                [
                    'title' => 'Transparency',
                    'description' => 'Clear, honest communication about risks, fees, and market conditions.',
                ],
                [
                    'title' => 'Innovation',
                    'description' => 'Continuous improvement through cutting-edge technology and user feedback.',
                ],
                [
                    'title' => 'Security',
                    'description' => 'Bank-level security to protect your data and investment information.',
                ],
                [
                    'title' => 'Education',
                    'description' => 'Empowering users with knowledge and tools to make informed decisions.',
                ],
            ],
            'team' => [
                [
                    'name' => 'Alex Thompson',
                    'role' => 'CEO & Founder',
                    'bio' => 'Former Goldman Sachs quant with 10+ years in fintech and blockchain.',
                    'avatar' => '/images/team/alex.jpg',
                ],
                [
                    'name' => 'Dr. Lisa Wang',
                    'role' => 'CTO',
                    'bio' => 'PhD in Machine Learning, former Google engineer specializing in financial AI.',
                    'avatar' => '/images/team/lisa.jpg',
                ],
                [
                    'name' => 'David Chen',
                    'role' => 'Head of Product',
                    'bio' => 'Product lead at Coinbase, expert in cryptocurrency user experience.',
                    'avatar' => '/images/team/david.jpg',
                ],
            ],
        ]);
    }

    /**
     * Show the contact page
     */
    public function contact(): Response
    {
        return Inertia::render('public/Contact', [
            'contactInfo' => [
                [
                    'type' => 'email',
                    'label' => 'Email',
                    'value' => 'hello@cryptoadvisor.com',
                    'icon' => 'mail',
                ],
                [
                    'type' => 'phone',
                    'label' => 'Phone',
                    'value' => '+1 (555) 123-4567',
                    'icon' => 'phone',
                ],
                [
                    'type' => 'address',
                    'label' => 'Address',
                    'value' => '123 Innovation Drive, Tech City, TC 12345',
                    'icon' => 'map-pin',
                ],
            ],
            'departments' => [
                ['label' => 'General Inquiry', 'value' => 'general'],
                ['label' => 'Technical Support', 'value' => 'support'],
                ['label' => 'Sales & Partnerships', 'value' => 'sales'],
                ['label' => 'Press & Media', 'value' => 'press'],
            ],
        ]);
    }

    /**
     * Handle contact form submission
     */
    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'department' => 'required|string|in:general,support,sales,press',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        // TODO: Send email notification to appropriate department
        // TODO: Store in database for tracking
        // TODO: Send auto-reply to user

        return back()->with('success', 'Thank you for your message! We\'ll get back to you within 24 hours.');
    }

    /**
     * Show the pricing page
     */
    public function pricing(): Response
    {
        return Inertia::render('public/Pricing', [
            'plans' => [
                [
                    'name' => 'Starter',
                    'price' => 0,
                    'period' => 'Free Forever',
                    'description' => 'Perfect for getting started with crypto investing',
                    'features' => [
                        'Track up to 10 cryptocurrencies',
                        'Basic price alerts',
                        'Portfolio overview',
                        'Community support',
                    ],
                    'limitations' => [
                        'Limited AI analyses (5/month)',
                        'Basic tax reports',
                    ],
                    'cta' => 'Get Started Free',
                    'popular' => false,
                ],
                [
                    'name' => 'Pro',
                    'price' => 29,
                    'period' => 'per month',
                    'description' => 'Advanced tools for serious crypto investors',
                    'features' => [
                        'Unlimited cryptocurrency tracking',
                        'Advanced AI investment analysis',
                        'Real-time market sentiment',
                        'Tax optimization tools',
                        'Portfolio rebalancing suggestions',
                        'Priority email support',
                        'API access',
                    ],
                    'limitations' => [],
                    'cta' => 'Start Pro Trial',
                    'popular' => true,
                ],
                [
                    'name' => 'Enterprise',
                    'price' => 99,
                    'period' => 'per month',
                    'description' => 'Complete solution for professional traders and firms',
                    'features' => [
                        'Everything in Pro',
                        'Advanced tax reporting & compliance',
                        'Custom AI model training',
                        'White-label solutions',
                        'Dedicated account manager',
                        'Phone support',
                        'Custom integrations',
                        'Team collaboration tools',
                    ],
                    'limitations' => [],
                    'cta' => 'Contact Sales',
                    'popular' => false,
                ],
            ],
            'faq' => [
                [
                    'question' => 'Can I upgrade or downgrade my plan anytime?',
                    'answer' => 'Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle.',
                ],
                [
                    'question' => 'Do you offer refunds?',
                    'answer' => 'We offer a 30-day money-back guarantee for all paid plans. No questions asked.',
                ],
                [
                    'question' => 'What payment methods do you accept?',
                    'answer' => 'We accept all major credit cards, PayPal, and cryptocurrency payments.',
                ],
                [
                    'question' => 'Is my data secure?',
                    'answer' => 'Yes, we use bank-level encryption and never store your exchange API keys or private keys.',
                ],
            ],
        ]);
    }

    /**
     * Show the features page
     */
    public function features(): Response
    {
        return Inertia::render('public/Features', [
            'categories' => [
                [
                    'title' => 'AI-Powered Insights',
                    'description' => 'Advanced artificial intelligence analyzes market data to provide personalized investment recommendations.',
                    'features' => [
                        [
                            'name' => 'Smart Analysis',
                            'description' => 'AI evaluates market trends, news sentiment, and technical indicators to generate investment insights.',
                            'icon' => 'brain',
                        ],
                        [
                            'name' => 'Risk Assessment',
                            'description' => 'Personalized risk profiling based on your investment goals and market conditions.',
                            'icon' => 'shield',
                        ],
                        [
                            'name' => 'Market Sentiment',
                            'description' => 'Real-time sentiment analysis from news, social media, and market data.',
                            'icon' => 'trending-up',
                        ],
                    ],
                ],
                [
                    'title' => 'Portfolio Management',
                    'description' => 'Comprehensive tools to track, analyze, and optimize your cryptocurrency investments.',
                    'features' => [
                        [
                            'name' => 'Real-Time Tracking',
                            'description' => 'Live portfolio valuation with detailed performance metrics and analytics.',
                            'icon' => 'activity',
                        ],
                        [
                            'name' => 'Rebalancing Alerts',
                            'description' => 'Smart notifications when your portfolio deviates from target allocations.',
                            'icon' => 'balance-scale',
                        ],
                        [
                            'name' => 'Performance Analytics',
                            'description' => 'Detailed charts and metrics to track your investment performance over time.',
                            'icon' => 'bar-chart',
                        ],
                    ],
                ],
                [
                    'title' => 'Tax Optimization',
                    'description' => 'Professional-grade tax tools to minimize your tax burden and ensure compliance.',
                    'features' => [
                        [
                            'name' => 'Tax-Loss Harvesting',
                            'description' => 'Automated suggestions to optimize your tax liability through strategic selling.',
                            'icon' => 'calculator',
                        ],
                        [
                            'name' => 'Form Generation',
                            'description' => 'Automatic generation of IRS forms including Form 8949 and Schedule D.',
                            'icon' => 'file-text',
                        ],
                        [
                            'name' => 'Capital Gains Tracking',
                            'description' => 'Precise tracking of short-term and long-term capital gains and losses.',
                            'icon' => 'trending-up',
                        ],
                    ],
                ],
            ],
        ]);
    }

    /**
     * Show the privacy policy page
     */
    public function privacy(): Response
    {
        return Inertia::render('public/Privacy');
    }

    /**
     * Show the terms of service page
     */
    public function terms(): Response
    {
        return Inertia::render('public/Terms');
    }
}
