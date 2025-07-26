import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Coins, DollarSign, Percent, Target } from 'lucide-react';

interface WatchlistItem {
    id?: number;
    symbol: string;
    alert_price?: number | null;
    holdings_amount?: number | null;
    purchase_price?: number | null;
    alert_type?: string;
    notes?: string | null;
    enabled?: boolean;
}

interface WatchlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableSymbols: string[];
    editItem?: WatchlistItem | null;
    currentPrice?: number | null;
}

export function WatchlistModal({ isOpen, onClose, availableSymbols, editItem = null, currentPrice = null }: WatchlistModalProps) {
    const isEditing = !!editItem;

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        symbol: editItem?.symbol || '',
        alert_price: editItem?.alert_price?.toString() || '',
        holdings_amount: editItem?.holdings_amount?.toString() || '',
        holdings_type: editItem?.holdings_type || 'usd_value', // Default to USD value
        purchase_price: editItem?.purchase_price?.toString() || '',
        alert_type: editItem?.alert_type || 'market_price',
        notes: editItem?.notes || '',
    });

    // Calculate coin quantity from USD value
    const getCoinQuantityFromUSD = (usdValue: number) => {
        if (!currentPrice || !usdValue) return 0;
        return usdValue / currentPrice;
    };

    // Calculate USD value from coin quantity
    const getUSDValueFromCoins = (coinQuantity: number) => {
        if (!currentPrice || !coinQuantity) return 0;
        return coinQuantity * currentPrice;
    };

    // Auto-calculate the opposite value when user types
    const handleHoldingsAmountChange = (value: string) => {
        setData('holdings_amount', value);
    };

    // Switch between input types
    const handleHoldingsTypeChange = (type: string) => {
        setData('holdings_type', type);
        // Clear the amount when switching types
        setData('holdings_amount', '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            patch(`/watchlist/${editItem.id}`, {
                onSuccess: () => {
                    handleClose();
                },
            });
        } else {
            post('/watchlist/add', {
                onSuccess: () => {
                    handleClose();
                },
            });
        }
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const calculateCoinQuantity = () => {
        if (!data.holdings_amount || !currentPrice) return 0;

        if (data.holdings_type === 'usd_value') {
            // User entered USD value, calculate coin quantity
            return parseFloat(data.holdings_amount) / currentPrice;
        } else {
            // User entered coin quantity directly
            return parseFloat(data.holdings_amount);
        }
    };

    const calculatePortfolioValue = () => {
        if (!data.holdings_amount || !currentPrice) return 0;

        if (data.holdings_type === 'usd_value') {
            // User entered USD value directly
            return parseFloat(data.holdings_amount);
        } else {
            // User entered coin quantity, calculate USD value
            return parseFloat(data.holdings_amount) * currentPrice;
        }
    };

    const calculateProfitLoss = () => {
        if (!data.holdings_amount || !data.purchase_price || !currentPrice) return 0;

        const coinQuantity = calculateCoinQuantity();
        const purchasePrice = parseFloat(data.purchase_price);
        const currentValue = coinQuantity * currentPrice;
        const purchaseValue = coinQuantity * purchasePrice;
        return currentValue - purchaseValue;
    };

    const calculatePortfolioValue = () => {
        if (data.holdings_amount && currentPrice) {
            const amount = parseFloat(data.holdings_amount);
            if (data.holdings_type === 'usd_value') {
                // If holdings are in USD value, return the entered amount
                return amount;
            } else {
                // If holdings are in coin quantity, multiply by current price
                return amount * currentPrice;
            }
        }
        return 0;
    };

    const calculateCoinQuantity = () => {
        if (data.holdings_amount && currentPrice) {
            const amount = parseFloat(data.holdings_amount);
            if (data.holdings_type === 'usd_value') {
                // If holdings are in USD, calculate coin quantity
                return amount / currentPrice;
            } else {
                // If holdings are already in coins, return as-is
                return amount;
            }
        }
        return 0;
    };

    const calculateProfitLoss = () => {
        if (data.holdings_amount && data.purchase_price && currentPrice) {
            const purchasePrice = parseFloat(data.purchase_price);
            const coinQuantity = calculateCoinQuantity();
            const currentValue = coinQuantity * currentPrice;
            const purchaseValue = coinQuantity * purchasePrice;
            return currentValue - purchaseValue;
        }
        return 0;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        {isEditing ? 'Edit Watchlist Item' : 'Add to Watchlist'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update your cryptocurrency holding and alert settings'
                            : 'Add a cryptocurrency to your watchlist with holdings and alert preferences'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cryptocurrency Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="symbol">Cryptocurrency *</Label>
                        <Select value={data.symbol} onValueChange={(value) => setData('symbol', value)} disabled={isEditing}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a cryptocurrency" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableSymbols.map((symbol) => (
                                    <SelectItem key={symbol} value={symbol}>
                                        {symbol}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.symbol && <p className="text-sm text-red-600">{errors.symbol}</p>}
                    </div>

                    {/* Current Price Display */}
                    {currentPrice && (
                        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="text-blue-800 dark:text-blue-200">
                                Current market price: {formatCurrency(currentPrice)}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Holdings Section */}
                    <div className="space-y-4">
                        {/* Holdings Type Selection */}
                        <div className="space-y-3">
                            <Label>Holdings Input Type</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={data.holdings_type === 'usd_value' ? 'default' : 'outline'}
                                    className="justify-start gap-2"
                                    onClick={() => setData('holdings_type', 'usd_value')}
                                >
                                    <DollarSign className="h-4 w-4" />
                                    USD Value
                                </Button>
                                <Button
                                    type="button"
                                    variant={data.holdings_type === 'coin_quantity' ? 'default' : 'outline'}
                                    className="justify-start gap-2"
                                    onClick={() => setData('holdings_type', 'coin_quantity')}
                                >
                                    <Coins className="h-4 w-4" />
                                    Coin Quantity
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {data.holdings_type === 'usd_value'
                                    ? 'Enter the dollar amount of your investment (e.g., $4119)'
                                    : 'Enter the number of coins you own (e.g., 1.5 BTC)'}
                            </p>
                        </div>

                        {/* Quick Examples */}
                        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                            <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-green-800 dark:text-green-200">
                                <strong>Examples:</strong>
                                {data.holdings_type === 'usd_value' ? (
                                    <div className="mt-1 space-y-1">
                                        <div>• Portfolio worth $4,097.79 → Enter: 4097.79</div>
                                        <div>• Invested $1,000 in Bitcoin → Enter: 1000</div>
                                        <div>• DCA $500/month for 6 months → Enter: 3000</div>
                                    </div>
                                ) : (
                                    <div className="mt-1 space-y-1">
                                        <div>• Own 1.103112 ETH → Enter: 1.103112</div>
                                        <div>• Hold 0.05 Bitcoin → Enter: 0.05</div>
                                        <div>• Have 1,500 ADA → Enter: 1500</div>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>

                        {/* Holdings Amount Input */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="holdings_amount">
                                    {data.holdings_type === 'usd_value' ? 'Investment Amount (USD)' : 'Coin Quantity'}
                                </Label>
                                <div className="relative">
                                    {data.holdings_type === 'usd_value' && (
                                        <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    )}
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder={data.holdings_type === 'usd_value' ? 'e.g., 4119.00' : 'e.g., 0.5'}
                                        value={data.holdings_amount}
                                        onChange={(e) => setData('holdings_amount', e.target.value)}
                                        className={data.holdings_type === 'usd_value' ? 'pl-9' : ''}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {data.holdings_type === 'usd_value'
                                        ? 'Total dollar value of your investment'
                                        : `Number of ${data.symbol || 'coins'} you own`}
                                </p>
                                {/* Real-time conversion display */}
                                {data.holdings_amount && currentPrice && (
                                    <div className="rounded-md bg-blue-50 p-2 dark:bg-blue-950">
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            {data.holdings_type === 'usd_value' ? (
                                                <>
                                                    ≈ {calculateCoinQuantity().toFixed(8)} {data.symbol || 'coins'}
                                                </>
                                            ) : (
                                                <>≈ {formatCurrency(calculatePortfolioValue())}</>
                                            )}
                                        </p>
                                    </div>
                                )}
                                {errors.holdings_amount && <p className="text-sm text-red-600">{errors.holdings_amount}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purchase_price">Purchase Price (Optional)</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="e.g., 3500.00"
                                    value={data.purchase_price}
                                    onChange={(e) => setData('purchase_price', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Your average purchase price per coin</p>
                                {errors.purchase_price && <p className="text-sm text-red-600">{errors.purchase_price}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Calculations */}
                    {data.holdings_amount && currentPrice && (
                        <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                            <Label className="text-sm font-medium">Portfolio Summary</Label>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Coin Quantity</p>
                                    <p className="text-lg font-semibold">
                                        {calculateCoinQuantity().toFixed(8)} {data.symbol}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Current Value</p>
                                    <p className="text-lg font-semibold text-green-600">{formatCurrency(calculatePortfolioValue())}</p>
                                </div>
                                {data.purchase_price && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Profit/Loss</p>
                                        <p className={`text-lg font-semibold ${calculateProfitLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {calculateProfitLoss() >= 0 ? '+' : ''}
                                            {formatCurrency(calculateProfitLoss())}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Alert Section */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="alert_price">Alert Price (Optional)</Label>
                            <Input
                                type="number"
                                step="any"
                                placeholder="e.g., 4000.00"
                                value={data.alert_price}
                                onChange={(e) => setData('alert_price', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Price to trigger an alert</p>
                            {errors.alert_price && <p className="text-sm text-red-600">{errors.alert_price}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alert_type">Alert Based On</Label>
                            <Select value={data.alert_type} onValueChange={(value) => setData('alert_type', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="market_price">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Current Market Price
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="purchase_price">
                                        <div className="flex items-center gap-2">
                                            <Percent className="h-4 w-4" />
                                            Purchase Price Performance
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.alert_type && <p className="text-sm text-red-600">{errors.alert_type}</p>}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            placeholder="Add any notes about this investment..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Personal notes about this cryptocurrency holding</p>
                        {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={processing || !data.symbol} className="flex-1">
                            {processing ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                                    {isEditing ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                <>{isEditing ? 'Update Watchlist Item' : 'Add to Watchlist'}</>
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
