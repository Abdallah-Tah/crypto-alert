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
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
                        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
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
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        Holdings Breakdown
                    </CardTitle>
                    <CardDescription>Detailed view of your portfolio holdings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-64 flex-col items-center justify-center text-center">
                        <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No holdings to display</p>
                        <p className="mt-1 text-sm text-muted-foreground">Add some cryptocurrencies to your watchlist to see your breakdown</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('', className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Holdings Breakdown
                </CardTitle>
                <CardDescription>Detailed view of your portfolio holdings • Total: {formatCurrency(totalValue)}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                    {allocationData.map((item) => (
                        <div
                            key={item.symbol}
                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-center gap-3">
                                {/* Color indicator */}
                                <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />

                                {/* Coin info */}
                                <div className="flex items-center gap-2">
                                    {item.logo && <img src={item.logo} alt={item.symbol} className="h-6 w-6 rounded-full" />}
                                    <div>
                                        <p className="text-sm font-medium">{item.symbol}</p>
                                        <p className="text-xs text-muted-foreground">{item.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Value and percentage */}
                            <div className="text-right">
                                <p className="text-sm font-semibold">{formatPercentage(item.percentage)}</p>
                                <p className="text-xs text-muted-foreground">{formatCurrency(item.value)}</p>
                                <div className="mt-1 flex items-center justify-end gap-1">
                                    <Badge variant={item.priceChange24h >= 0 ? 'default' : 'destructive'} className="px-1 py-0 text-xs">
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
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-sm font-medium">Assets</p>
                        <p className="text-lg font-bold">{allocationData.length}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-sm font-medium">Largest</p>
                        <p className="text-lg font-bold">{allocationData.length > 0 ? formatPercentage(allocationData[0].percentage) : '0%'}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-sm font-medium">Gainers</p>
                        <p className="text-lg font-bold text-green-600">{allocationData.filter((item) => item.priceChange24h > 0).length}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-sm font-medium">Losers</p>
                        <p className="text-lg font-bold text-red-600">{allocationData.filter((item) => item.priceChange24h < 0).length}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
