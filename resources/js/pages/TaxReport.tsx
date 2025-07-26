import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Calendar, DollarSign, Download, FileText, PieChart, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface TaxReportProps {
    availableYears: number[];
    currentYear: number;
}

interface TaxData {
    user_id: number;
    tax_year: number;
    period: {
        start_date: string;
        end_date: string;
    };
    holdings_summary: {
        total_holdings: number;
        total_current_value: number;
        total_cost_basis: number;
        unrealized_gain_loss: number;
        unrealized_percentage: number;
    };
    realized_gains_losses: {
        summary: {
            short_term_gains: number;
            short_term_losses: number;
            short_term_net: number;
            long_term_gains: number;
            long_term_losses: number;
            long_term_net: number;
            total_net_gain_loss: number;
        };
    };
    tax_optimization: Array<{
        type: string;
        title: string;
        description: string;
        priority: string;
        potential_savings?:
            | string
            | number
            | {
                  short_term_offset_savings?: number;
                  long_term_offset_savings?: number;
                  max_annual_deduction?: number;
                  carryforward_amount?: number;
              };
    }>;
}

export default function TaxReport({ availableYears, currentYear }: TaxReportProps) {
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [taxData, setTaxData] = useState<TaxData | null>(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const response = await fetch('/tax-report/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ tax_year: selectedYear }),
            });

            const result = await response.json();
            if (result.success) {
                setTaxData(result.data);
            } else {
                console.error('Failed to generate tax report:', result.message);
            }
        } catch (error) {
            console.error('Error generating tax report:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = async () => {
        try {
            const response = await fetch('/tax-report/export-csv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ tax_year: selectedYear }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tax_report_${selectedYear}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'default';
            case 'low':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <AppLayout>
            <Head title="Tax Report" />

            <div className="container mx-auto px-4 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Tax Report</h1>
                    </div>
                </div>

                <div className="mb-6 grid gap-6 md:grid-cols-1 lg:grid-cols-4">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Generate Report</CardTitle>
                            <CardDescription>Select a tax year to generate your cryptocurrency tax report</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tax Year</label>
                                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button onClick={generateReport} disabled={loading} className="w-full">
                                    {loading ? 'Generating...' : 'Generate Report'}
                                </Button>

                                {taxData && (
                                    <Button onClick={exportCSV} variant="outline" className="w-full">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {taxData && (
                        <div className="lg:col-span-3">
                            <Tabs defaultValue="summary" className="space-y-6">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="summary">Summary</TabsTrigger>
                                    <TabsTrigger value="gains-losses">Gains & Losses</TabsTrigger>
                                    <TabsTrigger value="holdings">Holdings</TabsTrigger>
                                    <TabsTrigger value="optimization">Optimization</TabsTrigger>
                                </TabsList>

                                <TabsContent value="summary" className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-5 w-5 text-blue-500" />
                                                    <span className="text-sm font-medium text-muted-foreground">Net Gain/Loss</span>
                                                </div>
                                                <div
                                                    className={cn(
                                                        'text-2xl font-bold',
                                                        taxData.realized_gains_losses.summary.total_net_gain_loss >= 0
                                                            ? 'text-green-600'
                                                            : 'text-red-600',
                                                    )}
                                                >
                                                    {formatCurrency(taxData.realized_gains_losses.summary.total_net_gain_loss)}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                                    <span className="text-sm font-medium text-muted-foreground">Portfolio Value</span>
                                                </div>
                                                <div className="text-2xl font-bold">
                                                    {formatCurrency(taxData.holdings_summary.total_current_value)}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <PieChart className="h-5 w-5 text-purple-500" />
                                                    <span className="text-sm font-medium text-muted-foreground">Cost Basis</span>
                                                </div>
                                                <div className="text-2xl font-bold">{formatCurrency(taxData.holdings_summary.total_cost_basis)}</div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-5 w-5 text-orange-500" />
                                                    <span className="text-sm font-medium text-muted-foreground">Tax Year</span>
                                                </div>
                                                <div className="text-2xl font-bold">{taxData.tax_year}</div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="gains-losses" className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <TrendingUp className="h-5 w-5" />
                                                    Short-Term (≤ 1 year)
                                                </CardTitle>
                                                <CardDescription>Taxed as ordinary income</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Gains:</span>
                                                        <span className="font-medium text-green-600">
                                                            {formatCurrency(taxData.realized_gains_losses.summary.short_term_gains)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Losses:</span>
                                                        <span className="font-medium text-red-600">
                                                            -{formatCurrency(taxData.realized_gains_losses.summary.short_term_losses)}
                                                        </span>
                                                    </div>
                                                    <div className="border-t pt-3">
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">Net:</span>
                                                            <span
                                                                className={cn(
                                                                    'font-bold',
                                                                    taxData.realized_gains_losses.summary.short_term_net >= 0
                                                                        ? 'text-green-600'
                                                                        : 'text-red-600',
                                                                )}
                                                            >
                                                                {formatCurrency(taxData.realized_gains_losses.summary.short_term_net)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <TrendingDown className="h-5 w-5" />
                                                    Long-Term (&gt; 1 year)
                                                </CardTitle>
                                                <CardDescription>Preferential tax rates apply</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Gains:</span>
                                                        <span className="font-medium text-green-600">
                                                            {formatCurrency(taxData.realized_gains_losses.summary.long_term_gains)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Losses:</span>
                                                        <span className="font-medium text-red-600">
                                                            -{formatCurrency(taxData.realized_gains_losses.summary.long_term_losses)}
                                                        </span>
                                                    </div>
                                                    <div className="border-t pt-3">
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold">Net:</span>
                                                            <span
                                                                className={cn(
                                                                    'font-bold',
                                                                    taxData.realized_gains_losses.summary.long_term_net >= 0
                                                                        ? 'text-green-600'
                                                                        : 'text-red-600',
                                                                )}
                                                            >
                                                                {formatCurrency(taxData.realized_gains_losses.summary.long_term_net)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="holdings" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Current Holdings Summary</CardTitle>
                                            <CardDescription>Overview of your current cryptocurrency portfolio</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                <div className="space-y-2">
                                                    <span className="text-sm font-medium text-muted-foreground">Total Holdings</span>
                                                    <div className="text-xl font-bold">{taxData.holdings_summary.total_holdings}</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-sm font-medium text-muted-foreground">Unrealized Gain/Loss</span>
                                                    <div
                                                        className={cn(
                                                            'text-xl font-bold',
                                                            taxData.holdings_summary.unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600',
                                                        )}
                                                    >
                                                        {formatCurrency(taxData.holdings_summary.unrealized_gain_loss)}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-sm font-medium text-muted-foreground">Unrealized %</span>
                                                    <div
                                                        className={cn(
                                                            'text-xl font-bold',
                                                            taxData.holdings_summary.unrealized_percentage >= 0 ? 'text-green-600' : 'text-red-600',
                                                        )}
                                                    >
                                                        {taxData.holdings_summary.unrealized_percentage.toFixed(2)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="optimization" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5" />
                                                Tax Optimization Suggestions
                                            </CardTitle>
                                            <CardDescription>AI-powered recommendations to optimize your tax situation</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {taxData.tax_optimization.length > 0 ? (
                                                <div className="space-y-4">
                                                    {taxData.tax_optimization.map((suggestion, index) => (
                                                        <Card key={index} className="border-l-4 border-l-blue-500">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex-1">
                                                                        <div className="mb-2 flex items-center gap-2">
                                                                            <h4 className="font-semibold">{suggestion.title}</h4>
                                                                            <Badge variant={getPriorityColor(suggestion.priority)}>
                                                                                {suggestion.priority}
                                                                            </Badge>
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                                                                        {suggestion.potential_savings && (
                                                                            <div className="mt-2">
                                                                                <span className="text-sm font-medium text-green-600">
                                                                                    Potential Savings: {suggestion.potential_savings}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center">
                                                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                                    <h3 className="mb-2 text-lg font-semibold">No optimization suggestions</h3>
                                                    <p className="text-muted-foreground">
                                                        Your current tax situation looks optimized. Check back after making trades.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
