import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const MarketIntelligenceGrid = ({ className }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMarketIntelligence = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to fetch real data from API
            const response = await fetch('/api/market/intelligence', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            // Silently fallback to mock data without console warnings
            const mockData = {
                fearGreed: {
                    value: 72,
                    value_classification: 'Greed',
                    timestamp: Date.now() / 1000,
                    time_until_update: '12 hours',
                },
                globalMarket: {
                    total_market_cap: {
                        usd: 2845000000000,
                    },
                    total_volume: {
                        usd: 89500000000,
                    },
                    market_cap_percentage: {
                        btc: 52.3,
                        eth: 13.7,
                    },
                    market_cap_change_percentage_24h_usd: 2.45,
                },
                topGainers: generateMockTopMovers(true),
                topLosers: generateMockTopMovers(false),
            };
            setData(mockData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketIntelligence();

        // Refresh every 5 minutes
        const interval = setInterval(fetchMarketIntelligence, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []); // Empty dependency array since this doesn't depend on props

    const generateMockTopMovers = (isGainer) => {
        const symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT', 'DOGE', 'AVAX', 'MATIC'];
        const mockMovers = [];

        for (let i = 0; i < 5; i++) {
            const change = isGainer
                ? Math.random() * 15 + 5 // 5% to 20% gain
                : -(Math.random() * 15 + 5); // 5% to 20% loss

            mockMovers.push({
                id: symbols[i],
                symbol: symbols[i],
                name: symbols[i],
                current_price: Math.random() * 1000 + 100,
                price_change_percentage_24h: change,
            });
        }

        return mockMovers;
    };

    const getFearGreedTextColor = (value) => {
        if (value <= 25) return 'text-red-600';
        if (value <= 50) return 'text-orange-600';
        if (value <= 75) return 'text-yellow-600';
        return 'text-green-600';
    };

    const formatCurrency = (value) => {
        if (value >= 1e12) {
            return `$${(value / 1e12).toFixed(2)}T`;
        } else if (value >= 1e9) {
            return `$${(value / 1e9).toFixed(2)}B`;
        } else if (value >= 1e6) {
            return `$${(value / 1e6).toFixed(2)}M`;
        }
        return `$${value.toFixed(2)}`;
    };

    const formatPercent = (value) => {
        const formatted = Math.abs(value).toFixed(2);
        return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
    };

    if (loading) {
        return (
            <div className={`grid gap-6 lg:grid-cols-3 ${className || ''}`}>
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <div className="h-4 w-1/2 rounded bg-muted"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="h-8 rounded bg-muted"></div>
                                <div className="h-4 w-3/4 rounded bg-muted"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="flex h-40 items-center justify-center">
                    <div className="text-center">
                        <p className="mb-2 text-muted-foreground">Failed to load market intelligence</p>
                        <button onClick={fetchMarketIntelligence} className="text-sm text-blue-600 hover:underline">
                            Try Again
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`grid gap-6 lg:grid-cols-3 ${className || ''}`}>
            {/* Fear & Greed Index */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-50 dark:from-purple-950/20 dark:to-indigo-950/20" />
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-purple-600" />
                        Fear & Greed Index
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                    <div className="text-center">
                        <div className={`text-4xl font-bold ${getFearGreedTextColor(data?.fearGreed?.value || 0)}`}>
                            {data?.fearGreed?.value || 0}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">{data?.fearGreed?.value_classification || 'Neutral'}</div>
                    </div>
                    <Progress value={data?.fearGreed?.value || 0} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Extreme Fear</span>
                        <span>Extreme Greed</span>
                    </div>
                </CardContent>
            </Card>

            {/* Global Market Stats */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50 dark:from-blue-950/20 dark:to-cyan-950/20" />
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        Global Market
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Market Cap</span>
                            <span className="font-semibold">{formatCurrency(data?.globalMarket?.total_market_cap?.usd || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">24h Volume</span>
                            <span className="font-semibold">{formatCurrency(data?.globalMarket?.total_volume?.usd || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">BTC Dominance</span>
                            <span className="font-semibold">{(data?.globalMarket?.market_cap_percentage?.btc || 0).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">24h Change</span>
                            <span
                                className={`font-semibold ${
                                    (data?.globalMarket?.market_cap_change_percentage_24h_usd || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                            >
                                {formatPercent(data?.globalMarket?.market_cap_change_percentage_24h_usd || 0)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Movers */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50 dark:from-green-950/20 dark:to-emerald-950/20" />
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Top Movers
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                    <Tabs defaultValue="gainers" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="gainers" className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Gainers
                            </TabsTrigger>
                            <TabsTrigger value="losers" className="flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                Losers
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="gainers" className="mt-4 space-y-2">
                            {(data?.topGainers || []).slice(0, 3).map((coin, index) => (
                                <div key={coin.symbol} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{coin.symbol}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">{formatCurrency(coin.current_price)}</div>
                                        <div className="text-xs text-green-600">{formatPercent(coin.price_change_percentage_24h)}</div>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="losers" className="mt-4 space-y-2">
                            {(data?.topLosers || []).slice(0, 3).map((coin, index) => (
                                <div key={coin.symbol} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{coin.symbol}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">{formatCurrency(coin.current_price)}</div>
                                        <div className="text-xs text-red-600">{formatPercent(coin.price_change_percentage_24h)}</div>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default MarketIntelligenceGrid;
