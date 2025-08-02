import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { MarketAnalysisModalProps, TechnicalIndicator } from '@/types/modals';
import { 
    TrendingUp, 
    TrendingDown,
    Brain,
    Target,
    Activity,
    BarChart3,
    Eye,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    Zap,
    Shield,
    Clock,
    ArrowUp,
    ArrowDown,
    Minus,
    Sparkles
} from 'lucide-react';

export function MarketAnalysisModal({
    isOpen,
    onClose,
    data,
    onRefreshData,
    isRefreshing = false,
    className
}: MarketAnalysisModalProps) {
    const [activeTab, setActiveTab] = React.useState<string>('sentiment');
    const [refreshProgress, setRefreshProgress] = React.useState(0);

    const handleRefresh = async () => {
        // Simulate refresh progress
        const progressInterval = setInterval(() => {
            setRefreshProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 10;
            });
        }, 100);

        try {
            await onRefreshData();
            setTimeout(() => setRefreshProgress(0), 1000);
        } catch (error) {
            setRefreshProgress(0);
        }
    };

    const getSentimentColor = (score: number) => {
        if (score >= 75) return 'from-emerald-500 to-green-600';
        if (score >= 50) return 'from-yellow-500 to-amber-600';
        if (score >= 25) return 'from-orange-500 to-red-500';
        return 'from-red-500 to-red-700';
    };

    const getSentimentIcon = (label: string) => {
        switch (label) {
            case 'Extreme Greed': return <TrendingUp className="h-5 w-5 text-emerald-600" />;
            case 'Greed': return <TrendingUp className="h-5 w-5 text-green-600" />;
            case 'Neutral': return <Minus className="h-5 w-5 text-gray-600" />;
            case 'Fear': return <TrendingDown className="h-5 w-5 text-orange-600" />;
            case 'Extreme Fear': return <TrendingDown className="h-5 w-5 text-red-600" />;
            default: return <Activity className="h-5 w-5 text-gray-600" />;
        }
    };

    const getSignalColor = (signal: string) => {
        switch (signal) {
            case 'buy': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20';
            case 'sell': return 'text-red-600 bg-red-50 dark:bg-red-950/20';
            case 'hold': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20';
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
        }
    };

    const getSignalIcon = (signal: string) => {
        switch (signal) {
            case 'buy': return <ArrowUp className="h-4 w-4" />;
            case 'sell': return <ArrowDown className="h-4 w-4" />;
            case 'hold': return <Minus className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'bullish': return <TrendingUp className="h-5 w-5 text-emerald-600" />;
            case 'bearish': return <TrendingDown className="h-5 w-5 text-red-600" />;
            case 'neutral': return <Minus className="h-5 w-5 text-gray-600" />;
            default: return <Activity className="h-5 w-5 text-gray-600" />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 2,
        }).format(amount);
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(
                "max-h-[95vh] w-[95vw] max-w-[95vw] overflow-y-auto sm:max-h-[90vh] sm:w-auto sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl",
                "bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95",
                "backdrop-blur-xl border border-white/20 dark:border-slate-700/50",
                "shadow-2xl shadow-black/10 dark:shadow-black/50",
                className
            )}>
                <DialogHeader className="space-y-6 pb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold tracking-tight">
                                    Market Analysis Center
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Advanced market sentiment and technical analysis powered by AI
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            variant="outline"
                            size="sm"
                            className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-950/20"
                        >
                            <RefreshCw className={cn(
                                "h-4 w-4 mr-2",
                                isRefreshing && "animate-spin"
                            )} />
                            Refresh
                        </Button>
                    </div>

                    {/* Refresh Progress */}
                    {isRefreshing && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Updating market data...</span>
                                <span>{refreshProgress}%</span>
                            </div>
                            <Progress value={refreshProgress} className="h-1" />
                        </div>
                    )}

                    {/* Quick Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Market Cap</p>
                                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                            {formatCurrency(data.marketMetrics.marketCap)}
                                        </p>
                                    </div>
                                    <BarChart3 className="h-6 w-6 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">24h Volume</p>
                                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                            {formatCurrency(data.marketMetrics.volume24h)}
                                        </p>
                                    </div>
                                    <Activity className="h-6 w-6 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/30 border-amber-200 dark:border-amber-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Volatility</p>
                                        <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                                            {data.marketMetrics.volatility.toFixed(1)}%
                                        </p>
                                    </div>
                                    <Zap className="h-6 w-6 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">BTC Dominance</p>
                                        <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                                            {data.marketMetrics.dominance.BTC?.toFixed(1) || '45.2'}%
                                        </p>
                                    </div>
                                    <Target className="h-6 w-6 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </DialogHeader>

                <div className="px-1">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
                            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                            <TabsTrigger value="technical">Technical</TabsTrigger>
                            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                        </TabsList>

                        {/* Sentiment Tab */}
                        <TabsContent value="sentiment" className="space-y-6">
                            {/* Fear & Greed Index */}
                            <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-slate-600" />
                                        Market Sentiment Analysis
                                    </CardTitle>
                                    <CardDescription>
                                        Current market sentiment based on multiple indicators
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Main Sentiment Gauge */}
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-3 mb-4">
                                                {getSentimentIcon(data.sentiment.label)}
                                                <h3 className="text-2xl font-bold">{data.sentiment.label}</h3>
                                                <Badge className={cn(
                                                    "text-white",
                                                    data.sentiment.change24h > 0 ? "bg-emerald-600" : "bg-red-600"
                                                )}>
                                                    {data.sentiment.change24h > 0 ? '+' : ''}{data.sentiment.change24h}%
                                                </Badge>
                                            </div>
                                            
                                            {/* Sentiment Score Visualization */}
                                            <div className="relative w-64 h-4 mx-auto rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 overflow-hidden">
                                                <div 
                                                    className="absolute top-0 h-full w-2 bg-white border-2 border-slate-800 rounded-full shadow-lg transition-all duration-500"
                                                    style={{ left: `${(data.sentiment.score / 100) * 100}%`, transform: 'translateX(-50%)' }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground mt-2 w-64 mx-auto">
                                                <span>Extreme Fear</span>
                                                <span>Neutral</span>
                                                <span>Extreme Greed</span>
                                            </div>
                                            <p className="text-3xl font-bold mt-4">{data.sentiment.score}</p>
                                        </div>

                                        {/* Sentiment Indicators Breakdown */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-800/50 border">
                                                <p className="text-sm text-muted-foreground mb-2">Fear & Greed</p>
                                                <p className="text-xl font-bold">{data.sentiment.indicators.fearGreedIndex}</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                    <div 
                                                        className={cn(
                                                            "h-2 rounded-full bg-gradient-to-r transition-all duration-300",
                                                            getSentimentColor(data.sentiment.indicators.fearGreedIndex)
                                                        )}
                                                        style={{ width: `${data.sentiment.indicators.fearGreedIndex}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-800/50 border">
                                                <p className="text-sm text-muted-foreground mb-2">Social Sentiment</p>
                                                <p className="text-xl font-bold">{data.sentiment.indicators.socialSentiment}</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                    <div 
                                                        className={cn(
                                                            "h-2 rounded-full bg-gradient-to-r transition-all duration-300",
                                                            getSentimentColor(data.sentiment.indicators.socialSentiment)
                                                        )}
                                                        style={{ width: `${data.sentiment.indicators.socialSentiment}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-800/50 border">
                                                <p className="text-sm text-muted-foreground mb-2">Technical</p>
                                                <p className="text-xl font-bold">{data.sentiment.indicators.technicalIndicators}</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                    <div 
                                                        className={cn(
                                                            "h-2 rounded-full bg-gradient-to-r transition-all duration-300",
                                                            getSentimentColor(data.sentiment.indicators.technicalIndicators)
                                                        )}
                                                        style={{ width: `${data.sentiment.indicators.technicalIndicators}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-800/50 border">
                                                <p className="text-sm text-muted-foreground mb-2">Momentum</p>
                                                <p className="text-xl font-bold">{data.sentiment.indicators.momentum}</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                    <div 
                                                        className={cn(
                                                            "h-2 rounded-full bg-gradient-to-r transition-all duration-300",
                                                            getSentimentColor(data.sentiment.indicators.momentum)
                                                        )}
                                                        style={{ width: `${data.sentiment.indicators.momentum}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Technical Tab */}
                        <TabsContent value="technical" className="space-y-6">
                            {/* Technical Analysis Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        Technical Analysis
                                    </CardTitle>
                                    <CardDescription>
                                        Technical indicators and price action analysis
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Trend Overview */}
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                {getTrendIcon(data.technicalAnalysis.trend)}
                                                <div>
                                                    <h4 className="font-semibold capitalize">
                                                        {data.technicalAnalysis.trend} Trend
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Strength: {data.technicalAnalysis.strength}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                                                        style={{ width: `${data.technicalAnalysis.strength}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Support & Resistance */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">
                                                    Support Levels
                                                </h4>
                                                {data.technicalAnalysis.support.map((level, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                                                        <span className="text-sm font-medium">S{index + 1}</span>
                                                        <span className="font-semibold">{formatCurrency(level)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-red-700 dark:text-red-300">
                                                    Resistance Levels
                                                </h4>
                                                {data.technicalAnalysis.resistance.map((level, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                                                        <span className="text-sm font-medium">R{index + 1}</span>
                                                        <span className="font-semibold">{formatCurrency(level)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Technical Indicators */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Technical Indicators</CardTitle>
                                    <CardDescription>
                                        Key technical indicators and their signals
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.technicalAnalysis.indicators.map((indicator, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center gap-4">
                                                    <div className="font-semibold min-w-0 flex-1">
                                                        {indicator.name}
                                                    </div>
                                                    <div className="text-lg font-bold">
                                                        {indicator.value.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                                                                style={{ width: `${indicator.strength}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {indicator.strength}%
                                                        </span>
                                                    </div>
                                                    <Badge className={cn(
                                                        "text-xs font-medium flex items-center gap-1",
                                                        getSignalColor(indicator.signal)
                                                    )}>
                                                        {getSignalIcon(indicator.signal)}
                                                        {indicator.signal.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* AI Insights Tab */}
                        <TabsContent value="ai-insights" className="space-y-6">
                            {/* AI Prediction */}
                            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                        AI Market Prediction
                                    </CardTitle>
                                    <CardDescription>
                                        Advanced AI analysis for {data.aiInsights.timeframe}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-center p-6 rounded-lg bg-white/50 dark:bg-slate-800/50">
                                            <p className="text-lg font-semibold mb-2">{data.aiInsights.prediction}</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-sm text-muted-foreground">Confidence:</span>
                                                <Badge variant="secondary" className="font-semibold">
                                                    {data.aiInsights.confidence}%
                                                </Badge>
                                            </div>
                                            <div className="w-32 bg-gray-200 rounded-full h-2 mx-auto mt-2">
                                                <div 
                                                    className="h-2 rounded-full bg-purple-500 transition-all duration-300"
                                                    style={{ width: `${data.aiInsights.confidence}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Key Factors */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                                    <Target className="h-4 w-4" />
                                                    Key Factors
                                                </h4>
                                                {data.aiInsights.keyFactors.map((factor, index) => (
                                                    <div key={index} className="flex items-start gap-2 text-sm">
                                                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                        <span>{factor}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Risks
                                                </h4>
                                                {data.aiInsights.risks.map((risk, index) => (
                                                    <div key={index} className="flex items-start gap-2 text-sm">
                                                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                        <span>{risk}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Opportunities
                                                </h4>
                                                {data.aiInsights.opportunities.map((opportunity, index) => (
                                                    <div key={index} className="flex items-start gap-2 text-sm">
                                                        <TrendingUp className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                        <span>{opportunity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI Recommendations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5 text-indigo-600" />
                                        Strategic Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                                            <div className="flex items-start gap-3">
                                                <Shield className="h-5 w-5 text-emerald-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                                                        Risk Management
                                                    </h4>
                                                    <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
                                                        Consider setting stop-losses at key support levels. Current volatility suggests 5-8% stops.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-start gap-3">
                                                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                                                        Timing Strategy
                                                    </h4>
                                                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                                        Current market conditions favor DCA approach over lump-sum investments.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                            <div className="flex items-start gap-3">
                                                <Target className="h-5 w-5 text-amber-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                                                        Portfolio Allocation
                                                    </h4>
                                                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                                        Maintain 60-70% in large-cap cryptos during current market uncertainty.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        Last updated: {new Date().toLocaleString()}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button 
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <RefreshCw className={cn(
                                "h-4 w-4 mr-2",
                                isRefreshing && "animate-spin"
                            )} />
                            Refresh Analysis
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}