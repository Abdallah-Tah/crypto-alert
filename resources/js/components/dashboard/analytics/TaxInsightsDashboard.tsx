import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Calculator, FileText, TrendingDown, TrendingUp } from 'lucide-react';

interface TaxInsight {
    type: 'gain' | 'loss' | 'opportunity';
    title: string;
    description: string;
    amount: number;
    symbol?: string;
    action?: string;
}

interface TaxInsightsDashboardProps {
    className?: string;
}

export function TaxInsightsDashboard({ className = '' }: TaxInsightsDashboardProps) {
    // Mock data - in real implementation, this would come from your tax service
    const taxInsights: TaxInsight[] = [
        {
            type: 'opportunity',
            title: 'Tax-Loss Harvesting',
            description: 'DOGE shows unrealized losses that could offset gains',
            amount: -485.23,
            symbol: 'DOGE',
            action: 'Consider selling',
        },
        {
            type: 'gain',
            title: 'Long-Term Capital Gains',
            description: 'ETH holding qualifies for reduced tax rate',
            amount: 2156.78,
            symbol: 'ETH',
            action: 'Hold 2 more days',
        },
        {
            type: 'loss',
            title: 'Short-Term Losses',
            description: 'BTC recent trades resulted in deductible losses',
            amount: -320.45,
            symbol: 'BTC',
            action: 'Documented',
        },
    ];

    const totalTaxSavings = taxInsights
        .filter((insight) => insight.type === 'opportunity')
        .reduce((sum, insight) => sum + Math.abs(insight.amount), 0);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <Card className={cn('', className)}>
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/20">
                            <Calculator className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-foreground">Tax Insights</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Smart tax optimization opportunities</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="rounded-md bg-green-50 px-3 py-1.5 dark:bg-green-950/20">
                            <span className="text-xs font-medium tracking-wide text-green-700 uppercase dark:text-green-300">Potential Savings</span>
                            <p className="text-sm font-bold text-green-600">{formatCurrency(totalTaxSavings)}</p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
                <div className="space-y-3">
                    {taxInsights.map((insight, index) => (
                        <div
                            key={`${insight.symbol || 'tax'}-${insight.type}-${index}`}
                            className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {insight.type === 'gain' && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/20">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                        </div>
                                    )}
                                    {insight.type === 'loss' && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20">
                                            <TrendingDown className="h-4 w-4 text-red-600" />
                                        </div>
                                    )}
                                    {insight.type === 'opportunity' && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/20">
                                            <Calculator className="h-4 w-4 text-blue-600" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {insight.symbol && (
                                                <Badge variant="outline" className="text-xs">
                                                    {insight.symbol}
                                                </Badge>
                                            )}
                                            <p className="text-sm font-medium">{insight.title}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-semibold ${insight.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(insight.amount)}
                                    </span>
                                </div>
                                {insight.action && (
                                    <Badge variant={insight.type === 'opportunity' ? 'default' : 'secondary'} className="mt-1 text-xs">
                                        {insight.action}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3 text-center dark:from-blue-950/20 dark:to-blue-900/20">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">This Year</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">$1,2K</p>
                        <p className="text-xs text-blue-600">Tax Paid</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-3 text-center dark:from-green-950/20 dark:to-green-900/20">
                        <p className="text-xs font-medium text-green-700 dark:text-green-300">Optimized</p>
                        <p className="text-lg font-bold text-green-600">${totalTaxSavings.toFixed(0)}</p>
                        <p className="text-xs text-green-600">Savings</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-3 text-center dark:from-purple-950/20 dark:to-purple-900/20">
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Long-term</p>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">3</p>
                        <p className="text-xs text-purple-600">Holdings</p>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <Link href="/tax-report" className="flex-1">
                        <Button variant="outline" size="sm" className="flex w-full items-center justify-center gap-2">
                            <FileText className="h-3 w-3" />
                            <span className="text-xs">Full Tax Report</span>
                        </Button>
                    </Link>
                    <Link href="/portfolio/optimize-tax" className="flex-1">
                        <Button size="sm" className="flex w-full items-center justify-center gap-2">
                            <Calculator className="h-3 w-3" />
                            <span className="text-xs">Optimize Taxes</span>
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
