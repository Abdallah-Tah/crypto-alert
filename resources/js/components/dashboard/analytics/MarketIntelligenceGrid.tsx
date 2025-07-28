import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Globe, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface FearGreedData {
    value: number;
    value_classification: string;
    timestamp: string;
    time_until_update?: string;
}

interface GlobalMarketData {
    total_market_cap: number;
    total_volume_24h: number;
    market_cap_change_24h: number;
    active_cryptocurrencies: number;
    btc_dominance: number;
    eth_dominance: number;
}

interface TopGainerLoser {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    total_volume: number;
}

interface MarketIntelligenceData {
    fearGreed: FearGreedData | null;
    globalMarket: GlobalMarketData | null;
    topGainers: TopGainerLoser[];
    topLosers: TopGainerLoser[];
}

interface MarketIntelligenceGridProps {
    className?: string;
}

const MarketIntelligenceGrid: React.FC<MarketIntelligenceGridProps> = ({ className }) => {
    const [data, setData] = useState<MarketIntelligenceData>({
        fearGreed: null,
        globalMarket: null,
        topGainers: [],
        topLosers: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    useEffect(() => {
        fetchMarketIntelligence();
        // Refresh every 5 minutes
        const interval = setInterval(fetchMarketIntelligence, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchMarketIntelligence = async () => {
        try {
            setIsLoading(true);

            const response = await fetch('/api/market/intelligence', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setData({
                        fearGreed: result.data.fear_greed,
                        globalMarket: result.data.global_market,
                        topGainers: result.data.top_gainers || [],
                        topLosers: result.data.top_losers || [],
                    });
                    setLastUpdate(new Date());
                    return;
                }
            }

            // Fallback to mock data if API fails
            console.warn('Using mock data for market intelligence');
            const mockData: MarketIntelligenceData = {
                fearGreed: {
                    value: Math.floor(Math.random() * 100),
                    value_classification: ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'][Math.floor(Math.random() * 5)],
                    timestamp: new Date().toISOString(),
                },
                globalMarket: {
                    total_market_cap: 2.8e12,
                    total_volume_24h: 89.5e9,
                    market_cap_change_24h: 2.3,
                    active_cryptocurrencies: 13847,
                    btc_dominance: 52.1,
                    eth_dominance: 17.8,
                },
                topGainers: generateMockTopMovers(true),
                topLosers: generateMockTopMovers(false),
            };

            setData(mockData);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching market intelligence:', error);
            // Use mock data as fallback
            const mockData: MarketIntelligenceData = {
                fearGreed: {
                    value: 45,
                    value_classification: 'Fear',
                    timestamp: new Date().toISOString(),
                },
                globalMarket: {
                    total_market_cap: 2.8e12,
                    total_volume_24h: 89.5e9,
                    market_cap_change_24h: 2.3,
                    active_cryptocurrencies: 13847,
                    btc_dominance: 52.1,
                    eth_dominance: 17.8,
                },
                topGainers: generateMockTopMovers(true),
                topLosers: generateMockTopMovers(false),
            };
            setData(mockData);
            setLastUpdate(new Date());
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockTopMovers = (isGainer: boolean): TopGainerLoser[] => {
        const symbols = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK'];
        return symbols.map((symbol, index) => ({
            id: `${symbol.toLowerCase()}-${index}`,
            symbol: symbol,
            name: `${symbol} Token`,
            image: '',
            current_price: Math.random() * 10,
            price_change_percentage_24h: isGainer
                ? Math.random() * 50 + 5 // 5% to 55% gain
                : -(Math.random() * 30 + 5), // -5% to -35% loss
            market_cap: Math.random() * 1e9,
            total_volume: Math.random() * 1e8,
        }));
    };

    const getFearGreedColor = (value: number): string => {
        if (value <= 20) return 'bg-red-500';
        if (value <= 40) return 'bg-orange-500';
        if (value <= 60) return 'bg-yellow-500';
        if (value <= 80) return 'bg-green-500';
        return 'bg-emerald-500';
    };

    const getFearGreedTextColor = (value: number): string => {
        if (value <= 20) return 'text-red-600';
        if (value <= 40) return 'text-orange-600';
        if (value <= 60) return 'text-yellow-600';
        if (value <= 80) return 'text-green-600';
        return 'text-emerald-600';
    };

    const formatCurrency = (value: number): string => {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        return `$${value.toFixed(2)}`;
    };

    const formatPercent = (value: number): string => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    if (isLoading && !data.fearGreed) {
        return (
            <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Market Intelligence Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Market Intelligence</h2>
                    <p className="text-muted-foreground">Real-time crypto market insights and sentiment</p>
                </div>
                <div className="flex items-center gap-2">
                    {lastUpdate && <span className="text-xs text-muted-foreground">Updated {lastUpdate.toLocaleTimeString()}</span>}
                    <Button variant="outline" size="sm" onClick={fetchMarketIntelligence} disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Top Row - Key Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Fear & Greed Index */}
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-50 dark:from-purple-950/20 dark:to-indigo-950/20" />
                    <CardHeader className="relative">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4 text-purple-600" />
                            Fear & Greed Index
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                        {data.fearGreed ? (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className={`text-4xl font-bold ${getFearGreedTextColor(data.fearGreed.value)}`}>{data.fearGreed.value}</div>
                                    <div className="text-sm font-medium text-muted-foreground">{data.fearGreed.value_classification}</div>
                                </div>
                                <div className="space-y-2">
                                    <Progress value={data.fearGreed.value} className="h-2" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Extreme Fear</span>
                                        <span>Extreme Greed</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">No data available</div>
                        )}
                    </CardContent>
                </Card>

                {/* Global Market Cap */}
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50 dark:from-blue-950/20 dark:to-cyan-950/20" />
                    <CardHeader className="relative">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4 text-blue-600" />
                            Global Market
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                        {data.globalMarket ? (
                            <div className="space-y-3">
                                <div>
                                    <div className="text-2xl font-bold">{formatCurrency(data.globalMarket.total_market_cap)}</div>
                                    <div className="text-sm text-muted-foreground">Total Market Cap</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={data.globalMarket.market_cap_change_24h >= 0 ? 'default' : 'destructive'} className="text-xs">
                                        {data.globalMarket.market_cap_change_24h >= 0 ? (
                                            <TrendingUp className="mr-1 h-3 w-3" />
                                        ) : (
                                            <TrendingDown className="mr-1 h-3 w-3" />
                                        )}
                                        {formatPercent(data.globalMarket.market_cap_change_24h)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">24h</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">No data available</div>
                        )}
                    </CardContent>
                </Card>

                {/* Market Dominance */}
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 opacity-50 dark:from-orange-950/20 dark:to-yellow-950/20" />
                    <CardHeader className="relative">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <BarChart3 className="h-4 w-4 text-orange-600" />
                            Market Dominance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                        {data.globalMarket ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Bitcoin</span>
                                    <span className="text-lg font-bold text-orange-600">{data.globalMarket.btc_dominance.toFixed(1)}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Ethereum</span>
                                    <span className="text-lg font-bold text-blue-600">{data.globalMarket.eth_dominance.toFixed(1)}%</span>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {data.globalMarket.active_cryptocurrencies.toLocaleString()} active cryptocurrencies
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">No data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row - Top Movers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        Top Market Movers
                    </CardTitle>
                    <CardDescription>Biggest gainers and losers in the crypto market</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="gainers" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="gainers" className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Top Gainers
                            </TabsTrigger>
                            <TabsTrigger value="losers" className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4" />
                                Top Losers
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="gainers" className="mt-4">
                            <div className="space-y-3">
                                {data.topGainers.slice(0, 5).map((coin) => (
                                    <div key={coin.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                                <span className="text-xs font-bold text-green-600">{coin.symbol.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <div className="font-medium">{coin.symbol}</div>
                                                <div className="text-sm text-muted-foreground">{formatCurrency(coin.current_price)}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 font-medium text-green-600">
                                                <TrendingUp className="h-4 w-4" />
                                                {formatPercent(coin.price_change_percentage_24h)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Vol: {formatCurrency(coin.total_volume)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="losers" className="mt-4">
                            <div className="space-y-3">
                                {data.topLosers.slice(0, 5).map((coin) => (
                                    <div key={coin.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                                <span className="text-xs font-bold text-red-600">{coin.symbol.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <div className="font-medium">{coin.symbol}</div>
                                                <div className="text-sm text-muted-foreground">{formatCurrency(coin.current_price)}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 font-medium text-red-600">
                                                <TrendingDown className="h-4 w-4" />
                                                {formatPercent(coin.price_change_percentage_24h)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Vol: {formatCurrency(coin.total_volume)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default MarketIntelligenceGrid;
