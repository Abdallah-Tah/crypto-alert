import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, Bell, BellOff, Edit, Eye, Plus, Star, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface WatchlistItem {
    id: number;
    symbol: string;
    alert_price: number | null;
    enabled: boolean;
    current_price?: number;
    price_change_24h?: number;
    last_updated?: string;
}

interface WatchlistProps {
    watchlist: WatchlistItem[];
    availableSymbols: string[];
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Watchlist', href: '/watchlist' },
];

export default function Watchlist({ watchlist, availableSymbols, flash }) {
    const [editingPrice, setEditingPrice] = useState(null);
    const [newPrice, setNewPrice] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        symbol: '',
        alert_price: '',
    });

    const handleAddCoin = (e) => {
        e.preventDefault();
        post('/watchlist/add', {
            onSuccess: () => {
                reset();
            },
        });
    };

    const toggleAlert = (itemId) => {
        router.patch(
            `/watchlist/${itemId}/toggle`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const removeCoin = (itemId) => {
        if (confirm('Are you sure you want to remove this coin from your watchlist?')) {
            router.delete(`/watchlist/${itemId}`, {
                preserveScroll: true,
            });
        }
    };

    const startEditingPrice = (item) => {
        setEditingPrice(item.id);
        setNewPrice(item.alert_price?.toString() || '');
    };

    const savePrice = (itemId) => {
        router.patch(
            `/watchlist/${itemId}/price`,
            {
                alert_price: parseFloat(newPrice),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingPrice(null);
                    setNewPrice('');
                },
            },
        );
    };

    const cancelEdit = () => {
        setEditingPrice(null);
        setNewPrice('');
    };

    const formatPrice = (price) => {
        if (!price) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
        }).format(price);
    };

    const formatPercentage = (percentage) => {
        if (percentage === null || percentage === undefined) return 'N/A';
        const formatted = percentage.toFixed(2);
        return percentage >= 0 ? `+${formatted}%` : `${formatted}%`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Watchlist" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                        <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Crypto Watchlist</h1>
                        <p className="text-sm text-muted-foreground">Track your favorite cryptocurrencies and set price alerts</p>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-200">{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-200">{flash.error}</AlertDescription>
                    </Alert>
                )}

                {/* Add Coin Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-600" />
                            Add Cryptocurrency
                        </CardTitle>
                        <CardDescription>Add a new cryptocurrency to your watchlist with optional price alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddCoin} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="symbol">Cryptocurrency</Label>
                                    <Select value={data.symbol} onValueChange={(value) => setData('symbol', value)}>
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

                                <div className="space-y-2">
                                    <Label htmlFor="alert_price">Alert Price (Optional)</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="Enter target price"
                                        value={data.alert_price}
                                        onChange={(e) => setData('alert_price', e.target.value)}
                                    />
                                    {errors.alert_price && <p className="text-sm text-red-600">{errors.alert_price}</p>}
                                </div>
                            </div>

                            <Button type="submit" disabled={processing || !data.symbol} className="w-full">
                                {processing ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add to Watchlist
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Watchlist Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-purple-600" />
                            Your Watchlist
                            <Badge variant="secondary" className="ml-auto">
                                {watchlist.length} coins
                            </Badge>
                        </CardTitle>
                        <CardDescription>Monitor prices and manage alerts for your favorite cryptocurrencies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {watchlist.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Star className="mx-auto mb-4 h-16 w-16 opacity-50" />
                                <h3 className="mb-2 text-lg font-medium">No coins in watchlist</h3>
                                <p className="text-sm">Add your first cryptocurrency above to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {watchlist.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-foreground">{item.symbol}</h3>
                                                    {item.current_price && <Badge variant="outline">{formatPrice(item.current_price)}</Badge>}
                                                </div>
                                                <div className="mt-1 flex items-center gap-2">
                                                    {item.alert_price && (
                                                        <span className="text-sm text-muted-foreground">Alert: {formatPrice(item.alert_price)}</span>
                                                    )}
                                                    {item.price_change_24h !== null && (
                                                        <div
                                                            className={`flex items-center gap-1 text-sm ${
                                                                item.price_change_24h >= 0
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                            }`}
                                                        >
                                                            {item.price_change_24h >= 0 ? (
                                                                <TrendingUp className="h-3 w-3" />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3" />
                                                            )}
                                                            {formatPercentage(item.price_change_24h)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Alert Toggle */}
                                            <div className="flex items-center gap-2">
                                                <Checkbox checked={item.enabled} onCheckedChange={() => toggleAlert(item.id)} />
                                                {item.enabled ? (
                                                    <Bell className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <BellOff className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>

                                            {/* Edit Price */}
                                            {editingPrice === item.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        step="any"
                                                        value={newPrice}
                                                        onChange={(e) => setNewPrice(e.target.value)}
                                                        className="w-24"
                                                        placeholder="Price"
                                                    />
                                                    <Button size="sm" onClick={() => savePrice(item.id)} disabled={!newPrice}>
                                                        Save
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="ghost" onClick={() => startEditingPrice(item)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {/* Remove */}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeCoin(item.id)}
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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
