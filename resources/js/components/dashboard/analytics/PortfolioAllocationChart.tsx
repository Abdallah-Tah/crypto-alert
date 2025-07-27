import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AllocationData, PortfolioHolding } from '@/types/portfolio';
import { DollarSign, Percent, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

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

interface PortfolioAllocationChartProps {
    holdings?: PortfolioHolding[];
    totalValue?: number;
    isLoading?: boolean;
    className?: string;
}

export function PortfolioAllocationChart({ holdings = [], totalValue = 0, isLoading = false, className = '' }: PortfolioAllocationChartProps) {
    // Use media queries without TypeScript hook for now
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

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

    // Custom tooltip for the pie chart
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload as AllocationData;
            return (
                <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="mb-2 flex items-center gap-2">
                        {data.logo && <img src={data.logo} alt={data.symbol} className="h-6 w-6 rounded-full" />}
                        <div>
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-sm text-muted-foreground">{data.symbol}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm">
                            <span className="font-medium">Value:</span> {formatCurrency(data.value)}
                        </p>
                        <p className="text-sm">
                            <span className="font-medium">Allocation:</span> {formatPercentage(data.percentage)}
                        </p>
                        <p className="text-sm">
                            <span className="font-medium">Price:</span> {formatCurrency(data.currentPrice)}
                        </p>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">24h:</span>
                            <span className={cn('flex items-center gap-1 text-sm', data.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600')}>
                                {data.priceChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {Math.abs(data.priceChange24h).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

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
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
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
                        <Percent className="h-5 w-5 text-blue-600" />
                        Portfolio Allocation
                    </CardTitle>
                    <CardDescription>Your cryptocurrency portfolio distribution</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-64 flex-col items-center justify-center text-center">
                        <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No holdings to display</p>
                        <p className="mt-1 text-sm text-muted-foreground">Add some cryptocurrencies to your watchlist to see your allocation</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('', className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-blue-600" />
                    Portfolio Allocation
                </CardTitle>
                <CardDescription>Your cryptocurrency portfolio distribution • Total: {formatCurrency(totalValue)}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Pie Chart */}
                    <div className="lg:col-span-2">
                        <div className="h-64 md:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={allocationData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={isMobile ? 80 : isTablet ? 100 : 120}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Allocation List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Holdings Breakdown</h3>
                        <div className="max-h-80 space-y-2 overflow-y-auto">
                            {allocationData.map((item, index) => (
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
                    </div>
                </div>

                {/* Mobile Summary Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4 md:hidden md:grid-cols-4">
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
