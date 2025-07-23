import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, Brain, Clock, Lightbulb, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface AISuggestion {
    id: number;
    symbol: string;
    suggestion: string;
    model_used: string;
    risk_level: string;
    time_horizon: string;
    created_at: string;
}

interface AIAdvisorProps {
    riskLevels: string[];
    timeHorizons: string[];
    recentSuggestions: AISuggestion[];
    availableSymbols: string[];
    flash?: {
        success?: string;
        error?: string;
        advice?: {
            structured_advice: Record<string, unknown>;
            suggestion: string;
            model_used: string;
            confidence_score: number;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'AI Advisor', href: '/advisor' },
];

export default function AIAdvisor({ riskLevels, timeHorizons, recentSuggestions, availableSymbols, flash }: AIAdvisorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [marketSentiment, setMarketSentiment] = useState(null);
    const [loadingSentiment, setLoadingSentiment] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        symbol: '',
        risk_level: 'moderate',
        time_horizon: 'medium',
    });

    const portfolioForm = useForm({
        risk_level: 'moderate',
    });

    const handleGenerateAdvice = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        post('/advisor/generate', {
            onSuccess: () => {
                setIsGenerating(false);
            },
            onError: () => {
                setIsGenerating(false);
            },
        });
    };

    const handleAnalyzePortfolio = (e: React.FormEvent) => {
        e.preventDefault();
        portfolioForm.post('/advisor/analyze-portfolio', {
            onSuccess: () => {
                // Success handled by flash message
            },
            onError: () => {
                // Error handled by flash message
            },
        });
    };

    const fetchMarketSentiment = async () => {
        setLoadingSentiment(true);
        try {
            const response = await fetch('/advisor/market-sentiment');
            const data = await response.json();
            setMarketSentiment(data);
        } catch {
            // Error handled silently
        } finally {
            setLoadingSentiment(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AI Crypto Advisor" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
                        <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">AI Crypto Advisor</h1>
                        <p className="text-sm text-muted-foreground">Get intelligent investment advice powered by AI</p>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-200">{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-200">{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Generate AI Advice */}
                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50 dark:from-blue-950/20 dark:to-purple-950/20" />
                        <CardHeader className="relative">
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                Generate Investment Advice
                            </CardTitle>
                            <CardDescription>Get AI-powered recommendations for specific cryptocurrencies</CardDescription>
                        </CardHeader>
                        <CardContent className="relative">
                            <form onSubmit={handleGenerateAdvice} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="symbol">Cryptocurrency Symbol</Label>
                                    <Select value={data.symbol} onValueChange={(value) => setData('symbol', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a cryptocurrency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSymbols.map((symbol) => (
                                                <SelectItem key={symbol} value={symbol}>
                                                    {symbol}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.symbol && <p className="text-sm text-red-600">{errors.symbol}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="risk_level">Risk Level</Label>
                                        <Select value={data.risk_level} onValueChange={(value) => setData('risk_level', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {riskLevels.map((level) => (
                                                    <SelectItem key={level} value={level}>
                                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="time_horizon">Time Horizon</Label>
                                        <Select value={data.time_horizon} onValueChange={(value) => setData('time_horizon', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeHorizons.map((horizon) => (
                                                    <SelectItem key={horizon} value={horizon}>
                                                        {horizon.charAt(0).toUpperCase() + horizon.slice(1)}-term
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button type="submit" disabled={processing || isGenerating || !data.symbol} className="w-full">
                                    {isGenerating ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="mr-2 h-4 w-4" />
                                            Generate AI Advice
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Portfolio Analysis */}
                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50 dark:from-green-950/20 dark:to-emerald-950/20" />
                        <CardHeader className="relative">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Portfolio Analysis
                            </CardTitle>
                            <CardDescription>Analyze your current portfolio and get recommendations</CardDescription>
                        </CardHeader>
                        <CardContent className="relative">
                            <form onSubmit={handleAnalyzePortfolio} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio_risk_level">Risk Level</Label>
                                    <Select
                                        value={portfolioForm.data.risk_level}
                                        onValueChange={(value) => portfolioForm.setData('risk_level', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {riskLevels.map((level) => (
                                                <SelectItem key={level} value={level}>
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button type="submit" disabled={portfolioForm.processing} className="w-full" variant="outline">
                                    {portfolioForm.processing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-background" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            Analyze Portfolio
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Market Sentiment */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-orange-600" />
                            Market Sentiment
                        </CardTitle>
                        <CardDescription>Current market analysis and sentiment overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Get real-time sentiment analysis of the top cryptocurrencies</p>
                            <Button onClick={fetchMarketSentiment} disabled={loadingSentiment} variant="outline" size="sm">
                                {loadingSentiment ? (
                                    <>
                                        <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-foreground border-t-background" />
                                        Loading...
                                    </>
                                ) : (
                                    'Fetch Sentiment'
                                )}
                            </Button>
                        </div>

                        {marketSentiment && (
                            <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                                <pre className="text-sm whitespace-pre-wrap text-foreground">{JSON.stringify(marketSentiment, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* AI Advice Result */}
                {flash?.advice && (
                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                <Lightbulb className="h-5 w-5" />
                                AI Investment Advice
                                <Badge variant="secondary" className="ml-auto">
                                    {flash.advice.model_used}
                                </Badge>
                            </CardTitle>
                            {flash.advice.confidence_score && (
                                <CardDescription className="text-blue-700 dark:text-blue-300">
                                    Confidence Score: {flash.advice.confidence_score}%
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="whitespace-pre-wrap text-blue-900 dark:text-blue-100">{flash.advice.suggestion}</div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Suggestions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            Recent AI Suggestions
                        </CardTitle>
                        <CardDescription>Your latest AI-generated investment advice</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentSuggestions.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Brain className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                <p>No AI suggestions yet</p>
                                <p className="text-sm">Generate your first advice above!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentSuggestions.map((suggestion) => (
                                    <div key={suggestion.id} className="space-y-2 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{suggestion.symbol}</Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                    {suggestion.risk_level}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                    {suggestion.time_horizon}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(suggestion.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="line-clamp-3 text-sm text-foreground">{suggestion.suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
