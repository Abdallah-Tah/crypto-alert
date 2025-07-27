import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
// Register all necessary Chart.js components
import 'chart.js/auto';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

export function PerformanceChart({ availableSymbols }) {
    const [symbol, setSymbol] = useState(availableSymbols[0] || '');
    const [range, setRange] = useState('1D');
    const [dataPoints, setDataPoints] = useState([]);
    const ranges = ['1D', '1W', '1M', '3M', '1Y'];

    useEffect(() => {
        if (!symbol) return;
        axios
            .get('/dashboard/chart-data', { params: { symbol, range } })
            .then((resp) => {
                setDataPoints(resp.data);
            })
            .catch((err) => console.error(err));
    }, [symbol, range]);

    const chartData = {
        labels: dataPoints.map((pt) => new Date(pt.time).toLocaleString()),
        datasets: [
            {
                label: `${symbol} Price`,
                data: dataPoints.map((pt) => pt.price),
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
            },
        ],
    };

    return (
        <Card className="mt-6">
            <CardHeader className="flex items-center justify-between">
                <CardTitle>Performance Chart</CardTitle>
                <div className="flex gap-2">
                    <Select value={symbol} onValueChange={(val) => setSymbol(val)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availableSymbols.map((sym) => (
                                <SelectItem key={sym} value={sym}>
                                    {sym}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={range} onValueChange={(val) => setRange(val)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ranges.map((r) => (
                                <SelectItem key={r} value={r}>
                                    {r}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Line data={chartData} />
            </CardContent>
        </Card>
    );
}
