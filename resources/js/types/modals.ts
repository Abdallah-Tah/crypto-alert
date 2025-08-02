// Modal interfaces for premium cryptocurrency portfolio management application

export interface TaxOptimizationData {
    currentTaxLiability: number;
    potentialSavings: number;
    opportunities: TaxOptimizationOpportunity[];
    recommendations: string[];
    yearToDate: {
        gains: number;
        losses: number;
        harvestable: number;
    };
}

export interface TaxOptimizationOpportunity {
    id: string;
    type: 'harvest' | 'defer' | 'offset';
    asset: string;
    currentValue: number;
    unrealizedLoss: number;
    potentialSaving: number;
    confidence: 'high' | 'medium' | 'low';
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
}

export interface TaxReportData {
    availableYears: number[];
    selectedYear: number;
    reportMetrics: {
        totalGains: number;
        totalLosses: number;
        netPosition: number;
        taxableEvents: number;
        avgHoldPeriod: number;
    };
    exportFormats: Array<{
        format: 'csv' | 'pdf' | 'xlsx';
        label: string;
        description: string;
    }>;
    historicalComparison?: {
        year: number;
        gains: number;
        losses: number;
        netPosition: number;
    }[];
}

export interface MarketAnalysisData {
    sentiment: {
        score: number;
        label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
        change24h: number;
        indicators: {
            fearGreedIndex: number;
            socialSentiment: number;
            technicalIndicators: number;
            momentum: number;
        };
    };
    technicalAnalysis: {
        trend: 'bullish' | 'bearish' | 'neutral';
        strength: number;
        resistance: number[];
        support: number[];
        indicators: TechnicalIndicator[];
    };
    aiInsights: {
        prediction: string;
        confidence: number;
        timeframe: string;
        keyFactors: string[];
        risks: string[];
        opportunities: string[];
    };
    marketMetrics: {
        volatility: number;
        volume24h: number;
        marketCap: number;
        dominance: Record<string, number>;
    };
}

export interface TechnicalIndicator {
    name: string;
    value: number;
    signal: 'buy' | 'sell' | 'hold';
    strength: number;
}

export interface SmartAlertConfig {
    type: 'portfolio' | 'tax' | 'market' | 'risk';
    name: string;
    description: string;
    thresholds: AlertThreshold[];
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    frequency: 'instant' | '15min' | '1hour' | '1day';
    isActive: boolean;
}

export interface AlertThreshold {
    metric: string;
    condition: 'above' | 'below' | 'equals' | 'change';
    value: number;
    unit?: string;
}

export interface ActiveAlert {
    id: string;
    type: SmartAlertConfig['type'];
    name: string;
    status: 'active' | 'triggered' | 'paused';
    lastTriggered?: Date;
    triggeredCount: number;
    createdAt: Date;
}

// Modal component props interfaces
export interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export interface TaxOptimizationModalProps extends PremiumModalProps {
    data: TaxOptimizationData;
    onExecuteOptimization: (opportunityId: string) => Promise<void>;
    isLoading?: boolean;
}

export interface TaxReportModalProps extends PremiumModalProps {
    data: TaxReportData;
    onGenerateReport: (year: number, format: string) => Promise<void>;
    onExportReport: (format: string) => Promise<void>;
    isGenerating?: boolean;
}

export interface MarketAnalysisModalProps extends PremiumModalProps {
    data: MarketAnalysisData;
    onRefreshData: () => Promise<void>;
    isRefreshing?: boolean;
}

export interface SmartAlertsModalProps extends PremiumModalProps {
    activeAlerts: ActiveAlert[];
    onCreateAlert: (config: SmartAlertConfig) => Promise<void>;
    onUpdateAlert: (id: string, config: Partial<SmartAlertConfig>) => Promise<void>;
    onDeleteAlert: (id: string) => Promise<void>;
    isLoading?: boolean;
}

// Loading and success states
export interface LoadingState {
    isLoading: boolean;
    message?: string;
    progress?: number;
}

export interface SuccessState {
    isSuccess: boolean;
    message?: string;
    data?: any;
}

export interface ErrorState {
    isError: boolean;
    message?: string;
    code?: string;
}

// Animation and transition configurations
export interface ModalAnimationConfig {
    duration: number;
    easing: string;
    stagger?: number;
}

export const MODAL_ANIMATIONS = {
    scale: {
        duration: 300,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    fade: {
        duration: 250,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
    slide: {
        duration: 350,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    stagger: {
        duration: 200,
        easing: 'ease-out',
        stagger: 50,
    },
} as const;