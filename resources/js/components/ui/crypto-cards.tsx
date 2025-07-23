import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Star, Brain, Bell } from 'lucide-react';

export function CryptoCard({ 
    symbol, 
    currentPrice, 
    priceChange24h, 
    alertPrice, 
    hasAlert, 
    onToggleAlert, 
    onEditPrice, 
    onRemove,
    className = "" 
}) {
    const formatPrice = (price) => {
        if (!price) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: price < 1 ? 6 : 2,
        }).format(price);
    };

    const formatPercentage = (percentage) => {
        if (percentage === null || percentage === undefined) return '0.00%';
        const formatted = Math.abs(percentage).toFixed(2);
        return percentage >= 0 ? `+${formatted}%` : `-${formatted}%`;
    };

    const getPriceChangeColor = (change) => {
        if (change >= 0) return 'text-green-600 dark:text-green-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {symbol}
                    </CardTitle>
                    {hasAlert && (
                        <Badge variant="secondary" className="text-xs">
                            <Bell className="h-3 w-3 mr-1" />
                            Alert Active
                        </Badge>
                    )}
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {/* Price Information */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Price</span>
                        <span className="font-semibold text-lg">
                            {formatPrice(currentPrice)}
                        </span>
                    </div>
                    
                    {priceChange24h !== null && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">24h Change</span>
                            <div className={`flex items-center gap-1 text-sm font-medium ${getPriceChangeColor(priceChange24h)}`}>
                                {priceChange24h >= 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {formatPercentage(priceChange24h)}
                            </div>
                        </div>
                    )}
                    
                    {alertPrice && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Alert Price</span>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {formatPrice(alertPrice)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={onToggleAlert}
                    >
                        <Bell className="h-3 w-3 mr-1" />
                        {hasAlert ? 'Disable' : 'Enable'} Alert
                    </Button>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onEditPrice}
                    >
                        Edit Price
                    </Button>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                        Remove
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function AIAdviceCard({ advice, onDismiss, className = "" }) {
    return (
        <Card className={`relative overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 ${className}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Brain className="h-5 w-5" />
                    AI Investment Advice
                    <Badge variant="secondary" className="ml-auto">
                        {advice.model_used}
                    </Badge>
                </CardTitle>
                {advice.confidence_score && (
                    <CardDescription className="text-blue-700 dark:text-blue-300">
                        Confidence Score: {advice.confidence_score}%
                    </CardDescription>
                )}
            </CardHeader>
            
            <CardContent>
                <div className="space-y-4">
                    <div className="text-blue-900 dark:text-blue-100 whitespace-pre-wrap">
                        {advice.suggestion}
                    </div>
                    
                    {onDismiss && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={onDismiss}
                            className="w-full"
                        >
                            Dismiss
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
