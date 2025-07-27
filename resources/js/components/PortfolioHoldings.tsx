import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PortfolioHolding } from '@/types/portfolio';
import { Coins, TrendingDown, TrendingUp } from 'lucide-react';

interface PortfolioHoldingsProps {
    holdings: PortfolioHolding[];
    isLoading?: boolean;
    className?: string;
}

export function PortfolioHoldings({ holdings, isLoading = false, className }: PortfolioHoldingsProps) {
    const formatPrice = (price: number): string => {
        if (!price) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: price >= 1 ? 2 : 6,
        }).format(price);
    };

    const formatQuantity = (amount: number, symbol: string): string => {
        if (!amount) return '0';

        // Format based on symbol - some coins need more decimal places
        const decimals = symbol === 'BTC' || symbol === 'ETH' ? 6 : 2;
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals,
        }).format(amount);
    };

    const calculateHoldingValue = (holding: PortfolioHolding): number => {
        if (!holding.current_price || !holding.holdings_amount) return 0;

        if (holding.holdings_type === 'usd_value' && holding.purchase_price) {
            // Calculate coin quantity from USD value and purchase price
            const coinQuantity = holding.holdings_amount / holding.purchase_price;
            return holding.current_price * coinQuantity;
        } else if (holding.holdings_type === 'coin_quantity') {
            // Direct coin quantity
            return holding.current_price * holding.holdings_amount;
        } else {
            // Fallback to USD value if no purchase price
            return holding.holdings_amount;
        }
    };

    const getDisplayQuantity = (holding: PortfolioHolding): number => {
        if (holding.holdings_type === 'usd_value' && holding.purchase_price) {
            return holding.holdings_amount / holding.purchase_price;
        } else if (holding.holdings_type === 'coin_quantity') {
            return holding.holdings_amount;
        }
        return 0;
    };

    const getCleanSymbol = (symbol: string): string => {
        return symbol.replace('/USDT', '').replace('/USD', '');
    };

    if (!holdings || holdings.length === 0) {
        return (
            <Card className={cn('', className)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-green-500" />
                        Portfolio Holdings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Coins className="mb-4 h-12 w-12 opacity-50" />
                        <p>No holdings to display</p>
                        <p className="text-sm">Add coins to your watchlist to start tracking your portfolio</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('', className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-green-500" />
                    Portfolio Holdings
                    <Badge variant="secondary" className="ml-auto">
                        {holdings.length} {holdings.length === 1 ? 'asset' : 'assets'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {holdings.map((holding) => {
                        const holdingValue = calculateHoldingValue(holding);
                        const displayQuantity = getDisplayQuantity(holding);
                        const cleanSymbol = getCleanSymbol(holding.symbol);
                        const priceChange = holding.price_change_24h || 0;
                        const isPositive = priceChange >= 0;

                        return (
                            <div
                                key={holding.id}
                                className={cn(
                                    'flex items-center justify-between rounded-lg border p-3 transition-all duration-200',
                                    isLoading ? 'animate-pulse' : 'hover:bg-muted/50',
                                )}
                            >
                                {/* Left side - Symbol and quantity */}
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20">
                                        <span className="text-sm font-bold text-foreground">{cleanSymbol.slice(0, 3)}</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground">{cleanSymbol}</div>
                                        <div className="text-sm text-muted-foreground">{formatQuantity(displayQuantity, cleanSymbol)}</div>
                                    </div>
                                </div>

                                {/* Middle - Price chart placeholder */}
                                <div className="flex items-center">
                                    {isPositive ? (
                                        <TrendingUp className={cn('h-6 w-6', isPositive ? 'text-green-500' : 'text-red-500')} />
                                    ) : (
                                        <TrendingDown className={cn('h-6 w-6', isPositive ? 'text-green-500' : 'text-red-500')} />
                                    )}
                                </div>

                                {/* Right side - Value and price */}
                                <div className="text-right">
                                    <div
                                        className={cn(
                                            'rounded-md px-3 py-1 text-sm font-semibold text-white',
                                            isPositive ? 'bg-green-500' : 'bg-red-500',
                                        )}
                                    >
                                        {formatPrice(holdingValue)}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {formatPrice(holding.current_price || 0)}
                                        {priceChange !== 0 && (
                                            <span className={cn('ml-1', isPositive ? 'text-green-500' : 'text-red-500')}>
                                                {isPositive ? '+' : ''}
                                                {priceChange.toFixed(2)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
