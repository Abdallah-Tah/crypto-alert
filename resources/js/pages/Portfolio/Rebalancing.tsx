import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { AlertCircle, ArrowRightLeft, Target, TrendingUp } from 'lucide-react';

interface RebalancingProps {
    title: string;
}

export default function Rebalancing({ title }: RebalancingProps) {
    const handleRebalance = async () => {
        try {
            const response = await fetch('/portfolio/rebalance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    target_allocation: [
                        { symbol: 'BTC', percentage: 40 },
                        { symbol: 'ETH', percentage: 30 },
                        { symbol: 'SOL', percentage: 15 },
                        { symbol: 'ADA', percentage: 10 },
                        { symbol: 'DOGE', percentage: 5 },
                    ],
                    rebalance_strategy: 'threshold',
                    threshold_percentage: 5,
                }),
            });

            const data = await response.json();
            console.log('Rebalancing result:', data);
        } catch (error) {
            console.error('Error executing rebalancing:', error);
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
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                        <ArrowRightLeft className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">Portfolio Rebalancing</h1>
                                        <p className="text-gray-600 dark:text-gray-400">Maintain your target allocation across cryptocurrencies</p>
                                    </div>
                                </div>
                            </div>

                            {/* Rebalancing Status */}
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-orange-500" />
                                        Rebalancing Required
                                    </CardTitle>
                                    <CardDescription>Your portfolio has deviated 8.2% from target allocation</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span>Portfolio Deviation</span>
                                            <span className="font-medium">8.2%</span>
                                        </div>
                                        <Progress value={82} className="h-2" />
                                        <p className="text-sm text-muted-foreground">Threshold: 5% | Current: 8.2% | Action: Rebalance Recommended</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Current vs Target Allocation */}
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>Allocation Comparison</CardTitle>
                                    <CardDescription>Current portfolio allocation vs target allocation</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {[
                                            { symbol: 'BTC', current: 35, target: 40, value: '$14,000' },
                                            { symbol: 'ETH', current: 38, target: 30, value: '$15,200' },
                                            { symbol: 'SOL', current: 12, target: 15, value: '$4,800' },
                                            { symbol: 'ADA', current: 10, target: 10, value: '$4,000' },
                                            { symbol: 'DOGE', current: 5, target: 5, value: '$2,000' },
                                        ].map((asset, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{asset.symbol}</Badge>
                                                        <span className="font-medium">{asset.value}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span>Current: {asset.current}%</span>
                                                        <span>Target: {asset.target}%</span>
                                                        <Badge
                                                            variant={
                                                                Math.abs(asset.current - asset.target) > 5
                                                                    ? 'destructive'
                                                                    : Math.abs(asset.current - asset.target) > 2
                                                                      ? 'secondary'
                                                                      : 'outline'
                                                            }
                                                        >
                                                            {asset.current > asset.target ? '+' : ''}
                                                            {asset.current - asset.target}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <div className="mb-1 text-xs text-muted-foreground">Current</div>
                                                        <Progress value={asset.current} className="h-2" />
                                                    </div>
                                                    <div>
                                                        <div className="mb-1 text-xs text-muted-foreground">Target</div>
                                                        <Progress value={asset.target} className="h-2 bg-green-100" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recommended Trades */}
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>Recommended Trades</CardTitle>
                                    <CardDescription>Trades needed to achieve target allocation</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            { action: 'Buy', symbol: 'BTC', amount: '$2,000', reason: 'Increase allocation to 40%' },
                                            { action: 'Sell', symbol: 'ETH', amount: '$3,200', reason: 'Reduce allocation to 30%' },
                                            { action: 'Buy', symbol: 'SOL', amount: '$1,200', reason: 'Increase allocation to 15%' },
                                        ].map((trade, index) => (
                                            <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="flex items-center gap-4">
                                                    <Badge variant={trade.action === 'Buy' ? 'default' : 'destructive'}>{trade.action}</Badge>
                                                    <div>
                                                        <p className="font-medium">
                                                            {trade.symbol} - {trade.amount}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">{trade.reason}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cost Analysis */}
                            <Card className="mb-8">
                                <CardHeader>
                                    <CardTitle>Rebalancing Cost Analysis</CardTitle>
                                    <CardDescription>Estimated costs and tax implications</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Trading Fees</p>
                                            <p className="text-2xl font-bold">$32.40</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tax Impact</p>
                                            <p className="text-2xl font-bold text-green-600">$0</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Net Benefit</p>
                                            <p className="text-2xl font-bold text-green-600">+$247</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <Button onClick={handleRebalance} className="flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    Execute Rebalancing
                                </Button>
                                <Button variant="outline">Schedule Rebalancing</Button>
                                <Button variant="outline">Adjust Targets</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
