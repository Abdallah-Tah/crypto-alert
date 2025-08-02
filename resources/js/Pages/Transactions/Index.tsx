import { CryptoSearch } from '@/components/CryptoSearch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, DollarSign, Download, Edit, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface Transaction {
    id: number;
    symbol: string;
    type: string;
    quantity: string;
    price_per_unit: string;
    total_value: string;
    fees: string;
    exchange: string | null;
    notes: string | null;
    transaction_date: string;
    is_taxable: boolean;
    external_id: string | null;
}

interface Props {
    transactions: {
        data: Transaction[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
    transactionTypes: Record<string, string>;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transaction Management', href: '/transactions' },
];

const TransactionIndex: React.FC<Props> = ({ transactions, transactionTypes }) => {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);

    const [formData, setFormData] = useState({
        symbol: '',
        type: '',
        quantity: '',
        price_per_unit: '',
        fees: '',
        exchange: '',
        external_id: '',
        notes: '',
        transaction_date: '',
        is_taxable: true,
    });

    const resetForm = () => {
        setFormData({
            symbol: '',
            type: '',
            quantity: '',
            price_per_unit: '',
            fees: '',
            exchange: '',
            external_id: '',
            notes: '',
            transaction_date: '',
            is_taxable: true,
        });
        setCurrentPrice(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingTransaction) {
                await router.put(`/transactions/${editingTransaction.id}`, formData);
                toast.success('Transaction updated successfully');
                setIsEditDialogOpen(false);
            } else {
                await router.post('/transactions', formData);
                toast.success('Transaction added successfully');
                setIsAddDialogOpen(false);
            }
            resetForm();
            setEditingTransaction(null);
        } catch (err) {
            console.error('Error saving transaction:', err);
            toast.error('Failed to save transaction');
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            symbol: transaction.symbol,
            type: transaction.type,
            quantity: transaction.quantity,
            price_per_unit: transaction.price_per_unit,
            fees: transaction.fees || '',
            exchange: transaction.exchange || '',
            external_id: transaction.external_id || '',
            notes: transaction.notes || '',
            transaction_date: transaction.transaction_date.split('T')[0],
            is_taxable: transaction.is_taxable,
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = async (transaction: Transaction) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        try {
            await router.delete(`/transactions/${transaction.id}`);
            toast.success('Transaction deleted successfully');
        } catch (err) {
            console.error('Error deleting transaction:', err);
            toast.error('Failed to delete transaction');
        }
    };

    const fetchCurrentPrice = async (symbol: string) => {
        if (!symbol) return;

        setLoadingPrice(true);
        try {
            const response = await fetch(`/transactions/price/${symbol}`);
            if (response.ok) {
                const data = await response.json();
                setCurrentPrice(data.price);
                setFormData((prev) => ({ ...prev, price_per_unit: data.price.toString() }));
            }
        } catch (error) {
            console.error('Failed to fetch price:', error);
        } finally {
            setLoadingPrice(false);
        }
    };

    const downloadTemplate = () => {
        window.location.href = '/transactions/template';
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'buy':
                return 'bg-green-100 text-green-800';
            case 'sell':
                return 'bg-red-100 text-red-800';
            case 'transfer_in':
                return 'bg-blue-100 text-blue-800';
            case 'transfer_out':
                return 'bg-orange-100 text-orange-800';
            case 'staking_reward':
                return 'bg-purple-100 text-purple-800';
            case 'airdrop':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const TransactionForm = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="symbol">Cryptocurrency *</Label>
                    <CryptoSearch
                        value={formData.symbol}
                        onValueChange={(value) => {
                            setFormData((prev) => ({ ...prev, symbol: value }));
                            fetchCurrentPrice(value);
                        }}
                        placeholder="Search for a cryptocurrency..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Transaction Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(transactionTypes).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                        id="quantity"
                        type="number"
                        step="0.00000001"
                        placeholder="0.00000000"
                        value={formData.quantity}
                        onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="price_per_unit">Price Per Unit (USD) *</Label>
                        {currentPrice && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-xs"
                                onClick={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        price_per_unit: currentPrice.toString(),
                                    }))
                                }
                            >
                                <DollarSign className="mr-1 h-3 w-3" />
                                Current: {formatCurrency(currentPrice)}
                            </Button>
                        )}
                    </div>
                    <Input
                        id="price_per_unit"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price_per_unit}
                        onChange={(e) => setFormData((prev) => ({ ...prev, price_per_unit: e.target.value }))}
                        required
                    />
                    {loadingPrice && <p className="text-xs text-gray-500">Fetching current price...</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fees">Fees (USD)</Label>
                    <Input
                        id="fees"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.fees}
                        onChange={(e) => setFormData((prev) => ({ ...prev, fees: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="transaction_date">Date *</Label>
                    <Input
                        id="transaction_date"
                        type="date"
                        value={formData.transaction_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, transaction_date: e.target.value }))}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="exchange">Exchange</Label>
                    <Input
                        id="exchange"
                        placeholder="Coinbase, Binance, etc."
                        value={formData.exchange}
                        onChange={(e) => setFormData((prev) => ({ ...prev, exchange: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="external_id">Transaction ID</Label>
                    <Input
                        id="external_id"
                        placeholder="Exchange transaction ID"
                        value={formData.external_id}
                        onChange={(e) => setFormData((prev) => ({ ...prev, external_id: e.target.value }))}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    placeholder="Additional notes about this transaction"
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="is_taxable"
                    checked={formData.is_taxable}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_taxable: checked }))}
                />
                <Label htmlFor="is_taxable">Taxable Transaction</Label>
            </div>

            {formData.quantity && formData.price_per_unit && (
                <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-sm text-gray-600">
                        Total Value: {formatCurrency(parseFloat(formData.quantity) * parseFloat(formData.price_per_unit))}
                        {formData.fees && ` + ${formatCurrency(formData.fees)} fees`}
                    </p>
                </div>
            )}

            <div className="flex justify-end space-x-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setIsAddDialogOpen(false);
                        setIsEditDialogOpen(false);
                        resetForm();
                        setEditingTransaction(null);
                    }}
                >
                    Cancel
                </Button>
                <Button type="submit">{editingTransaction ? 'Update Transaction' : 'Add Transaction'}</Button>
            </div>
        </form>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Transaction Management</h1>
                        <p className="text-gray-600">Manage your cryptocurrency transactions for accurate tax reporting</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={downloadTemplate}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Template
                        </Button>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Transaction
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add New Transaction</DialogTitle>
                                </DialogHeader>
                                <TransactionForm />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Important for Tax Reporting:</strong> For accurate tax calculations, you need to enter both your BUY transactions (to
                        establish cost basis) and SELL transactions (to calculate gains/losses). Make sure to include all fees and use the exact
                        transaction dates.
                    </AlertDescription>
                </Alert>

                <Card>
                    <div className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Transaction History</h2>
                            <p className="text-sm text-gray-500">{transactions.total} total transactions</p>
                        </div>

                        {transactions.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-600">No Transactions Found</h3>
                                <p className="mb-4 text-gray-500">
                                    Start by adding your cryptocurrency transactions to generate accurate tax reports.
                                </p>
                                <Button onClick={() => setIsAddDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Transaction
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Asset</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Total Value</TableHead>
                                            <TableHead>Fees</TableHead>
                                            <TableHead>Exchange</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                                                <TableCell>
                                                    <Badge className={getTypeColor(transaction.type)}>{transactionTypes[transaction.type]}</Badge>
                                                </TableCell>
                                                <TableCell className="font-mono">{transaction.symbol}</TableCell>
                                                <TableCell className="font-mono">{parseFloat(transaction.quantity).toFixed(8)}</TableCell>
                                                <TableCell>{formatCurrency(transaction.price_per_unit)}</TableCell>
                                                <TableCell>{formatCurrency(transaction.total_value)}</TableCell>
                                                <TableCell>{transaction.fees ? formatCurrency(transaction.fees) : '-'}</TableCell>
                                                <TableCell>{transaction.exchange || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-1">
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Transaction</DialogTitle>
                        </DialogHeader>
                        <TransactionForm />
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default TransactionIndex;
