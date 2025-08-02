import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TaxOptimizationModal, TaxReportModal } from '@/components/modals';
import { Calculator, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

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
    const [isTaxOptimizationOpen, setIsTaxOptimizationOpen] = useState(false);
    const [isTaxReportOpen, setIsTaxReportOpen] = useState(false);
    const [realPortfolioData, setRealPortfolioData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Fetch real tax optimization suggestions
    const fetchTaxOptimizationData = async () => {
        setIsLoadingData(true);
        try {
            const response = await fetch('/tax-report/optimization-suggestions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setRealPortfolioData(data);
            }
        } catch (error) {
            console.error('Error fetching tax optimization data:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    // Fetch data when component mounts
    useEffect(() => {
        fetchTaxOptimizationData();
    }, []);

    // Use real data if available, otherwise fall back to mock data
    const taxInsights: TaxInsight[] = realPortfolioData?.suggestions?.map((suggestion, index) => ({
        type: suggestion.type === 'tax_loss_harvesting' ? 'opportunity' : 
              suggestion.type === 'long_term_holding' ? 'gain' : 'loss',
        title: suggestion.title,
        description: suggestion.description,
        amount: suggestion.potential_savings || suggestion.amount || 0,
        symbol: suggestion.asset || suggestion.symbol,
        action: suggestion.priority === 'high' ? 'Act now' : 
                suggestion.priority === 'medium' ? 'Consider' : 'Monitor'
    })) || [
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

    // Show loading state
    if (isLoadingData) {
        return (
            <Card className={cn('', className)}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-foreground">Tax Insights</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Loading tax optimization data...</CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

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
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex flex-1 items-center justify-center gap-2"
                        onClick={() => setIsTaxReportOpen(true)}
                    >
                        <FileText className="h-3 w-3" />
                        <span className="text-xs">Full Tax Report</span>
                    </Button>
                    <Button 
                        size="sm" 
                        className="flex flex-1 items-center justify-center gap-2"
                        onClick={() => setIsTaxOptimizationOpen(true)}
                    >
                        <Calculator className="h-3 w-3" />
                        <span className="text-xs">Optimize Taxes</span>
                    </Button>
                </div>

                {/* Tax Optimization Modal */}
                <TaxOptimizationModal
                    isOpen={isTaxOptimizationOpen}
                    onClose={() => setIsTaxOptimizationOpen(false)}
                    data={{
                        currentTaxLiability: 12500,
                        potentialSavings: totalTaxSavings,
                        opportunities: [
                            {
                                id: '1',
                                type: 'harvest',
                                asset: 'DOGE',
                                currentValue: 850,
                                unrealizedLoss: -485,
                                potentialSaving: totalTaxSavings * 0.6,
                                confidence: 'high',
                                description: 'Harvest losses from DOGE position to offset gains',
                                riskLevel: 'low'
                            }
                        ],
                        recommendations: [
                            'Consider harvesting losses before year-end',
                            'Hold profitable positions for long-term rates',
                            'Review portfolio allocation for tax efficiency'
                        ],
                        yearToDate: {
                            gains: 15600,
                            losses: -3200,
                            harvestable: -485
                        }
                    }}
                    onExecuteOptimization={async (opportunityId) => {
                        try {
                            const response = await fetch('/portfolio/optimize-tax', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                                },
                                body: JSON.stringify({ opportunity_id: opportunityId })
                            });
                            
                            if (!response.ok) {
                                throw new Error('Failed to execute tax optimization');
                            }
                            
                            const data = await response.json();
                            console.log('Tax optimization executed successfully:', data);
                            alert('Tax optimization executed successfully!');
                        } catch (error) {
                            console.error('Error executing tax optimization:', error);
                            alert('Failed to execute tax optimization. Please try again.');
                        }
                    }}
                />

                {/* Tax Report Modal */}
                <TaxReportModal
                    isOpen={isTaxReportOpen}
                    onClose={() => setIsTaxReportOpen(false)}
                    data={{
                        availableYears: [2024, 2023, 2022, 2021],
                        selectedYear: 2024,
                        reportMetrics: {
                            totalGains: 15600,
                            totalLosses: -3200,
                            netPosition: 12400,
                            taxableEvents: 45,
                            avgHoldPeriod: 180
                        },
                        exportFormats: [
                            { format: 'csv', label: 'CSV Export', description: 'Download as CSV file' },
                            { format: 'pdf', label: 'PDF Report', description: 'Download as PDF report' },
                            { format: 'xlsx', label: 'Excel Export', description: 'Download as Excel file' }
                        ]
                    }}
                    onGenerateReport={async (year, format) => {
                        try {
                            const response = await fetch('/tax-report/generate', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                                },
                                body: JSON.stringify({ tax_year: year })
                            });
                            
                            if (!response.ok) {
                                throw new Error('Failed to generate tax report');
                            }
                            
                            const data = await response.json();
                            console.log('Tax report generated successfully:', data);
                        } catch (error) {
                            console.error('Error generating tax report:', error);
                            alert('Failed to generate tax report. Please try again.');
                        }
                    }}
                    onExportReport={async (format) => {
                        try {
                            const response = await fetch('/tax-report/export-csv', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                                },
                                body: JSON.stringify({ tax_year: 2024 })
                            });
                            
                            if (!response.ok) {
                                throw new Error('Failed to export tax report');
                            }
                            
                            // Handle file download
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.style.display = 'none';
                            a.href = url;
                            a.download = `tax_report_2024.${format}`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            console.log(`Tax report exported as ${format}`);
                        } catch (error) {
                            console.error('Error exporting tax report:', error);
                            alert('Failed to export tax report. Please try again.');
                        }
                    }}
                />
            </CardContent>
        </Card>
    );
}
