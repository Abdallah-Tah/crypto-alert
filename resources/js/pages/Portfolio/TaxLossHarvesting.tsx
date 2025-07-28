import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Calculator, DollarSign, TrendingDown } from 'lucide-react';

interface TaxLossHarvestingProps {
    title: string;
}

export default function TaxLossHarvesting({ title }: TaxLossHarvestingProps) {
    const handleExecuteHarvesting = async () => {
        try {
            const response = await fetch('/portfolio/tax-loss-harvesting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    holdings: [
                        { symbol: 'DOGE', amount: 1000 },
                        { symbol: 'ADA', amount: 500 },
                    ],
                    strategy: 'moderate',
                }),
            });

            const data = await response.json();
            console.log('Tax loss harvesting result:', data);
        } catch (error) {
            console.error('Error executing tax loss harvesting:', error);
        }
    };

    return (
        <AppLayout>
            <Head title={title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/20">
                                        <Calculator className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">Tax-Loss Harvesting</h1>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Optimize your tax liability through strategic loss realization
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Overview Cards */}
                            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Potential Tax Savings</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span className="text-2xl font-bold text-green-600">$1,240</span>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">Based on current unrealized losses</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Harvestable Losses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="h-4 w-4 text-red-600" />
                                            <span className="text-2xl font-bold">$5,640</span>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">Across 3 positions</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Wash Sale Risk</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                            <span className="text-2xl font-bold">Low</span>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">No recent sales detected</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Opportunities Table */}
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>Tax-Loss Harvesting Opportunities</CardTitle>
                                    <CardDescription>Positions with significant unrealized losses that could provide tax benefits</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            { symbol: 'DOGE', loss: -2340, savings: 515, priority: 'high' },
                                            { symbol: 'ADA', loss: -1890, savings: 416, priority: 'medium' },
                                            { symbol: 'MATIC', loss: -1410, savings: 310, priority: 'medium' },
                                        ].map((opportunity, index) => (
                                            <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="outline">{opportunity.symbol}</Badge>
                                                    <div>
                                                        <p className="font-medium">Unrealized Loss: ${opportunity.loss.toLocaleString()}</p>
                                                        <p className="text-sm text-muted-foreground">Potential Tax Savings: ${opportunity.savings}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={opportunity.priority === 'high' ? 'destructive' : 'secondary'}>
                                                        {opportunity.priority}
                                                    </Badge>
                                                    <Button size="sm" variant="outline">
                                                        Analyze
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <Button onClick={handleExecuteHarvesting} className="flex items-center gap-2">
                                    <Calculator className="h-4 w-4" />
                                    Execute Tax-Loss Harvesting
                                </Button>
                                <Button variant="outline">View Tax Report</Button>
                                <Button variant="outline">Schedule Review</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
