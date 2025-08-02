import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
    TaxOptimizationModalProps, 
    TaxOptimizationOpportunity,
    LoadingState,
    SuccessState 
} from '@/types/modals';
import { 
    Calculator, 
    TrendingDown, 
    TrendingUp, 
    Target, 
    CheckCircle, 
    AlertTriangle,
    DollarSign,
    Sparkles,
    Clock,
    Shield
} from 'lucide-react';

interface OptimizationProgress {
    [key: string]: {
        isExecuting: boolean;
        isCompleted: boolean;
        progress: number;
    };
}

export function TaxOptimizationModal({ 
    isOpen, 
    onClose, 
    data, 
    onExecuteOptimization,
    isLoading = false,
    className 
}: TaxOptimizationModalProps) {
    const [optimizationProgress, setOptimizationProgress] = React.useState<OptimizationProgress>({});
    const [successState, setSuccessState] = React.useState<SuccessState>({ isSuccess: false });
    const [expandedOpportunity, setExpandedOpportunity] = React.useState<string | null>(null);

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20';
            case 'medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20';
            case 'high': return 'text-red-600 bg-red-50 dark:bg-red-950/20';
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
        }
    };

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    const handleExecuteOptimization = async (opportunityId: string) => {
        setOptimizationProgress(prev => ({
            ...prev,
            [opportunityId]: {
                isExecuting: true,
                isCompleted: false,
                progress: 0
            }
        }));

        // Simulate progress
        const progressInterval = setInterval(() => {
            setOptimizationProgress(prev => {
                const current = prev[opportunityId]?.progress || 0;
                if (current >= 100) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return {
                    ...prev,
                    [opportunityId]: {
                        ...prev[opportunityId],
                        progress: Math.min(current + 10, 100)
                    }
                };
            });
        }, 200);

        try {
            await onExecuteOptimization(opportunityId);
            
            setOptimizationProgress(prev => ({
                ...prev,
                [opportunityId]: {
                    isExecuting: false,
                    isCompleted: true,
                    progress: 100
                }
            }));

            setSuccessState({
                isSuccess: true,
                message: 'Tax optimization executed successfully!'
            });

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessState({ isSuccess: false });
            }, 3000);

        } catch (error) {
            setOptimizationProgress(prev => ({
                ...prev,
                [opportunityId]: {
                    isExecuting: false,
                    isCompleted: false,
                    progress: 0
                }
            }));
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(
                "max-h-[95vh] w-[95vw] max-w-[95vw] overflow-y-auto sm:max-h-[90vh] sm:w-auto sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl",
                "bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95",
                "backdrop-blur-xl border border-white/20 dark:border-slate-700/50",
                "shadow-2xl shadow-black/10 dark:shadow-black/50",
                className
            )}>
                <DialogHeader className="space-y-6 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                            <Calculator className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                Tax Optimization Center
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Maximize your after-tax returns with intelligent optimization strategies
                            </p>
                        </div>
                    </div>

                    {/* Success notification */}
                    {successState.isSuccess && (
                        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                {successState.message}
                            </p>
                        </div>
                    )}

                    {/* Tax Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/30 border-red-200 dark:border-red-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-red-700 dark:text-red-300">Current Liability</p>
                                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                                            {formatCurrency(data.currentTaxLiability)}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Potential Savings</p>
                                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                            {formatCurrency(data.potentialSavings)}
                                        </p>
                                    </div>
                                    <TrendingDown className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Harvestable Loss</p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {formatCurrency(data.yearToDate.harvestable)}
                                        </p>
                                    </div>
                                    <Target className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </DialogHeader>

                <div className="space-y-6 px-1">
                    {/* Year-to-Date Summary */}
                    <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <DollarSign className="h-5 w-5 text-slate-600" />
                                Year-to-Date Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Total Gains</p>
                                    <p className="text-lg font-semibold text-green-600">
                                        {formatCurrency(data.yearToDate.gains)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Total Losses</p>
                                    <p className="text-lg font-semibold text-red-600">
                                        {formatCurrency(data.yearToDate.losses)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Net Position</p>
                                    <p className={cn(
                                        "text-lg font-semibold",
                                        data.yearToDate.gains - data.yearToDate.losses > 0 
                                            ? "text-green-600" 
                                            : "text-red-600"
                                    )}>
                                        {formatCurrency(data.yearToDate.gains - data.yearToDate.losses)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Optimization Opportunities */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <h3 className="text-lg font-semibold">Optimization Opportunities</h3>
                            <Badge variant="secondary" className="ml-auto">
                                {data.opportunities.length} Available
                            </Badge>
                        </div>

                        {data.opportunities.map((opportunity, index) => {
                            const progress = optimizationProgress[opportunity.id];
                            const isExecuting = progress?.isExecuting || false;
                            const isCompleted = progress?.isCompleted || false;
                            const progressValue = progress?.progress || 0;
                            const isExpanded = expandedOpportunity === opportunity.id;

                            return (
                                <Card key={opportunity.id} className={cn(
                                    "transition-all duration-300 hover:shadow-lg",
                                    isCompleted && "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
                                    isExecuting && "ring-2 ring-blue-500/20"
                                )}>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {/* Opportunity Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold text-lg">{opportunity.asset}</h4>
                                                        <Badge className={cn(
                                                            "text-xs font-medium",
                                                            getRiskColor(opportunity.riskLevel)
                                                        )}>
                                                            {opportunity.riskLevel} risk
                                                        </Badge>
                                                        <Badge variant="outline" className={cn(
                                                            "text-xs",
                                                            getConfidenceColor(opportunity.confidence)
                                                        )}>
                                                            {opportunity.confidence} confidence
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {opportunity.description}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setExpandedOpportunity(
                                                        isExpanded ? null : opportunity.id
                                                    )}
                                                    className="ml-4"
                                                >
                                                    {isExpanded ? 'Less' : 'More'}
                                                </Button>
                                            </div>

                                            {/* Opportunity Metrics */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                                    <p className="text-xs text-muted-foreground">Current Value</p>
                                                    <p className="font-semibold">{formatCurrency(opportunity.currentValue)}</p>
                                                </div>
                                                <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                                                    <p className="text-xs text-muted-foreground">Unrealized Loss</p>
                                                    <p className="font-semibold text-red-600">
                                                        {formatCurrency(opportunity.unrealizedLoss)}
                                                    </p>
                                                </div>
                                                <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                                                    <p className="text-xs text-muted-foreground">Tax Saving</p>
                                                    <p className="font-semibold text-emerald-600">
                                                        {formatCurrency(opportunity.potentialSaving)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {isExpanded && (
                                                <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                Recommended execution: Within 24 hours
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                Wash sale rule: {opportunity.riskLevel === 'low' ? 'Not applicable' : 'Consider timing'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                Impact on portfolio: Minimal rebalancing required
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Progress Bar */}
                                            {isExecuting && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span>Executing optimization...</span>
                                                        <span>{progressValue}%</span>
                                                    </div>
                                                    <Progress value={progressValue} className="h-2" />
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            <div className="flex justify-end">
                                                {isCompleted ? (
                                                    <Button disabled className="bg-emerald-600 text-white">
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Completed
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleExecuteOptimization(opportunity.id)}
                                                        disabled={isExecuting || isLoading}
                                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                                    >
                                                        {isExecuting ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                                                Executing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Target className="h-4 w-4 mr-2" />
                                                                Execute Optimization
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* AI Recommendations */}
                    {data.recommendations.length > 0 && (
                        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    AI Recommendations
                                </CardTitle>
                                <CardDescription>
                                    Strategic insights to maximize your tax efficiency
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.recommendations.map((recommendation, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs font-semibold text-purple-600">
                                                {index + 1}
                                            </div>
                                            <p className="text-sm leading-relaxed">{recommendation}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        Last updated: {new Date().toLocaleString()}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button 
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={isLoading}
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            Refresh Analysis
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}