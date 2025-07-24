import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { DollarSign, Percent, Target } from 'lucide-react';

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
        purchase_price: editItem?.purchase_price?.toString() || '',
        alert_type: editItem?.alert_type || 'market_price',
        notes: editItem?.notes || '',
    });

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

    const calculatePortfolioValue = () => {
        if (data.holdings_amount && currentPrice) {
            return parseFloat(data.holdings_amount) * currentPrice;
        }
        return 0;
    };

    const calculateProfitLoss = () => {
        if (data.holdings_amount && data.purchase_price && currentPrice) {
            const holdings = parseFloat(data.holdings_amount);
            const purchasePrice = parseFloat(data.purchase_price);
            const currentValue = holdings * currentPrice;
            const purchaseValue = holdings * purchasePrice;
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="holdings_amount">Holdings Amount</Label>
                            <Input
                                type="number"
                                step="any"
                                placeholder="e.g., 0.5"
                                value={data.holdings_amount}
                                onChange={(e) => setData('holdings_amount', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">How much of this cryptocurrency you own</p>
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
                            <p className="text-xs text-muted-foreground">Your average purchase price</p>
                            {errors.purchase_price && <p className="text-sm text-red-600">{errors.purchase_price}</p>}
                        </div>
                    </div>

                    {/* Portfolio Calculations */}
                    {data.holdings_amount && currentPrice && (
                        <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-2">
                            <div>
                                <Label className="text-sm font-medium">Portfolio Value</Label>
                                <p className="text-lg font-semibold text-green-600">{formatCurrency(calculatePortfolioValue())}</p>
                            </div>
                            {data.purchase_price && (
                                <div>
                                    <Label className="text-sm font-medium">Profit/Loss</Label>
                                    <p className={`text-lg font-semibold ${calculateProfitLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {calculateProfitLoss() >= 0 ? '+' : ''}
                                        {formatCurrency(calculateProfitLoss())}
                                    </p>
                                </div>
                            )}
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
