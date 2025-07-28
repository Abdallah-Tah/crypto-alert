import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Calculator, Calendar, DollarSign, FileText, Target, TrendingDown, TrendingUp } from 'lucide-react';
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

interface Props {
    taxData?: TaxOptimizationData;
}

export default function TaxOptimization({ taxData }: Props) {
    const [isOptimizing, setIsOptimizing] = useState(false);

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
            router.post(
                '/portfolio/optimize-tax',
                {},
                {
                    onSuccess: () => {
                        // Handle success
                    },
                    onError: () => {
                        // Handle error
                    },
                    onFinish: () => {
                        setIsOptimizing(false);
                    },
                },
            );
        } catch {
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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tax Optimization</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Minimize your tax liability with strategic portfolio management</p>
                    </div>
                    <Button onClick={handleOptimizeNow} disabled={isOptimizing} className="bg-green-600 hover:bg-green-700">
                        {isOptimizing ? 'Optimizing...' : 'Optimize Now'}
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
                            <Button variant="outline" className="h-auto justify-start p-4" onClick={() => router.visit('/tax-reports')}>
                                <FileText className="mr-3 h-4 w-4" />
                                <div className="text-left">
                                    <div className="font-medium">Generate Tax Report</div>
                                    <div className="text-xs text-gray-500">Get detailed tax analysis</div>
                                </div>
                            </Button>

                            <Button variant="outline" className="h-auto justify-start p-4" onClick={() => router.visit('/portfolio/rebalance')}>
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
