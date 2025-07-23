import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Bell, Brain, DollarSign, Star, TrendingDown, TrendingUp, Zap } from 'lucide-react';

interface WatchlistSummary {
    total_coins: number;
    alerts_active: number;
    total_value: number;
}

interface TopMover {
    symbol: string;
    current_price: number;
    price_change_24h: number;
}

interface RecentAlert {
    symbol: string;
    message: string;
    triggered_at: string;
    type: string;
}

interface AISuggestion {
    id: number;
    symbol: string;
    suggestion: string;
    model_used: string;
    risk_level: string;
    time_horizon: string;
    created_at: string;
}

interface MarketSummary {
    total_market_cap: number;
    btc_dominance: number;
    market_change: number;
}

interface DashboardProps {
    watchlistSummary: WatchlistSummary;
    topMovers: TopMover[];
    recentAlerts: RecentAlert[];
    aiSuggestions: AISuggestion[];
    marketSummary: MarketSummary;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    watchlistSummary = { total_coins: 0, alerts_active: 0, total_value: 0 },
    recentAlerts = [],
    topMovers = [],
    aiSuggestions = [],
    marketSummary = { total_market_cap: 0, btc_dominance: 0, market_change: 0 },
}: DashboardProps) {
    const formatPrice = (price: number): string => {
        if (!price) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };

    const formatPercentage = (percentage: number): string => {
        if (percentage === null || percentage === undefined) return '0.00%';
        const formatted = Math.abs(percentage).toFixed(2);
        return percentage >= 0 ? `+${formatted}%` : `-${formatted}%`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Crypto Dashboard</h1>
                        <p className="text-muted-foreground">Monitor your portfolio and get AI-powered insights</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/advisor">
                            <Button className="flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                AI Advisor
                            </Button>
                        </Link>
                        <Link href="/watchlist">
                            <Button variant="outline" className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Watchlist
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 dark:from-blue-950/20 dark:to-indigo-950/20" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-2xl font-bold">{formatPrice(watchlistSummary.total_value)}</div>
                            <p className="text-xs text-muted-foreground">Total watchlist value</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50 dark:from-green-950/20 dark:to-emerald-950/20" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tracked Coins</CardTitle>
                            <Star className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-2xl font-bold">{watchlistSummary.total_coins}</div>
                            <p className="text-xs text-muted-foreground">In your watchlist</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-50 dark:from-orange-950/20 dark:to-red-950/20" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                            <Bell className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-2xl font-bold">{watchlistSummary.alerts_active}</div>
                            <p className="text-xs text-muted-foreground">Price alerts enabled</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50 dark:from-purple-950/20 dark:to-pink-950/20" />
                        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-2xl font-bold">${(marketSummary.total_market_cap / 1e12).toFixed(1)}T</div>
                            <p className="text-xs text-muted-foreground">Total crypto market</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent AI Suggestions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-purple-600" />
                                Recent AI Suggestions
                            </CardTitle>
                            <CardDescription>Latest AI-powered investment advice</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {aiSuggestions.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    <Brain className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                    <p className="mb-2">No AI suggestions yet</p>
                                    <Link href="/advisor">
                                        <Button variant="outline" size="sm">
                                            Get AI Advice
                                            <ArrowRight className="ml-2 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">{suggestion.symbol}</Badge>
                                                <span className="truncate text-sm text-foreground">{suggestion.suggestion?.substring(0, 60)}...</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{suggestion.created_at}</span>
                                        </div>
                                    ))}
                                    <Link href="/advisor">
                                        <Button variant="ghost" size="sm" className="w-full">
                                            View All Suggestions
                                            <ArrowRight className="ml-2 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Movers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-600" />
                                Top Movers
                            </CardTitle>
                            <CardDescription>Biggest price changes in your watchlist</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topMovers.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    <TrendingUp className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                    <p className="mb-2">No price movements to show</p>
                                    <Link href="/watchlist">
                                        <Button variant="outline" size="sm">
                                            Add Coins to Watchlist
                                            <ArrowRight className="ml-2 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {topMovers.slice(0, 5).map((coin, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">{coin.symbol}</Badge>
                                                <span className="text-sm font-medium">{formatPrice(coin.current_price)}</span>
                                            </div>
                                            <div
                                                className={`flex items-center gap-1 text-sm ${
                                                    coin.price_change_24h >= 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                {coin.price_change_24h >= 0 ? (
                                                    <TrendingUp className="h-3 w-3" />
                                                ) : (
                                                    <TrendingDown className="h-3 w-3" />
                                                )}
                                                {formatPercentage(coin.price_change_24h)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-blue-600" />
                            Recent Alerts
                        </CardTitle>
                        <CardDescription>Latest price alerts and notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentAlerts.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Bell className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                <p>No recent alerts</p>
                                <p className="text-sm">Set up price alerts to stay informed</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentAlerts.slice(0, 5).map((alert, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{alert.symbol}</Badge>
                                                <span className="text-sm font-medium">{alert.message}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{alert.triggered_at}</span>
                                        </div>
                                        <Badge variant={alert.type === 'price' ? 'default' : 'secondary'}>{alert.type}</Badge>
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
