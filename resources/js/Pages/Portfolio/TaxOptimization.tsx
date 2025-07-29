import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Calculator, Calendar, CheckCircle, DollarSign, FileText, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface TaxOptimizationData {
    currentTaxLiability: number;
    potentialSavings: number;
    optimizationOpportunities: Array<{
        type: string;
        description: string;
        savings: number;
        risk: 'low' | 'medium' | 'high';
        timeframe: string;
    }>;
    taxLossHarvestingOpportunities: Array<{
        asset: string;
        unrealizedLoss: number;
        recommendation: string;
    }>;
}

interface OptimizationResult {
    tax_optimization?: any;
    tax_loss_harvesting?: any;
    year_end_strategies?: any;
    compliance_notes?: any;
    estimated_savings?: number;
    recommendations?: {
        immediate_actions?: any[];
        year_end_deadline?: string;
    };
}

interface Props {
    taxData?: TaxOptimizationData;
    optimizationData?: OptimizationResult;
    message?: string;
}

export default function TaxOptimization({ taxData, optimizationData, message }: Props) {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(optimizationData || null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(!!message);

    const defaultData: TaxOptimizationData = {
        currentTaxLiability: 12500,
        potentialSavings: 3200,
        optimizationOpportunities: [
            {
                type: 'Tax-Loss Harvesting',
                description: 'Harvest losses from DOGE and ADA positions',
                savings: 1800,
                risk: 'low',
                timeframe: 'Immediate',
            },
            {
                type: 'Long-term Capital Gains',
                description: 'Hold BTC position for 2 more months for long-term rates',
                savings: 950,
                risk: 'medium',
                timeframe: '2 months',
            },
            {
                type: 'Year-end Rebalancing',
                description: 'Strategic rebalancing to optimize tax efficiency',
                savings: 450,
                risk: 'low',
                timeframe: 'Q4 2024',
            },
        ],
        taxLossHarvestingOpportunities: [
            { asset: 'DOGE', unrealizedLoss: -2100, recommendation: 'Harvest immediately' },
            { asset: 'ADA', unrealizedLoss: -850, recommendation: 'Consider harvesting' },
            { asset: 'MATIC', unrealizedLoss: -420, recommendation: 'Monitor for better opportunity' },
        ],
    };

    const data = taxData || defaultData;
    const savingsPercentage = (data.potentialSavings / data.currentTaxLiability) * 100;

    const handleOptimizeNow = async () => {
        setIsOptimizing(true);
        try {
            // Use Inertia router for proper authentication and CSRF handling
            router.post(
                '/portfolio/optimize-tax',
                {},
                {
                    onSuccess: (page) => {
                        // Handle success - Inertia returns page data
                        console.log('Tax optimization completed:', page);

                        // Check for direct props or flash message data
                        const flashMessage = page.props?.flash?.message || page.props?.message;
                        const responseData = page.props?.optimizationData || page.props?.flash?.optimizationData;

                        if (responseData) {
                            setOptimizationResult(responseData);
                            setShowSuccessMessage(true);

                            // Show success notification
                            alert('✅ ' + (flashMessage || 'Tax optimization completed successfully! Check the results below.'));

                            // Auto-hide success message after 10 seconds
                            setTimeout(() => {
                                setShowSuccessMessage(false);
                            }, 10000);
                        } else if (flashMessage) {
                            // Show message even without detailed data
                            alert('✅ ' + flashMessage);
                            setShowSuccessMessage(true);
                            setTimeout(() => {
                                setShowSuccessMessage(false);
                            }, 5000);
                        } else {
                            // Fallback for when no data is returned but operation was successful
                            alert('✅ Tax optimization analysis completed successfully!');
                        }
                    },
                    onError: (errors) => {
                        // Handle error - show error message
                        console.error('Tax optimization failed:', errors);
                        alert('❌ Tax optimization failed. Please try again or contact support.');
                    },
                    onFinish: () => {
                        setIsOptimizing(false);
                    },
                    preserveScroll: true,
                    preserveState: true,
                },
            );
        } catch (error) {
            console.error('Tax optimization error:', error);
            alert('❌ An unexpected error occurred during tax optimization.');
            setIsOptimizing(false);
        }
    };
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <>
            <Head title="Tax Optimization" />

            <div className="space-y-6">
                {/* Success Message */}
                {showSuccessMessage && (
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
                                <CheckCircle className="h-5 w-5" />
                                Tax Optimization Complete!
                            </CardTitle>
                            <CardDescription className="text-green-700 dark:text-green-300">
                                Your portfolio has been analyzed and optimization recommendations are ready.
                            </CardDescription>
                        </CardHeader>
                        {optimizationResult && (
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            ${optimizationResult.estimated_savings?.toLocaleString() || '0'}
                                        </div>
                                        <div className="text-sm text-green-600">Potential Savings</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {optimizationResult.recommendations?.immediate_actions?.length || 0}
                                        </div>
                                        <div className="text-sm text-blue-600">Immediate Actions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {optimizationResult.year_end_strategies ? Object.keys(optimizationResult.year_end_strategies).length : 0}
                                        </div>
                                        <div className="text-sm text-purple-600">Year-End Strategies</div>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tax Optimization</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Minimize your tax liability with strategic portfolio management</p>
                    </div>
                    <Button onClick={handleOptimizeNow} disabled={isOptimizing} className="min-w-[140px] bg-green-600 hover:bg-green-700">
                        {isOptimizing ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Analyzing...
                            </div>
                        ) : (
                            'Optimize Now'
                        )}
                    </Button>
                </div>

                {/* Tax Overview Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <DollarSign className="h-4 w-4 text-red-500" />
                                Current Tax Liability
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">${data.currentTaxLiability.toLocaleString()}</div>
                            <p className="mt-1 text-xs text-gray-500">Based on current positions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <TrendingDown className="h-4 w-4 text-green-500" />
                                Potential Savings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">${data.potentialSavings.toLocaleString()}</div>
                            <p className="mt-1 text-xs text-gray-500">{savingsPercentage.toFixed(1)}% reduction possible</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <Target className="h-4 w-4 text-blue-500" />
                                Optimization Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{(100 - savingsPercentage).toFixed(0)}/100</div>
                            <Progress value={100 - savingsPercentage} className="mt-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Optimization Opportunities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            Optimization Opportunities
                        </CardTitle>
                        <CardDescription>Strategic actions to reduce your tax liability</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.optimizationOpportunities.map((opportunity, index) => (
                                <div key={index} className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-700">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-3">
                                            <h3 className="font-medium">{opportunity.type}</h3>
                                            <Badge className={getRiskColor(opportunity.risk)}>{opportunity.risk} risk</Badge>
                                        </div>
                                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{opportunity.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {opportunity.timeframe}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">${opportunity.savings.toLocaleString()}</div>
                                        <p className="text-xs text-gray-500">potential savings</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Tax-Loss Harvesting Opportunities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" />
                            Tax-Loss Harvesting Opportunities
                        </CardTitle>
                        <CardDescription>Positions with unrealized losses that can offset gains</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.taxLossHarvestingOpportunities.map((opportunity, index) => (
                                <div key={index} className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="font-medium">{opportunity.asset}</div>
                                        <div className="font-medium text-red-600">${opportunity.unrealizedLoss.toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{opportunity.recommendation}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 border-t pt-4 dark:border-gray-700">
                            <Button onClick={() => router.visit('/portfolio/tax-loss-harvesting')} variant="outline" className="w-full">
                                <Calculator className="mr-2 h-4 w-4" />
                                Start Tax-Loss Harvesting
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>Immediate steps you can take to optimize your taxes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Button variant="outline" className="h-auto justify-start p-4" onClick={() => router.visit('/tax-report')}>
                                <FileText className="mr-3 h-4 w-4" />
                                <div className="text-left">
                                    <div className="font-medium">Generate Tax Report</div>
                                    <div className="text-xs text-gray-500">Get detailed tax analysis</div>
                                </div>
                            </Button>

                            <Button variant="outline" className="h-auto justify-start p-4" onClick={() => router.visit('/portfolio/rebalancing')}>
                                <TrendingUp className="mr-3 h-4 w-4" />
                                <div className="text-left">
                                    <div className="font-medium">Rebalance Portfolio</div>
                                    <div className="text-xs text-gray-500">Optimize allocations</div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
