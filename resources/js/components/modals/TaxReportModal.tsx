import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { TaxReportModalProps } from '@/types/modals';
import { 
    FileText, 
    Download, 
    Calendar, 
    TrendingUp, 
    TrendingDown,
    BarChart3,
    PieChart,
    CheckCircle,
    Clock,
    AlertCircle,
    FileSpreadsheet,
    FileImage,
    Sparkles
} from 'lucide-react';

interface ReportGeneration {
    isGenerating: boolean;
    progress: number;
    stage: string;
    generatedAt?: Date;
}

export function TaxReportModal({
    isOpen,
    onClose,
    data,
    onGenerateReport,
    onExportReport,
    isGenerating = false,
    className
}: TaxReportModalProps) {
    const [selectedYear, setSelectedYear] = React.useState<string>(data.selectedYear?.toString() || data.availableYears[0]?.toString() || '2024');
    const [reportGeneration, setReportGeneration] = React.useState<ReportGeneration>({
        isGenerating: false,
        progress: 0,
        stage: 'Initializing...'
    });
    const [activeTab, setActiveTab] = React.useState<string>('overview');

    const handleGenerateReport = async () => {
        const year = parseInt(selectedYear);
        
        setReportGeneration({
            isGenerating: true,
            progress: 0,
            stage: 'Collecting transaction data...'
        });

        // Simulate report generation progress
        const stages = [
            'Collecting transaction data...',
            'Calculating gains and losses...',
            'Processing tax events...',
            'Generating visualizations...',
            'Finalizing report...'
        ];

        for (let i = 0; i < stages.length; i++) {
            setTimeout(() => {
                setReportGeneration(prev => ({
                    ...prev,
                    progress: ((i + 1) / stages.length) * 100,
                    stage: stages[i]
                }));
            }, i * 800);
        }

        try {
            await onGenerateReport(year, 'comprehensive');
            
            setTimeout(() => {
                setReportGeneration({
                    isGenerating: false,
                    progress: 100,
                    stage: 'Complete',
                    generatedAt: new Date()
                });
            }, stages.length * 800);
        } catch (error) {
            setReportGeneration({
                isGenerating: false,
                progress: 0,
                stage: 'Error occurred'
            });
        }
    };

    const handleExport = async (format: string) => {
        await onExportReport(format);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getFormatIcon = (format: string) => {
        switch (format) {
            case 'csv': return FileSpreadsheet;
            case 'xlsx': return FileSpreadsheet;
            case 'pdf': return FileImage;
            default: return FileText;
        }
    };

    const getNetPositionColor = (amount: number) => {
        if (amount > 0) return 'text-emerald-600';
        if (amount < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(
                "max-h-[95vh] w-[95vw] max-w-[95vw] overflow-y-auto sm:max-h-[90vh] sm:w-auto sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl",
                "bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95",
                "backdrop-blur-xl border border-white/20 dark:border-slate-700/50",
                "shadow-2xl shadow-black/10 dark:shadow-black/50",
                className
            )}>
                <DialogHeader className="space-y-6 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                Tax Report Generator
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Generate comprehensive tax reports for cryptocurrency transactions
                            </p>
                        </div>
                    </div>

                    {/* Year Selection and Generation Controls */}
                    <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-sm font-medium mb-2 block">Tax Year</label>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="w-full sm:w-48">
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {data.availableYears.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {year}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    onClick={handleGenerateReport}
                                    disabled={reportGeneration.isGenerating || isGenerating}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    {reportGeneration.isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Generate Report
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Generation Progress */}
                            {reportGeneration.isGenerating && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {reportGeneration.stage}
                                        </span>
                                        <span>{Math.round(reportGeneration.progress)}%</span>
                                    </div>
                                    <Progress value={reportGeneration.progress} className="h-2" />
                                </div>
                            )}

                            {/* Generation Complete */}
                            {reportGeneration.generatedAt && !reportGeneration.isGenerating && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                                    <CheckCircle className="h-4 w-4" />
                                    Report generated successfully at {reportGeneration.generatedAt.toLocaleTimeString()}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </DialogHeader>

                <div className="px-1">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="export">Export</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Key Metrics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Gains</p>
                                                <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                                                    {formatCurrency(data.reportMetrics.totalGains)}
                                                </p>
                                            </div>
                                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/30 border-red-200 dark:border-red-800">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Losses</p>
                                                <p className="text-xl font-bold text-red-900 dark:text-red-100">
                                                    {formatCurrency(Math.abs(data.reportMetrics.totalLosses))}
                                                </p>
                                            </div>
                                            <TrendingDown className="h-6 w-6 text-red-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Net Position</p>
                                                <p className={cn(
                                                    "text-xl font-bold",
                                                    getNetPositionColor(data.reportMetrics.netPosition)
                                                )}>
                                                    {formatCurrency(data.reportMetrics.netPosition)}
                                                </p>
                                            </div>
                                            <BarChart3 className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Tax Events</p>
                                                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                                                    {data.reportMetrics.taxableEvents.toLocaleString()}
                                                </p>
                                            </div>
                                            <PieChart className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Additional Metrics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Portfolio Analytics</CardTitle>
                                    <CardDescription>Additional insights for tax year {selectedYear}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                                <span className="text-sm font-medium">Average Hold Period</span>
                                                <span className="text-sm font-semibold">
                                                    {data.reportMetrics.avgHoldPeriod} days
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                                <span className="text-sm font-medium">Long-term vs Short-term</span>
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary">65% Long</Badge>
                                                    <Badge variant="outline">35% Short</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                                <span className="text-sm font-medium">Tax Efficiency Score</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="w-3/4 h-full bg-emerald-500 rounded-full"></div>
                                                    </div>
                                                    <span className="text-sm font-semibold">75%</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                                <span className="text-sm font-medium">Wash Sale Violations</span>
                                                <Badge variant="destructive">2 Flagged</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Historical Comparison */}
                            {data.historicalComparison && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Historical Comparison</CardTitle>
                                        <CardDescription>Year-over-year tax performance</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {data.historicalComparison.map((yearData, index) => (
                                                <div key={yearData.year} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-lg font-semibold w-16">{yearData.year}</div>
                                                        <div className="grid grid-cols-3 gap-8 text-sm">
                                                            <div>
                                                                <p className="text-muted-foreground">Gains</p>
                                                                <p className="font-semibold text-emerald-600">
                                                                    {formatCurrency(yearData.gains)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Losses</p>
                                                                <p className="font-semibold text-red-600">
                                                                    {formatCurrency(Math.abs(yearData.losses))}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Net</p>
                                                                <p className={cn(
                                                                    "font-semibold",
                                                                    getNetPositionColor(yearData.netPosition)
                                                                )}>
                                                                    {formatCurrency(yearData.netPosition)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {yearData.year === parseInt(selectedYear) && (
                                                        <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Details Tab */}
                        <TabsContent value="details" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Report Contents</CardTitle>
                                    <CardDescription>
                                        Detailed breakdown of what will be included in your {selectedYear} tax report
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                                Transaction Data
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                    All buy/sell transactions
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                    DeFi interactions & swaps
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                    Staking rewards & airdrops
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                    Mining income
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                                Tax Calculations
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                    Capital gains/losses (FIFO)
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                    Short vs long-term classification
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                                    Wash sale rule compliance
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                    Cost basis tracking
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Report Features</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                            <BarChart3 className="h-6 w-6 text-blue-600 mb-2" />
                                            <h4 className="font-semibold mb-1">Visual Charts</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Interactive charts and graphs for better understanding
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                                            <FileText className="h-6 w-6 text-emerald-600 mb-2" />
                                            <h4 className="font-semibold mb-1">Detailed Summaries</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Transaction-level details with audit trail
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                                            <Sparkles className="h-6 w-6 text-purple-600 mb-2" />
                                            <h4 className="font-semibold mb-1">AI Insights</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Smart recommendations for tax optimization
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Export Tab */}
                        <TabsContent value="export" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Export Options</CardTitle>
                                    <CardDescription>
                                        Choose your preferred format for the {selectedYear} tax report
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.exportFormats.map((format, index) => {
                                            const IconComponent = getFormatIcon(format.format);
                                            return (
                                                <div 
                                                    key={format.format}
                                                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                                            <IconComponent className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">{format.label}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {format.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleExport(format.format)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950/20"
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Export
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                                Important Notice
                                            </h4>
                                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                                These reports are for informational purposes only. Please consult with a tax professional 
                                                for official tax preparation and filing. Always verify calculations independently.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        Report data as of: {new Date().toLocaleDateString()}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button 
                            onClick={handleGenerateReport}
                            disabled={reportGeneration.isGenerating}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {reportGeneration.isGenerating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate New Report
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}