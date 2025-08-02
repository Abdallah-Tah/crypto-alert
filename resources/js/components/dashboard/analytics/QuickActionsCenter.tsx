import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRightLeft, Calculator, FileText, Target, TrendingUp, Zap } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import * as React from 'react';
import { 
    TaxOptimizationModal, 
    TaxReportModal, 
    MarketAnalysisModal, 
    SmartAlertsModal 
} from '@/components/modals';
import type {
    TaxOptimizationData,
    TaxReportData,
    MarketAnalysisData,
    ActiveAlert,
    SmartAlertConfig
} from '@/types/modals';

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    href?: string;
    action?: 'modal' | 'link';
    modalType?: 'taxOptimization' | 'taxReport' | 'marketAnalysis' | 'smartAlerts';
    priority: 'high' | 'medium' | 'low';
    category: 'tax' | 'portfolio' | 'alert' | 'analysis';
    urgent?: boolean;
}

interface QuickActionsCenterProps {
    className?: string;
}

type ModalState = {
    taxOptimization: boolean;
    taxReport: boolean;
    marketAnalysis: boolean;
    smartAlerts: boolean;
};

export function QuickActionsCenter({ className = '' }: QuickActionsCenterProps) {
    // Modal state management
    const [modals, setModals] = React.useState<ModalState>({
        taxOptimization: false,
        taxReport: false,
        marketAnalysis: false,
        smartAlerts: false,
    });

    const openModal = (modalType: keyof ModalState) => {
        setModals(prev => ({ ...prev, [modalType]: true }));
    };

    const closeModal = (modalType: keyof ModalState) => {
        setModals(prev => ({ ...prev, [modalType]: false }));
    };

    const actions: QuickAction[] = [
        {
            id: 'tax-loss-harvest',
            title: 'Optimize Taxes',
            description: 'Harvest losses and optimize tax efficiency',
            icon: Calculator,
            action: 'modal',
            modalType: 'taxOptimization',
            priority: 'high',
            category: 'tax',
            urgent: true,
        },
        {
            id: 'rebalance-portfolio',
            title: 'Rebalance Portfolio',
            description: 'ETH allocation is 8% above target',
            icon: ArrowRightLeft,
            href: '/portfolio/rebalancing',
            action: 'link',
            priority: 'medium',
            category: 'portfolio',
        },
        {
            id: 'set-alerts',
            title: 'Set Smart Alerts',
            description: 'Configure intelligent portfolio alerts',
            icon: Target,
            action: 'modal',
            modalType: 'smartAlerts',
            priority: 'high',
            category: 'alert',
            urgent: true,
        },
        {
            id: 'generate-tax-report',
            title: 'Full Tax Report',
            description: 'Generate comprehensive tax report',
            icon: FileText,
            action: 'modal',
            modalType: 'taxReport',
            priority: 'medium',
            category: 'tax',
        },
        {
            id: 'analyze-performance',
            title: 'Detailed Analysis',
            description: 'Advanced market sentiment & analysis',
            icon: TrendingUp,
            action: 'modal',
            modalType: 'marketAnalysis',
            priority: 'low',
            category: 'analysis',
        },
        {
            id: 'market-alert',
            title: 'Market Alert Setup',
            description: 'Fear & Greed Index threshold',
            icon: AlertTriangle,
            href: '/notifications',
            action: 'link',
            priority: 'medium',
            category: 'alert',
        },
    ];

    const priorityActions = actions.filter((action) => action.priority === 'high');
    const urgentActions = actions.filter((action) => action.urgent);

    const getPriorityColor = (priority: string, urgent?: boolean) => {
        if (urgent) return 'text-red-600';
        switch (priority) {
            case 'high':
                return 'text-orange-600';
            case 'medium':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    const getPriorityBg = (priority: string, urgent?: boolean) => {
        if (urgent) return 'bg-red-50 dark:bg-red-950/20';
        switch (priority) {
            case 'high':
                return 'bg-orange-50 dark:bg-orange-950/20';
            case 'medium':
                return 'bg-blue-50 dark:bg-blue-950/20';
            default:
                return 'bg-gray-50 dark:bg-gray-950/20';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'tax':
                return '💰';
            case 'portfolio':
                return '📊';
            case 'alert':
                return '🔔';
            case 'analysis':
                return '📈';
            default:
                return '⚡';
        }
    };

    const handleActionClick = (action: QuickAction) => {
        if (action.action === 'modal' && action.modalType) {
            openModal(action.modalType);
        }
        // For links, the Link component will handle navigation
    };

    // Mock data for modals - in a real app, this would come from props or API
    const mockTaxOptimizationData: TaxOptimizationData = {
        currentTaxLiability: 15750,
        potentialSavings: 4200,
        yearToDate: {
            gains: 28500,
            losses: -12750,
            harvestable: 8300
        },
        opportunities: [
            {
                id: '1',
                type: 'harvest',
                asset: 'DOGE',
                currentValue: 2500,
                unrealizedLoss: -750,
                potentialSaving: 180,
                confidence: 'high',
                description: 'Harvest DOGE losses to offset ETH gains',
                riskLevel: 'low'
            },
            {
                id: '2',
                type: 'defer',
                asset: 'BTC',
                currentValue: 15000,
                unrealizedLoss: -2200,
                potentialSaving: 660,
                confidence: 'medium',
                description: 'Consider deferring BTC sale to next tax year',
                riskLevel: 'medium'
            }
        ],
        recommendations: [
            'Consider harvesting DOGE losses before year-end to offset current gains',
            'Your ETH position has significant unrealized gains - consider partial profit taking',
            'DCA strategy for BTC could help with tax efficiency in volatile markets'
        ]
    };

    const mockTaxReportData: TaxReportData = {
        availableYears: [2024, 2023, 2022, 2021],
        selectedYear: 2024,
        reportMetrics: {
            totalGains: 28500,
            totalLosses: -12750,
            netPosition: 15750,
            taxableEvents: 247,
            avgHoldPeriod: 156
        },
        exportFormats: [
            { format: 'pdf', label: 'PDF Report', description: 'Comprehensive tax report with charts and summaries' },
            { format: 'csv', label: 'CSV Data', description: 'Raw transaction data for tax software import' },
            { format: 'xlsx', label: 'Excel Workbook', description: 'Detailed spreadsheet with calculations and pivot tables' }
        ],
        historicalComparison: [
            { year: 2023, gains: 18200, losses: -8400, netPosition: 9800 },
            { year: 2022, gains: 12100, losses: -15600, netPosition: -3500 },
            { year: 2021, gains: 45700, losses: -6200, netPosition: 39500 }
        ]
    };

    const mockMarketAnalysisData: MarketAnalysisData = {
        sentiment: {
            score: 68,
            label: 'Greed',
            change24h: 5.2,
            indicators: {
                fearGreedIndex: 68,
                socialSentiment: 72,
                technicalIndicators: 65,
                momentum: 71
            }
        },
        technicalAnalysis: {
            trend: 'bullish',
            strength: 75,
            resistance: [42000, 45000, 48000],
            support: [38000, 35000, 32000],
            indicators: [
                { name: 'RSI (14)', value: 64.2, signal: 'buy', strength: 72 },
                { name: 'MACD', value: 580.45, signal: 'buy', strength: 68 },
                { name: 'Moving Average (50)', value: 39250, signal: 'hold', strength: 55 },
                { name: 'Bollinger Bands', value: 0.82, signal: 'buy', strength: 78 }
            ]
        },
        aiInsights: {
            prediction: 'Moderate bullish momentum expected with potential for 8-12% upside in next 30 days',
            confidence: 78,
            timeframe: '30 days',
            keyFactors: [
                'Strong institutional accumulation patterns',
                'Decreasing exchange reserves indicate HODLing behavior',
                'Positive regulatory developments in major markets'
            ],
            risks: [
                'Macroeconomic uncertainty from inflation data',
                'Potential regulatory scrutiny on stablecoins',
                'High correlation with traditional markets during stress'
            ],
            opportunities: [
                'DCA during minor corrections for optimal entry',
                'Layer 2 tokens showing strong fundamentals',
                'DeFi protocols with real yield generation'
            ]
        },
        marketMetrics: {
            volatility: 3.8,
            volume24h: 28500000000,
            marketCap: 2140000000000,
            dominance: { BTC: 45.2, ETH: 18.7, Others: 36.1 }
        }
    };

    const mockActiveAlerts: ActiveAlert[] = [
        {
            id: '1',
            type: 'portfolio',
            name: 'Portfolio Value Alert',
            status: 'active',
            triggeredCount: 3,
            createdAt: new Date('2024-01-15'),
            lastTriggered: new Date('2024-01-20')
        },
        {
            id: '2',
            type: 'tax',
            name: 'Tax Liability Threshold',
            status: 'triggered',
            triggeredCount: 1,
            createdAt: new Date('2024-01-10'),
            lastTriggered: new Date('2024-01-22')
        }
    ];

    // Mock handlers for modal actions
    const handleExecuteTaxOptimization = async (opportunityId: string) => {
        console.log('Executing tax optimization for opportunity:', opportunityId);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
    };

    const handleGenerateTaxReport = async (year: number, format: string) => {
        console.log('Generating tax report for year:', year, 'format:', format);
        await new Promise(resolve => setTimeout(resolve, 3000));
    };

    const handleExportTaxReport = async (format: string) => {
        console.log('Exporting tax report in format:', format);
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    const handleRefreshMarketData = async () => {
        console.log('Refreshing market analysis data');
        await new Promise(resolve => setTimeout(resolve, 2000));
    };

    const handleCreateAlert = async (config: SmartAlertConfig) => {
        console.log('Creating new alert:', config);
        await new Promise(resolve => setTimeout(resolve, 1500));
    };

    const handleUpdateAlert = async (id: string, config: Partial<SmartAlertConfig>) => {
        console.log('Updating alert:', id, config);
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    const handleDeleteAlert = async (id: string) => {
        console.log('Deleting alert:', id);
        await new Promise(resolve => setTimeout(resolve, 500));
    };

    return (
        <Card className={cn('', className)}>
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
                            <Zap className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">Recommended actions for your portfolio</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {urgentActions.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                                {urgentActions.length} Urgent
                            </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                            {priorityActions.length} High Priority
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
                <div className="space-y-3">
                    {actions.slice(0, 4).map((action) => {
                        const ActionWrapper = action.action === 'link' && action.href ? Link : 'div';
                        const wrapperProps = action.action === 'link' && action.href 
                            ? { href: action.href } 
                            : { onClick: () => handleActionClick(action) };

                        return (
                            <ActionWrapper key={action.id} {...wrapperProps}>
                                <div className="flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition-all hover:border-muted-foreground/20 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${getPriorityBg(action.priority, action.urgent)}`}
                                        >
                                            <action.icon className={`h-4 w-4 ${getPriorityColor(action.priority, action.urgent)}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs">{getCategoryIcon(action.category)}</span>
                                                <p className="text-sm font-medium">{action.title}</p>
                                                {action.urgent && (
                                                    <Badge variant="destructive" className="px-1 py-0 text-xs">
                                                        URGENT
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{action.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                                        <Badge variant={action.priority === 'high' ? 'default' : 'secondary'} className="text-xs">
                                            {action.priority.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </ActionWrapper>
                        );
                    })}
                </div>

                {/* Action Summary */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-3 text-center dark:from-red-950/20 dark:to-red-900/20">
                        <p className="text-xs font-medium text-red-700 dark:text-red-300">Urgent</p>
                        <p className="text-lg font-bold text-red-600">{urgentActions.length}</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-3 text-center dark:from-orange-950/20 dark:to-orange-900/20">
                        <p className="text-xs font-medium text-orange-700 dark:text-orange-300">High</p>
                        <p className="text-lg font-bold text-orange-600">{priorityActions.length}</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3 text-center dark:from-blue-950/20 dark:to-blue-900/20">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Portfolio</p>
                        <p className="text-lg font-bold text-blue-600">{actions.filter((a) => a.category === 'portfolio').length}</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-3 text-center dark:from-green-950/20 dark:to-green-900/20">
                        <p className="text-xs font-medium text-green-700 dark:text-green-300">Tax Ops</p>
                        <p className="text-lg font-bold text-green-600">{actions.filter((a) => a.category === 'tax').length}</p>
                    </div>
                </div>

                <div className="mt-4">
                    <Link href="/advisor">
                        <Button variant="outline" size="sm" className="flex w-full items-center justify-center gap-2">
                            <Zap className="h-3 w-3" />
                            <span className="text-xs">View All Recommendations</span>
                        </Button>
                    </Link>
                </div>
            </CardContent>

            {/* Premium Modal Components */}
            <TaxOptimizationModal
                isOpen={modals.taxOptimization}
                onClose={() => closeModal('taxOptimization')}
                data={mockTaxOptimizationData}
                onExecuteOptimization={handleExecuteTaxOptimization}
            />

            <TaxReportModal
                isOpen={modals.taxReport}
                onClose={() => closeModal('taxReport')}
                data={mockTaxReportData}
                onGenerateReport={handleGenerateTaxReport}
                onExportReport={handleExportTaxReport}
            />

            <MarketAnalysisModal
                isOpen={modals.marketAnalysis}
                onClose={() => closeModal('marketAnalysis')}
                data={mockMarketAnalysisData}
                onRefreshData={handleRefreshMarketData}
            />

            <SmartAlertsModal
                isOpen={modals.smartAlerts}
                onClose={() => closeModal('smartAlerts')}
                activeAlerts={mockActiveAlerts}
                onCreateAlert={handleCreateAlert}
                onUpdateAlert={handleUpdateAlert}
                onDeleteAlert={handleDeleteAlert}
            />
        </Card>
    );
}
