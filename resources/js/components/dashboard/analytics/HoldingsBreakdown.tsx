import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AllocationData, PortfolioHolding } from '@/types/portfolio';
import { BarChart3, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

// Professional color palette for crypto assets
const COLORS = [
    '#f7931a', // Bitcoin Orange
    '#627eea', // Ethereum Blue
    '#00d4aa', // Green
    '#ff6b6b', // Red
    '#4ecdc4', // Teal
    '#45b7d1', // Light Blue
    '#96ceb4', // Mint
    '#ffeaa7', // Yellow
    '#dda0dd', // Plum
    '#98d8c8', // Seafoam
];

interface HoldingsBreakdownProps {
    holdings?: PortfolioHolding[];
    totalValue?: number;
    isLoading?: boolean;
    className?: string;
}

export function HoldingsBreakdown({ holdings = [], totalValue = 0, isLoading = false, className = '' }: HoldingsBreakdownProps) {
    const calculateHoldingValue = (holding: PortfolioHolding): number => {
        if (!holding.current_price || !holding.holdings_amount) return 0;

        if (holding.holdings_type === 'usd_value' && holding.purchase_price) {
            // Calculate coin quantity from USD value and purchase price
            const coinQuantity = holding.holdings_amount / holding.purchase_price;
            return holding.current_price * coinQuantity;
        } else if (holding.holdings_type === 'coin_quantity') {
            // Direct coin quantity calculation
            return holding.current_price * holding.holdings_amount;
        } else {
            // Fallback: treat as USD value
            return holding.holdings_amount;
        }
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatPercentage = (percentage: number): string => {
        return `${percentage.toFixed(1)}%`;
    };

    // Calculate allocation data
    const allocationData: AllocationData[] = useMemo(() => {
        if (!holdings || holdings.length === 0) return [];

        return holdings
            .map((holding, index) => {
                const value = calculateHoldingValue(holding);
                const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

                return {
                    symbol: holding.symbol,
                    name: holding.name || holding.symbol,
                    value: value,
                    percentage: percentage,
                    color: COLORS[index % COLORS.length],
                    priceChange24h: holding.price_change_24h || 0,
                    currentPrice: holding.current_price,
                    logo: holding.logo,
                    holdings: holding.holdings_amount,
                    holdingsType: holding.holdings_type,
                };
            })
            .sort((a, b) => b.value - a.value); // Sort by value descending
    }, [holdings, totalValue]);

    // Loading state
    if (isLoading) {
        return (
            <Card className={cn('', className)}>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                            <div>
                                <div className="mb-1 h-5 w-32 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                            </div>
                        </div>
                        <div className="h-12 w-24 animate-pulse rounded-md bg-muted" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={`holdings-skeleton-${i}`} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 animate-pulse rounded-full bg-muted" />
                                    <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
                                    <div className="space-y-1">
                                        <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                                        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (!allocationData || allocationData.length === 0) {
        return (
            <Card className={cn('', className)}>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/20">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-foreground">Holdings Breakdown</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Detailed portfolio composition</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex h-48 flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                            <DollarSign className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-1 font-medium text-foreground">No holdings to display</h3>
                        <p className="text-sm text-muted-foreground">Add cryptocurrencies to your watchlist to see the breakdown</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('', className)}>
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/20">
                            <BarChart3 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-foreground">Holdings Breakdown</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Detailed portfolio composition</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="rounded-md bg-muted/50 px-3 py-1.5">
                            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Total Value</span>
                            <p className="text-sm font-bold text-foreground">{formatCurrency(totalValue)}</p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
                <div className="max-h-96 space-y-2 overflow-y-auto">
                    {allocationData.map((item) => (
                        <div
                            key={item.symbol}
                            className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-3">
                                {/* Color indicator */}
                                <div
                                    className="h-3 w-3 flex-shrink-0 rounded-full border"
                                    style={{ backgroundColor: item.color }}
                                    aria-label={`${item.symbol} color indicator`}
                                />

                                {/* Coin info */}
                                <div className="flex items-center gap-2">
                                    {item.logo && <img src={item.logo} alt={item.symbol} className="h-8 w-8 rounded-full sm:h-6 sm:w-6" />}
                                    <div>
                                        <p className="text-sm font-medium sm:text-sm">{item.symbol}</p>
                                        <p className="text-xs text-muted-foreground">{item.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Value and percentage */}
                            <div className="flex items-center justify-between sm:flex-col sm:text-right">
                                <div className="flex items-center gap-2 sm:flex-col sm:gap-0">
                                    <p className="text-sm font-semibold">{formatPercentage(item.percentage)}</p>
                                    <p className="text-xs text-muted-foreground">{formatCurrency(item.value)}</p>
                                </div>
                                <div className="flex items-center gap-1 sm:mt-1 sm:justify-end">
                                    <Badge variant={item.priceChange24h >= 0 ? 'default' : 'destructive'} className="px-1.5 py-0.5 text-xs">
                                        {item.priceChange24h >= 0 ? (
                                            <TrendingUp className="mr-1 h-2 w-2" />
                                        ) : (
                                            <TrendingDown className="mr-1 h-2 w-2" />
                                        )}
                                        {Math.abs(item.priceChange24h).toFixed(1)}%
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3 text-center dark:from-blue-950/20 dark:to-blue-900/20">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Assets</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{allocationData.length}</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-3 text-center dark:from-purple-950/20 dark:to-purple-900/20">
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Largest</p>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                            {allocationData.length > 0 ? formatPercentage(allocationData[0].percentage) : '0%'}
                        </p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-3 text-center dark:from-green-950/20 dark:to-green-900/20">
                        <p className="text-xs font-medium text-green-700 dark:text-green-300">Gainers</p>
                        <p className="text-lg font-bold text-green-600">{allocationData.filter((item) => item.priceChange24h > 0).length}</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-3 text-center dark:from-red-950/20 dark:to-red-900/20">
                        <p className="text-xs font-medium text-red-700 dark:text-red-300">Losers</p>
                        <p className="text-lg font-bold text-red-600">{allocationData.filter((item) => item.priceChange24h < 0).length}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
