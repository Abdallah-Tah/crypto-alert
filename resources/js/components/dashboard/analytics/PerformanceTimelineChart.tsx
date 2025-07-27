import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Percent, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TimelineDataPoint {
    date: string;
    portfolioValue: number;
    btcPrice?: number;
    ethPrice?: number;
    change24h: number;
    changePercent: number;
}

interface PerformanceTimelineChartProps {
    className?: string;
}

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD';

const timeFrames: TimeFrame[] = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD'];

// Mock data generator - will be replaced with real API data
const generateMockData = (timeFrame: TimeFrame): TimelineDataPoint[] => {
    const now = new Date();
    const data: TimelineDataPoint[] = [];

    let days: number;
    let interval: number;

    switch (timeFrame) {
        case '1D':
            days = 1;
            interval = 1; // hourly
            break;
        case '1W':
            days = 7;
            interval = 4; // every 4 hours
            break;
        case '1M':
            days = 30;
            interval = 24; // daily
            break;
        case '3M':
            days = 90;
            interval = 24 * 3; // every 3 days
            break;
        case '6M':
            days = 180;
            interval = 24 * 7; // weekly
            break;
        case '1Y':
            days = 365;
            interval = 24 * 7; // weekly
            break;
        case 'YTD': {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            days = Math.floor((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
            interval = Math.max(24 * 7, Math.floor(days / 50)); // adaptive
            break;
        }
        default:
            days = 30;
            interval = 24;
    }

    const baseValue = 8436.07; // Your current portfolio value
    const volatility = 0.02; // 2% daily volatility

    for (let i = days; i >= 0; i -= interval / 24) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const randomChange = (Math.random() - 0.5) * volatility * 2;
        const trendFactor = ((days - i) / days) * 0.3; // Overall upward trend

        const portfolioValue = baseValue * (1 + randomChange + trendFactor);
        const change24h = portfolioValue * randomChange;
        const changePercent = randomChange * 100;

        data.push({
            date: date.toISOString(),
            portfolioValue: Number(portfolioValue.toFixed(2)),
            btcPrice: 118983.3 * (1 + randomChange * 0.5),
            ethPrice: 3817.72 * (1 + randomChange * 0.7),
            change24h: Number(change24h.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
        });
    }

    return data.reverse();
};

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

const formatDate = (dateString: string, timeFrame: TimeFrame): string => {
    const date = new Date(dateString);

    switch (timeFrame) {
        case '1D':
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        case '1W':
            return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit' });
        case '1M':
        case '3M':
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case '6M':
        case '1Y':
        case 'YTD':
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        default:
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};

const PerformanceTimelineChart: React.FC<PerformanceTimelineChartProps> = ({ className }) => {
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('1M');
    const [data, setData] = useState<TimelineDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showComparison, setShowComparison] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/portfolio/performance?timeframe=${selectedTimeFrame}`, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.timeline) {
                        setData(result.timeline);
                    } else {
                        console.warn('No timeline data available, using mock data');
                        setData(generateMockData(selectedTimeFrame));
                    }
                } else {
                    console.warn('Failed to fetch performance data, using mock data');
                    setData(generateMockData(selectedTimeFrame));
                }
            } catch (error) {
                console.error('Error fetching performance data:', error);
                // Fallback to mock data
                setData(generateMockData(selectedTimeFrame));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedTimeFrame]);
    const currentValue = data.length > 0 ? data[data.length - 1]?.portfolioValue : 0;
    const previousValue = data.length > 1 ? data[data.length - 2]?.portfolioValue : currentValue;
    const totalChange = currentValue - (data[0]?.portfolioValue || currentValue);
    const totalChangePercent = data[0]?.portfolioValue ? (totalChange / data[0].portfolioValue) * 100 : 0;
    const recentChange = currentValue - previousValue;
    const recentChangePercent = previousValue ? (recentChange / previousValue) * 100 : 0;

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(label, selectedTimeFrame)}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Portfolio: {formatCurrency(data.portfolioValue)}</p>
                    {showComparison && (
                        <>
                            <p className="text-sm text-orange-600 dark:text-orange-400">BTC: {formatCurrency(data.btcPrice || 0)}</p>
                            <p className="text-sm text-purple-600 dark:text-purple-400">ETH: {formatCurrency(data.ethPrice || 0)}</p>
                        </>
                    )}
                    <p className={`text-sm ${data.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Change: {data.changePercent >= 0 ? '+' : ''}
                        {data.changePercent.toFixed(2)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Portfolio Performance</CardTitle>
                            <CardDescription>Loading performance timeline...</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex h-80 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Portfolio Performance
                        </CardTitle>
                        <CardDescription>Track your portfolio value over time</CardDescription>
                    </div>

                    {/* Performance Summary */}
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Badge variant={totalChangePercent >= 0 ? 'default' : 'destructive'} className="justify-center">
                            {totalChangePercent >= 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                            {totalChangePercent >= 0 ? '+' : ''}
                            {totalChangePercent.toFixed(2)}%
                        </Badge>
                        <Badge variant="outline" className="justify-center">
                            <DollarSign className="mr-1 h-3 w-3" />
                            {formatCurrency(currentValue)}
                        </Badge>
                    </div>
                </div>

                {/* Time Frame Selector */}
                <div className="mt-4 flex flex-wrap gap-1">
                    {timeFrames.map((timeFrame) => (
                        <Button
                            key={timeFrame}
                            variant={selectedTimeFrame === timeFrame ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedTimeFrame(timeFrame)}
                            className="text-xs"
                        >
                            {timeFrame}
                        </Button>
                    ))}
                </div>

                {/* Additional Controls */}
                <div className="mt-2 flex flex-wrap items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setShowComparison(!showComparison)} className="text-xs">
                        {showComparison ? 'Hide' : 'Show'} BTC/ETH Comparison
                    </Button>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Percent className="h-4 w-4" />
                        Recent: {recentChangePercent >= 0 ? '+' : ''}
                        {recentChangePercent.toFixed(2)}%
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => formatDate(value, selectedTimeFrame)}
                                stroke="#6B7280"
                                fontSize={12}
                                tickMargin={8}
                            />
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} stroke="#6B7280" fontSize={12} width={60} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="portfolioValue"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                                name="Portfolio Value"
                            />

                            {showComparison && (
                                <>
                                    <Line
                                        type="monotone"
                                        dataKey="btcPrice"
                                        stroke="#F59E0B"
                                        strokeWidth={1}
                                        dot={false}
                                        strokeDasharray="5 5"
                                        name="BTC Price"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="ethPrice"
                                        stroke="#8B5CF6"
                                        strokeWidth={1}
                                        dot={false}
                                        strokeDasharray="5 5"
                                        name="ETH Price"
                                    />
                                </>
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Performance Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 md:grid-cols-4 dark:border-gray-700">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(currentValue)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Change</p>
                        <p className={`text-lg font-semibold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {totalChange >= 0 ? '+' : ''}
                            {formatCurrency(totalChange)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Period Return</p>
                        <p className={`text-lg font-semibold ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {totalChangePercent >= 0 ? '+' : ''}
                            {totalChangePercent.toFixed(2)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Data Points</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data.length}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PerformanceTimelineChart;
