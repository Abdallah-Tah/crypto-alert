import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MarketAnalysisModal, SmartAlertsModal } from '@/components/modals';
import { Activity, AlertTriangle, Brain, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface SentimentIndicator {
    metric: string;
    value: number;
    status: 'bullish' | 'bearish' | 'neutral';
    description: string;
    change: number;
}

interface MarketSentimentAnalysisProps {
    className?: string;
}

export function MarketSentimentAnalysis({ className = '' }: MarketSentimentAnalysisProps) {
    const [isMarketAnalysisOpen, setIsMarketAnalysisOpen] = useState(false);
    const [isSmartAlertsOpen, setIsSmartAlertsOpen] = useState(false);

    // Mock data - in real implementation, this would come from sentiment APIs
    const sentimentData: SentimentIndicator[] = [
        {
            metric: 'Fear & Greed Index',
            value: 68,
            status: 'bullish',
            description: 'Greed territory - market optimism high',
            change: 5.2,
        },
        {
            metric: 'Social Sentiment',
            value: 42,
            status: 'neutral',
            description: 'Mixed signals from social media',
            change: -2.1,
        },
        {
            metric: 'Institutional Flow',
            value: 85,
            status: 'bullish',
            description: 'Strong institutional buying pressure',
            change: 12.3,
        },
        {
            metric: 'Technical Momentum',
            value: 25,
            status: 'bearish',
            description: 'Short-term technical weakness',
            change: -8.7,
        },
    ];

    const overallSentiment = sentimentData.reduce((sum, item) => sum + item.value, 0) / sentimentData.length;
    const getOverallStatus = (score: number): 'bullish' | 'bearish' | 'neutral' => {
        if (score >= 60) return 'bullish';
        if (score <= 40) return 'bearish';
        return 'neutral';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'bullish':
                return 'text-green-600';
            case 'bearish':
                return 'text-red-600';
            default:
                return 'text-yellow-600';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'bullish':
                return 'bg-green-50 dark:bg-green-950/20';
            case 'bearish':
                return 'bg-red-50 dark:bg-red-950/20';
            default:
                return 'bg-yellow-50 dark:bg-yellow-950/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'bullish':
                return <TrendingUp className="h-4 w-4" />;
            case 'bearish':
                return <TrendingDown className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const overallStatus = getOverallStatus(overallSentiment);

    return (
        <Card className={cn('', className)}>
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/20">
                            <Activity className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-foreground">Market Sentiment</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">AI-powered market analysis</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`rounded-md px-3 py-1.5 ${getStatusBg(overallStatus)}`}>
                            <span className={`text-xs font-medium tracking-wide uppercase ${getStatusColor(overallStatus)}`}>{overallStatus}</span>
                            <p className={`text-sm font-bold ${getStatusColor(overallStatus)}`}>{overallSentiment.toFixed(0)}/100</p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
                <div className="space-y-3">
                    {sentimentData.map((indicator, index) => (
                        <div
                            key={`${indicator.metric.replace(/\s+/g, '-').toLowerCase()}-${index}`}
                            className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getStatusBg(indicator.status)}`}>
                                    <span className={getStatusColor(indicator.status)}>{getStatusIcon(indicator.status)}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{indicator.metric}</p>
                                        <Badge
                                            variant={
                                                indicator.status === 'bullish'
                                                    ? 'default'
                                                    : indicator.status === 'bearish'
                                                      ? 'destructive'
                                                      : 'secondary'
                                            }
                                            className="text-xs"
                                        >
                                            {indicator.value}/100
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{indicator.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                                <div className="flex items-center gap-1">
                                    {indicator.change >= 0 ? (
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-red-600" />
                                    )}
                                    <span className={`text-xs font-medium ${indicator.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {indicator.change >= 0 ? '+' : ''}
                                        {indicator.change.toFixed(1)}%
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={`h-full transition-all duration-500 ${
                                            indicator.status === 'bullish'
                                                ? 'bg-green-500'
                                                : indicator.status === 'bearish'
                                                  ? 'bg-red-500'
                                                  : 'bg-yellow-500'
                                        }`}
                                        style={{ width: `${Math.min(100, Math.max(0, indicator.value))}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Insights */}
                <div className="mt-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Brain className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-100">AI Market Insight</h4>
                            <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
                                Current sentiment suggests a {overallStatus} bias with strong institutional support. However, technical indicators
                                show some weakness. Consider taking partial profits if you're overexposed to high-risk assets.
                            </p>
                        </div>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-800">
                            <CheckCircle className="h-3 w-3 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex flex-1 items-center justify-center gap-2"
                        onClick={() => setIsMarketAnalysisOpen(true)}
                    >
                        <Activity className="h-3 w-3" />
                        <span className="text-xs">Detailed Analysis</span>
                    </Button>
                    <Button 
                        size="sm" 
                        className="flex flex-1 items-center justify-center gap-2"
                        onClick={() => setIsSmartAlertsOpen(true)}
                    >
                        <AlertTriangle className="h-3 w-3" />
                        <span className="text-xs">Set Alerts</span>
                    </Button>
                </div>

                {/* Market Analysis Modal */}
                <MarketAnalysisModal
                    isOpen={isMarketAnalysisOpen}
                    onClose={() => setIsMarketAnalysisOpen(false)}
                    data={{
                        sentiment: {
                            score: overallSentiment,
                            label: overallStatus === 'bullish' ? 'Greed' : overallStatus === 'bearish' ? 'Fear' : 'Neutral',
                            change24h: 2.5,
                            indicators: {
                                fearGreedIndex: 68,
                                socialSentiment: 42,
                                technicalIndicators: 25,
                                momentum: 85
                            }
                        },
                        technicalAnalysis: {
                            trend: overallStatus,
                            strength: 7,
                            resistance: [50000, 52000],
                            support: [45000, 43000],
                            indicators: [
                                { name: 'RSI', value: 65, signal: 'hold', strength: 7 },
                                { name: 'MACD', value: -0.5, signal: 'sell', strength: 6 },
                                { name: 'Moving Average', value: 45000, signal: 'buy', strength: 8 }
                            ]
                        },
                        aiInsights: {
                            prediction: 'Bullish momentum expected to continue in short term',
                            confidence: 75,
                            timeframe: '1-2 weeks',
                            keyFactors: ['Strong institutional buying', 'Technical breakout above resistance'],
                            risks: ['Market volatility', 'Regulatory concerns'],
                            opportunities: ['Potential upside to $55k', 'Strong support levels']
                        },
                        marketMetrics: {
                            volatility: 0.045,
                            volume24h: 28500000000,
                            marketCap: 950000000000,
                            dominance: { BTC: 45.2, ETH: 18.5, Others: 36.3 }
                        }
                    }}
                    onRefreshData={async () => {
                        console.log('Refreshing market analysis data...');
                    }}
                />

                {/* Smart Alerts Modal */}
                <SmartAlertsModal
                    isOpen={isSmartAlertsOpen}
                    onClose={() => setIsSmartAlertsOpen(false)}
                    activeAlerts={[
                        {
                            id: '1',
                            name: 'BTC Price Alert',
                            type: 'market',
                            status: 'active',
                            condition: 'BTC > $50,000',
                            triggered: false,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    ]}
                    onCreateAlert={async (alertData) => {
                        console.log('Creating alert:', alertData);
                    }}
                    onUpdateAlert={async (alertId, updates) => {
                        console.log('Updating alert:', alertId, updates);
                    }}
                    onDeleteAlert={async (alertId) => {
                        console.log('Deleting alert:', alertId);
                    }}
                />
            </CardContent>
        </Card>
    );
}
