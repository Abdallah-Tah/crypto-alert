import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertTriangle, Brain, ChevronLeft, ChevronRight, Clock, Eye, Lightbulb, Search, Sparkles, Target, TrendingUp, X } from 'lucide-react';
import { useMemo, useState } from 'react';

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
    portfolioSymbols: string[];
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

export default function AIAdvisor({ riskLevels, timeHorizons, recentSuggestions, availableSymbols, portfolioSymbols, flash }: AIAdvisorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [marketSentiment, setMarketSentiment] = useState(null);
    const [loadingSentiment, setLoadingSentiment] = useState(false);
    const [analysisMode, setAnalysisMode] = useState<'single' | 'portfolio' | 'multi-select'>('single');
    const [selectedPortfolioCoins, setSelectedPortfolioCoins] = useState<string[]>([]);

    // Table state management
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof AISuggestion>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Process and filter data for table
    const filteredAndSortedData = useMemo(() => {
        const filtered = recentSuggestions.filter(
            (suggestion) =>
                suggestion.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                suggestion.suggestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                suggestion.risk_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                suggestion.time_horizon.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        // Sort data
        filtered.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (sortField === 'created_at') {
                const aDate = new Date(aValue as string).getTime();
                const bDate = new Date(bValue as string).getTime();
                return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return 0;
        });

        return filtered;
    }, [recentSuggestions, searchTerm, sortField, sortDirection]);

    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Sorting handler
    const handleSort = (field: keyof AISuggestion) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    const { data, setData, processing, errors } = useForm({
        symbol: '',
        risk_level: 'moderate',
        time_horizon: 'medium',
        selected_coins: [] as string[],
        analysis_mode: 'single',
    });

    const portfolioForm = useForm({
        risk_level: 'moderate',
    });

    const handleGenerateAdvice = (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);

        // Prepare the data to submit
        const submitData = {
            symbol: data.symbol,
            risk_level: data.risk_level,
            time_horizon: data.time_horizon,
            selected_coins: analysisMode === 'multi-select' ? selectedPortfolioCoins : [],
            analysis_mode: analysisMode,
        };

        // Use router.post to submit with custom data
        router.post('/advisor/generate', submitData, {
            onSuccess: () => {
                setIsGenerating(false);
            },
            onError: () => {
                setIsGenerating(false);
            },
        });
    };

    const toggleCoinSelection = (coin: string) => {
        setSelectedPortfolioCoins((prev) => (prev.includes(coin) ? prev.filter((c) => c !== coin) : [...prev, coin]));
    };

    const removeCoin = (coin: string) => {
        setSelectedPortfolioCoins((prev) => prev.filter((c) => c !== coin));
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

    // helper to convert keys to Start Case
    // Text formatting function for analysis content
    const formatAnalysisText = (text: string) => {
        if (!text) return '';

        // Function to convert markdown to HTML
        const convertMarkdownToHTML = (text: string) => {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic text-foreground">$1</em>')
                .replace(/`(.*?)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-sm">$1</code>');
        };

        // Split text into lines and process each
        const lines = text.split('\n');
        const formattedSections: React.ReactElement[] = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            if (!trimmedLine) {
                // Empty line - add spacing
                formattedSections.push(<div key={`space-${index}`} className="h-2" />);
                return;
            }

            // Handle headers (lines starting with #)
            if (trimmedLine.startsWith('##')) {
                const headerText = trimmedLine.replace(/^#+\s*/, '');
                formattedSections.push(
                    <h3 key={`header-${index}`} className="mt-4 mb-2 border-b border-border pb-1 text-lg font-bold text-blue-700 dark:text-blue-300">
                        {headerText}
                    </h3>,
                );
            } else if (trimmedLine.startsWith('#')) {
                const headerText = trimmedLine.replace(/^#+\s*/, '');
                formattedSections.push(
                    <h2 key={`header-${index}`} className="mt-5 mb-3 text-xl font-bold text-blue-700 dark:text-blue-300">
                        {headerText}
                    </h2>,
                );
            }
            // Handle bullet points
            else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                const bulletText = trimmedLine.replace(/^[-•]\s*/, '');
                const formattedBulletText = convertMarkdownToHTML(bulletText);
                formattedSections.push(
                    <div key={`bullet-${index}`} className="mb-1 ml-4 flex items-start gap-2">
                        <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
                        <span className="leading-relaxed text-foreground" dangerouslySetInnerHTML={{ __html: formattedBulletText }} />
                    </div>,
                );
            }
            // Handle key-value pairs (lines with ":")
            else if (trimmedLine.includes(':') && !trimmedLine.endsWith(':')) {
                const [key, ...valueParts] = trimmedLine.split(':');
                const value = valueParts.join(':').trim();
                const formattedKey = convertMarkdownToHTML(key.trim());
                const formattedValue = convertMarkdownToHTML(value);

                formattedSections.push(
                    <div key={`kv-${index}`} className="mb-2 flex flex-col gap-1 sm:flex-row sm:gap-3">
                        <span
                            className="min-w-fit font-semibold text-blue-700 dark:text-blue-300"
                            dangerouslySetInnerHTML={{ __html: formattedKey + ':' }}
                        />
                        <span className="text-foreground" dangerouslySetInnerHTML={{ __html: formattedValue }} />
                    </div>,
                );
            }
            // Regular paragraph text - always process for markdown
            else {
                const formattedText = convertMarkdownToHTML(trimmedLine);
                formattedSections.push(
                    <p key={`para-${index}`} className="mb-2 leading-relaxed text-foreground" dangerouslySetInnerHTML={{ __html: formattedText }} />,
                );
            }
        });

        return <div className="space-y-1">{formattedSections}</div>;
    };

    const startCase = (str: string) => str.replace(/[_-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AI Crypto Advisor" />

            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 shadow-lg">
                        <Brain className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">AI Crypto Advisor</h1>
                        <p className="text-base text-muted-foreground">
                            Professional-grade investment intelligence powered by artificial intelligence
                        </p>
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

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Generate AI Advice */}
                    <Card className="relative overflow-hidden border-0 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30" />
                        <CardHeader className="relative pb-4">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                                <div className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-2">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                Professional AI Investment Analysis
                            </CardTitle>
                            <CardDescription className="text-base leading-relaxed">
                                Advanced investment insights powered by real-time market intelligence, sentiment analysis, and technical research
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative space-y-6">
                            <form onSubmit={handleGenerateAdvice} className="space-y-6">
                                {/* Analysis Mode Selection */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Analysis Type</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <Button
                                            type="button"
                                            variant={analysisMode === 'single' ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-12 flex-col gap-1 text-xs"
                                            onClick={() => {
                                                setAnalysisMode('single');
                                                setData('analysis_mode', 'single');
                                            }}
                                        >
                                            <Target className="h-4 w-4" />
                                            Single Asset
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={analysisMode === 'portfolio' ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-12 flex-col gap-1 text-xs"
                                            onClick={() => {
                                                setAnalysisMode('portfolio');
                                                setData('analysis_mode', 'portfolio');
                                            }}
                                        >
                                            <TrendingUp className="h-4 w-4" />
                                            Full Portfolio
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={analysisMode === 'multi-select' ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-12 flex-col gap-1 text-xs"
                                            onClick={() => {
                                                setAnalysisMode('multi-select');
                                                setData('analysis_mode', 'multi-select');
                                            }}
                                        >
                                            <Lightbulb className="h-4 w-4" />
                                            Custom Selection
                                        </Button>
                                    </div>
                                </div>

                                {/* Single Coin Selection */}
                                {analysisMode === 'single' && (
                                    <div className="space-y-3">
                                        <Label htmlFor="symbol" className="text-sm font-medium">
                                            Select Cryptocurrency
                                        </Label>
                                        <Select value={data.symbol} onValueChange={(value) => setData('symbol', value)}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Choose a cryptocurrency to analyze" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Portfolio coins first */}
                                                <SelectGroup>
                                                    <SelectLabel>Your Portfolio</SelectLabel>
                                                    {portfolioSymbols.map((symbol) => (
                                                        <SelectItem key={symbol} value={symbol}>
                                                            {symbol}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                                <SelectSeparator />
                                                {/* All other symbols */}
                                                <SelectGroup>
                                                    <SelectLabel>All Cryptocurrencies</SelectLabel>
                                                    {availableSymbols
                                                        .filter((symbol) => !portfolioSymbols.includes(symbol))
                                                        .map((symbol) => (
                                                            <SelectItem key={symbol} value={symbol}>
                                                                {symbol}
                                                            </SelectItem>
                                                        ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {errors.symbol && <p className="text-sm text-red-600">{errors.symbol}</p>}
                                    </div>
                                )}

                                {/* Multi-Select Portfolio Coins */}
                                {analysisMode === 'multi-select' && (
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium">Select Portfolio Assets to Analyze</Label>
                                        <div className="space-y-3">
                                            {/* Selected coins display */}
                                            {selectedPortfolioCoins.length > 0 && (
                                                <div className="rounded-lg border bg-muted/30 p-3">
                                                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                                                        SELECTED ASSETS ({selectedPortfolioCoins.length})
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedPortfolioCoins.map((coin) => (
                                                            <Badge
                                                                key={coin}
                                                                variant="secondary"
                                                                className="flex cursor-pointer items-center gap-1.5 px-3 py-1 transition-colors hover:bg-destructive hover:text-destructive-foreground"
                                                                onClick={() => removeCoin(coin)}
                                                            >
                                                                {coin}
                                                                <X className="h-3 w-3" />
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Coin selection grid */}
                                            <div className="space-y-2">
                                                <p className="text-xs text-muted-foreground">Click to select/deselect assets from your portfolio:</p>
                                                <div className="grid max-h-40 grid-cols-3 gap-2 overflow-y-auto rounded-lg border bg-muted/20 p-3">
                                                    {portfolioSymbols.map((symbol) => (
                                                        <Button
                                                            key={symbol}
                                                            type="button"
                                                            variant={selectedPortfolioCoins.includes(symbol) ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => toggleCoinSelection(symbol)}
                                                            className="h-8 text-xs font-medium"
                                                        >
                                                            {symbol}
                                                        </Button>
                                                    ))}
                                                </div>

                                                {portfolioSymbols.length === 0 && (
                                                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center dark:border-orange-800 dark:bg-orange-950/20">
                                                        <p className="text-sm text-orange-800 dark:text-orange-200">
                                                            No assets in your portfolio yet. Add some assets to use this feature.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Analysis Information Cards */}
                                {analysisMode === 'portfolio' && (
                                    <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-blue-600 p-2">
                                                <TrendingUp className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Complete Portfolio Analysis</h4>
                                                <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                                                    Comprehensive analysis of your entire portfolio ({portfolioSymbols.length} assets) including
                                                    diversification assessment, risk evaluation, and strategic recommendations using real-time market
                                                    intelligence.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {analysisMode === 'multi-select' && selectedPortfolioCoins.length > 0 && (
                                    <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-purple-800 dark:from-purple-950/30 dark:to-pink-950/30">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-purple-600 p-2">
                                                <Target className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Targeted Asset Analysis</h4>
                                                <p className="mt-1 text-sm text-purple-800 dark:text-purple-200">
                                                    Focused analysis of {selectedPortfolioCoins.length} selected assets with detailed market research,
                                                    technical indicators, and personalized investment insights.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Enhanced Features Overview */}
                                <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-4 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-green-950/30">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="rounded-lg bg-emerald-600 p-1.5">
                                            <Sparkles className="h-3 w-3 text-white" />
                                        </div>
                                        <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">PROFESSIONAL-GRADE ANALYSIS</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs text-emerald-700 dark:text-emerald-300">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                            Real-time market intelligence
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                            News sentiment analysis
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                            Technical indicator insights
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                            Risk assessment reports
                                        </div>
                                    </div>
                                </div>

                                {/* Investment Parameters */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="risk_level" className="text-sm font-medium">
                                            Risk Tolerance
                                        </Label>
                                        <Select value={data.risk_level} onValueChange={(value) => setData('risk_level', value)}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select risk level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {riskLevels.map((level) => (
                                                    <SelectItem key={level} value={level}>
                                                        {level.charAt(0).toUpperCase() + level.slice(1)} Risk
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="time_horizon" className="text-sm font-medium">
                                            Investment Horizon
                                        </Label>
                                        <Select value={data.time_horizon} onValueChange={(value) => setData('time_horizon', value)}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select time frame" />
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

                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        isGenerating ||
                                        (analysisMode === 'single' && !data.symbol) ||
                                        (analysisMode === 'multi-select' && selectedPortfolioCoins.length === 0) ||
                                        (analysisMode === 'portfolio' && portfolioSymbols.length === 0)
                                    }
                                    className="h-12 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-base font-medium shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Analyzing Market Data...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="mr-3 h-5 w-5" />
                                            {analysisMode === 'single'
                                                ? 'Generate Professional Analysis'
                                                : analysisMode === 'portfolio'
                                                  ? 'Analyze Complete Portfolio'
                                                  : `Analyze Selected Assets (${selectedPortfolioCoins.length})`}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Quick Portfolio Analysis */}
                    <Card className="relative overflow-hidden border-0 shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 opacity-60 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30" />
                        <CardHeader className="relative pb-4">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                                <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 p-2">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                Quick Portfolio Overview
                            </CardTitle>
                            <CardDescription className="text-base leading-relaxed">
                                Get a rapid assessment of your portfolio's performance and risk profile
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative space-y-6">
                            <form onSubmit={handleAnalyzePortfolio} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="portfolio_risk_level" className="text-sm font-medium">
                                        Risk Assessment Level
                                    </Label>
                                    <Select
                                        value={portfolioForm.data.risk_level}
                                        onValueChange={(value) => portfolioForm.setData('risk_level', value)}
                                    >
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select assessment level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {riskLevels.map((level) => (
                                                <SelectItem key={level} value={level}>
                                                    {level.charAt(0).toUpperCase() + level.slice(1)} Risk Assessment
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">QUICK ANALYSIS FEATURES</p>
                                    <ul className="mt-2 space-y-1 text-xs text-emerald-600 dark:text-emerald-400">
                                        <li>• Portfolio diversification score</li>
                                        <li>• Risk-return optimization</li>
                                        <li>• Asset allocation recommendations</li>
                                    </ul>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={portfolioForm.processing}
                                    className="h-12 w-full bg-gradient-to-r from-emerald-600 to-green-600 text-base font-medium shadow-lg transition-all hover:shadow-xl"
                                    variant="default"
                                >
                                    {portfolioForm.processing ? (
                                        <>
                                            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Analyzing Portfolio...
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="mr-3 h-5 w-5" />
                                            Run Quick Analysis
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Market Intelligence */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                            <div className="rounded-lg bg-gradient-to-br from-orange-600 to-red-600 p-2">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            Market Intelligence Center
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                            Real-time market sentiment and analysis of cryptocurrency trends
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                            <div>
                                <h4 className="font-medium">Live Market Sentiment</h4>
                                <p className="text-sm text-muted-foreground">Get current sentiment analysis for top cryptocurrencies</p>
                            </div>
                            <Button onClick={fetchMarketSentiment} disabled={loadingSentiment} variant="outline" size="default" className="min-w-32">
                                {loadingSentiment ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-background" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Target className="mr-2 h-4 w-4" />
                                        Fetch Data
                                    </>
                                )}
                            </Button>
                        </div>

                        {marketSentiment && (
                            <div className="rounded-xl border bg-gradient-to-br from-slate-50 to-gray-50 p-6 dark:from-slate-950/50 dark:to-gray-950/50">
                                <h4 className="mb-3 flex items-center gap-2 font-semibold">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    Market Analysis Results
                                </h4>
                                <div className="rounded-lg border bg-white/50 p-4 dark:bg-black/20">
                                    <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                        {JSON.stringify(marketSentiment, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Investment Analysis Results */}
                {flash?.advice && (
                    <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-2">
                                        <Lightbulb className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                                            Professional Investment Analysis
                                        </CardTitle>
                                        {flash.advice.confidence_score && (
                                            <CardDescription className="mt-1 text-blue-700 dark:text-blue-300">
                                                Confidence Level: {flash.advice.confidence_score}% • Model: {flash.advice.model_used}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {flash.advice.model_used}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Structured analysis display */}
                            {flash.advice.structured_advice && (
                                <div className="rounded-xl border border-blue-200 bg-white/60 p-6 dark:border-blue-800 dark:bg-blue-950/30">
                                    <h4 className="mb-4 flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        Key Analysis Points
                                    </h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {Object.entries(flash.advice.structured_advice).map(([key, value]) => (
                                            <div key={key} className="rounded-lg border bg-blue-50/50 p-3 dark:bg-blue-950/20">
                                                <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase dark:text-blue-300">
                                                    {startCase(key)}
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-blue-900 dark:text-blue-100">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Main advice content */}
                            <div className="rounded-xl border border-blue-200 bg-white/60 p-6 dark:border-blue-800 dark:bg-blue-950/30">
                                <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    Investment Recommendation
                                </h4>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-blue-900 dark:text-blue-100">
                                    <div className="leading-relaxed whitespace-pre-wrap">{flash.advice.suggestion}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Professional Analysis History Table */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                            <div className="rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 p-2">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            Analysis History
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                            Review your previous AI-generated investment analyses and recommendations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {recentSuggestions.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center dark:border-gray-800">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/30">
                                    <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">No Analysis History Yet</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Generate your first professional investment analysis using the tools above
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Search and Controls */}
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="relative flex-1 sm:max-w-sm">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search analyses..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>
                                            Showing {paginatedData.length} of {filteredAndSortedData.length} results
                                        </span>
                                    </div>
                                </div>

                                {/* Mobile-First Professional Table */}
                                <div className="rounded-lg border bg-white dark:bg-gray-950">
                                    {/* Mobile Card View */}
                                    <div className="block md:hidden">
                                        <div className="divide-y">
                                            {paginatedData.map((suggestion, index) => (
                                                <div key={`mobile-${suggestion.id}`} className="space-y-3 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-muted-foreground">
                                                                #{(currentPage - 1) * itemsPerPage + index + 1}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                                                            >
                                                                {suggestion.symbol}
                                                            </Badge>
                                                        </div>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-4xl">
                                                                <DialogHeader className="space-y-3">
                                                                    <DialogTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-2">
                                                                                <Lightbulb className="h-5 w-5 text-white" />
                                                                            </div>
                                                                            <span className="text-lg font-semibold sm:text-xl">
                                                                                Investment Analysis
                                                                            </span>
                                                                        </div>
                                                                    </DialogTitle>
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <Badge variant="outline" className="text-sm">
                                                                            {suggestion.symbol}
                                                                        </Badge>
                                                                        <Badge variant="secondary">
                                                                            {suggestion.risk_level.charAt(0).toUpperCase() +
                                                                                suggestion.risk_level.slice(1)}{' '}
                                                                            Risk
                                                                        </Badge>
                                                                        <Badge variant="secondary">
                                                                            {suggestion.time_horizon.charAt(0).toUpperCase() +
                                                                                suggestion.time_horizon.slice(1)}
                                                                            -term
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {new Date(suggestion.created_at).toLocaleDateString('en-US', {
                                                                            weekday: 'long',
                                                                            month: 'long',
                                                                            day: 'numeric',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        })}
                                                                    </div>
                                                                </DialogHeader>
                                                                <div className="mt-6">
                                                                    <div className="rounded-lg border bg-muted/20 p-4 sm:p-6">
                                                                        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                                                            <span className="rounded-md bg-blue-100 p-1 dark:bg-blue-900/30">
                                                                                <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                            </span>
                                                                            Professional Analysis Report
                                                                        </h4>
                                                                        <div className="max-w-none">{formatAnalysisText(suggestion.suggestion)}</div>
                                                                    </div>
                                                                    <div className="mt-4 flex flex-col gap-2 rounded-lg bg-muted/10 p-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="rounded bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                                AI-Powered
                                                                            </span>
                                                                            <span>Generated using {suggestion.model_used}</span>
                                                                        </div>
                                                                        <span className="font-mono">Analysis ID: #{suggestion.id}</span>
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground">Risk:</span>
                                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                                {suggestion.risk_level.charAt(0).toUpperCase() + suggestion.risk_level.slice(1)}
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Horizon:</span>
                                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                                {suggestion.time_horizon.charAt(0).toUpperCase() + suggestion.time_horizon.slice(1)}
                                                                -term
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(suggestion.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden md:block">
                                        <div className="relative w-full overflow-auto">
                                            <table className="w-full caption-bottom text-sm">
                                                <thead className="[&_tr]:border-b">
                                                    <tr className="border-b bg-muted/50">
                                                        <th className="h-12 w-12 px-4 text-left align-middle font-medium text-muted-foreground">#</th>
                                                        <th
                                                            className="h-12 min-w-[100px] cursor-pointer px-4 text-left align-middle font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                                                            onClick={() => handleSort('symbol')}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                Asset
                                                                {sortField === 'symbol' && (
                                                                    <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                                                )}
                                                            </div>
                                                        </th>
                                                        <th
                                                            className="h-12 min-w-[120px] cursor-pointer px-4 text-left align-middle font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                                                            onClick={() => handleSort('risk_level')}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                Risk Level
                                                                {sortField === 'risk_level' && (
                                                                    <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                                                )}
                                                            </div>
                                                        </th>
                                                        <th
                                                            className="h-12 min-w-[130px] cursor-pointer px-4 text-left align-middle font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                                                            onClick={() => handleSort('time_horizon')}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                Time Horizon
                                                                {sortField === 'time_horizon' && (
                                                                    <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                                                )}
                                                            </div>
                                                        </th>
                                                        <th
                                                            className="h-12 min-w-[120px] cursor-pointer px-4 text-left align-middle font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                                                            onClick={() => handleSort('created_at')}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                Date
                                                                {sortField === 'created_at' && (
                                                                    <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                                                )}
                                                            </div>
                                                        </th>
                                                        <th className="h-12 w-[100px] px-4 text-center align-middle font-medium text-muted-foreground">
                                                            Analysis
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="[&_tr:last-child]:border-0">
                                                    {paginatedData.map((suggestion, index) => (
                                                        <tr key={`desktop-${suggestion.id}`} className="border-b transition-colors hover:bg-muted/50">
                                                            <td className="p-4 align-middle font-medium">
                                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                                            </td>
                                                            <td className="p-4 align-middle">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                                                                >
                                                                    {suggestion.symbol}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 align-middle">
                                                                <Badge variant="secondary" className="text-xs font-medium">
                                                                    {suggestion.risk_level.charAt(0).toUpperCase() + suggestion.risk_level.slice(1)}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 align-middle">
                                                                <Badge variant="secondary" className="text-xs font-medium">
                                                                    {suggestion.time_horizon.charAt(0).toUpperCase() +
                                                                        suggestion.time_horizon.slice(1)}
                                                                    -term
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 align-middle text-sm text-muted-foreground">
                                                                <div>
                                                                    {new Date(suggestion.created_at).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    })}
                                                                </div>
                                                                <div className="text-xs">
                                                                    {new Date(suggestion.created_at).toLocaleTimeString('en-US', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-center align-middle">
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                                                                        <DialogHeader className="space-y-3">
                                                                            <DialogTitle className="flex items-center gap-3">
                                                                                <div className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-2">
                                                                                    <Lightbulb className="h-5 w-5 text-white" />
                                                                                </div>
                                                                                <span className="text-xl font-semibold">
                                                                                    Investment Analysis for {suggestion.symbol}
                                                                                </span>
                                                                            </DialogTitle>
                                                                            <div className="flex flex-wrap items-center gap-3">
                                                                                <Badge variant="outline" className="text-sm">
                                                                                    {suggestion.symbol}
                                                                                </Badge>
                                                                                <Badge variant="secondary">
                                                                                    {suggestion.risk_level.charAt(0).toUpperCase() +
                                                                                        suggestion.risk_level.slice(1)}{' '}
                                                                                    Risk
                                                                                </Badge>
                                                                                <Badge variant="secondary">
                                                                                    {suggestion.time_horizon.charAt(0).toUpperCase() +
                                                                                        suggestion.time_horizon.slice(1)}
                                                                                    -term
                                                                                </Badge>
                                                                                <span className="text-sm text-muted-foreground">
                                                                                    {new Date(suggestion.created_at).toLocaleDateString('en-US', {
                                                                                        weekday: 'long',
                                                                                        year: 'numeric',
                                                                                        month: 'long',
                                                                                        day: 'numeric',
                                                                                    })}
                                                                                </span>
                                                                            </div>
                                                                        </DialogHeader>
                                                                        <div className="mt-6">
                                                                            <div className="rounded-lg border bg-muted/20 p-6">
                                                                                <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                                                                    <span className="rounded-md bg-blue-100 p-1 dark:bg-blue-900/30">
                                                                                        <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                                    </span>
                                                                                    Professional Analysis Report
                                                                                </h4>
                                                                                <div className="max-w-none">
                                                                                    {formatAnalysisText(suggestion.suggestion)}
                                                                                </div>
                                                                            </div>
                                                                            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/10 p-3 text-xs text-muted-foreground">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="rounded bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                                        AI-Powered
                                                                                    </span>
                                                                                    <span>Generated using {suggestion.model_used}</span>
                                                                                </div>
                                                                                <span className="font-mono">Analysis ID: #{suggestion.id}</span>
                                                                            </div>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Responsive Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="flex items-center gap-1"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                <span className="hidden sm:inline">Previous</span>
                                            </Button>

                                            {/* Mobile: Show only current page and adjacent */}
                                            <div className="flex items-center gap-1">
                                                {/* Desktop pagination */}
                                                <div className="hidden items-center gap-1 sm:flex">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                        .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                                                        .map((page, index, filteredPages) => (
                                                            <div key={page} className="flex items-center">
                                                                {index > 0 && filteredPages[index - 1] !== page - 1 && (
                                                                    <span className="px-2 text-muted-foreground">...</span>
                                                                )}
                                                                <Button
                                                                    variant={currentPage === page ? 'default' : 'outline'}
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => setCurrentPage(page)}
                                                                >
                                                                    {page}
                                                                </Button>
                                                            </div>
                                                        ))}
                                                </div>

                                                {/* Mobile pagination - just current page */}
                                                <div className="sm:hidden">
                                                    <Button variant="default" size="sm" className="h-8 min-w-[3rem] px-2">
                                                        {currentPage}
                                                    </Button>
                                                </div>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="flex items-center gap-1"
                                            >
                                                <span className="hidden sm:inline">Next</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
