import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PriceDisplayProps {
    price: number | null;
    change?: number | null;
    symbol?: string;
    className?: string;
    showTrend?: boolean;
}

export function PriceDisplay({ 
    price, 
    change, 
    symbol, 
    className = '', 
    showTrend = true 
}: PriceDisplayProps) {
    const formatPrice = (value: number | null) => {
        if (!value) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: value < 1 ? 6 : 2,
        }).format(value);
    };

    const formatPercentage = (percentage: number | null) => {
        if (percentage === null || percentage === undefined) return '0.00%';
        const formatted = Math.abs(percentage).toFixed(2);
        return percentage >= 0 ? `+${formatted}%` : `-${formatted}%`;
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {symbol && (
                <Badge variant="outline" className="text-xs">
                    {symbol}
                </Badge>
            )}
            
            <span className="font-semibold text-foreground">
                {formatPrice(price)}
            </span>
            
            {showTrend && change !== null && change !== undefined && (
                <div className={`flex items-center gap-1 text-sm ${
                    change >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                }`}>
                    {change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                    ) : (
                        <TrendingDown className="h-3 w-3" />
                    )}
                    {formatPercentage(change)}
                </div>
            )}
        </div>
    );
}
