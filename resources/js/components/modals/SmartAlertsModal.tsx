import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
    SmartAlertsModalProps, 
    SmartAlertConfig, 
    AlertThreshold,
    ActiveAlert 
} from '@/types/modals';
import { 
    Bell, 
    Plus, 
    Settings, 
    Target, 
    TrendingUp, 
    TrendingDown,
    DollarSign,
    Shield,
    Brain,
    Mail,
    Smartphone,
    MessageSquare,
    Clock,
    Play,
    Pause,
    Trash2,
    Edit,
    CheckCircle,
    AlertTriangle,
    Activity,
    BarChart3,
    Zap
} from 'lucide-react';

interface NewAlertForm {
    type: SmartAlertConfig['type'];
    name: string;
    description: string;
    thresholds: AlertThreshold[];
    notifications: SmartAlertConfig['notifications'];
    frequency: SmartAlertConfig['frequency'];
}

const initialFormState: NewAlertForm = {
    type: 'portfolio',
    name: '',
    description: '',
    thresholds: [{ metric: '', condition: 'above', value: 0 }],
    notifications: { email: true, push: true, sms: false },
    frequency: 'instant'
};

export function SmartAlertsModal({
    isOpen,
    onClose,
    activeAlerts,
    onCreateAlert,
    onUpdateAlert,
    onDeleteAlert,
    isLoading = false,
    className
}: SmartAlertsModalProps) {
    const [activeTab, setActiveTab] = React.useState<string>('overview');
    const [newAlertForm, setNewAlertForm] = React.useState<NewAlertForm>(initialFormState);
    const [editingAlert, setEditingAlert] = React.useState<string | null>(null);
    const [creatingAlert, setCreatingAlert] = React.useState(false);

    const getAlertTypeIcon = (type: SmartAlertConfig['type']) => {
        switch (type) {
            case 'portfolio': return <BarChart3 className="h-4 w-4" />;
            case 'tax': return <DollarSign className="h-4 w-4" />;
            case 'market': return <TrendingUp className="h-4 w-4" />;
            case 'risk': return <Shield className="h-4 w-4" />;
            default: return <Bell className="h-4 w-4" />;
        }
    };

    const getAlertTypeColor = (type: SmartAlertConfig['type']) => {
        switch (type) {
            case 'portfolio': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
            case 'tax': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20';
            case 'market': return 'text-purple-600 bg-purple-50 dark:bg-purple-950/20';
            case 'risk': return 'text-red-600 bg-red-50 dark:bg-red-950/20';
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
        }
    };

    const getStatusIcon = (status: ActiveAlert['status']) => {
        switch (status) {
            case 'active': return <Play className="h-4 w-4 text-emerald-600" />;
            case 'triggered': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
            case 'paused': return <Pause className="h-4 w-4 text-gray-600" />;
            default: return <Bell className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: ActiveAlert['status']) => {
        switch (status) {
            case 'active': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20';
            case 'triggered': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20';
            case 'paused': return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
        }
    };

    const handleCreateAlert = async () => {
        setCreatingAlert(true);
        try {
            const alertConfig: SmartAlertConfig = {
                ...newAlertForm,
                isActive: true
            };
            await onCreateAlert(alertConfig);
            setNewAlertForm(initialFormState);
            setActiveTab('overview');
        } catch (error) {
            console.error('Failed to create alert:', error);
        } finally {
            setCreatingAlert(false);
        }
    };

    const handleToggleAlert = async (alertId: string, isActive: boolean) => {
        await onUpdateAlert(alertId, { isActive });
    };

    const handleDeleteAlert = async (alertId: string) => {
        if (window.confirm('Are you sure you want to delete this alert?')) {
            await onDeleteAlert(alertId);
        }
    };

    const addThreshold = () => {
        setNewAlertForm(prev => ({
            ...prev,
            thresholds: [...prev.thresholds, { metric: '', condition: 'above', value: 0 }]
        }));
    };

    const updateThreshold = (index: number, threshold: Partial<AlertThreshold>) => {
        setNewAlertForm(prev => ({
            ...prev,
            thresholds: prev.thresholds.map((t, i) => 
                i === index ? { ...t, ...threshold } : t
            )
        }));
    };

    const removeThreshold = (index: number) => {
        setNewAlertForm(prev => ({
            ...prev,
            thresholds: prev.thresholds.filter((_, i) => i !== index)
        }));
    };

    const getMetricOptions = (alertType: SmartAlertConfig['type']) => {
        switch (alertType) {
            case 'portfolio':
                return [
                    { value: 'total_value', label: 'Total Portfolio Value' },
                    { value: 'daily_pnl', label: 'Daily P&L' },
                    { value: 'allocation_drift', label: 'Allocation Drift' },
                    { value: 'position_size', label: 'Position Size' }
                ];
            case 'tax':
                return [
                    { value: 'unrealized_gains', label: 'Unrealized Gains' },
                    { value: 'tax_liability', label: 'Tax Liability' },
                    { value: 'harvest_opportunity', label: 'Harvest Opportunity' },
                    { value: 'wash_sale_risk', label: 'Wash Sale Risk' }
                ];
            case 'market':
                return [
                    { value: 'fear_greed_index', label: 'Fear & Greed Index' },
                    { value: 'market_cap', label: 'Market Cap' },
                    { value: 'btc_dominance', label: 'BTC Dominance' },
                    { value: 'volatility', label: 'Volatility Index' }
                ];
            case 'risk':
                return [
                    { value: 'portfolio_var', label: 'Portfolio VaR' },
                    { value: 'concentration_risk', label: 'Concentration Risk' },
                    { value: 'correlation_risk', label: 'Correlation Risk' },
                    { value: 'liquidity_risk', label: 'Liquidity Risk' }
                ];
            default:
                return [];
        }
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                            <Bell className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                Smart Alerts Center
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Configure intelligent alerts for portfolio, tax, market, and risk management
                            </p>
                        </div>
                    </div>

                    {/* Alert Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Active Alerts</p>
                                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                            {activeAlerts.filter(a => a.status === 'active').length}
                                        </p>
                                    </div>
                                    <Play className="h-6 w-6 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/30 border-amber-200 dark:border-amber-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Triggered</p>
                                        <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                                            {activeAlerts.filter(a => a.status === 'triggered').length}
                                        </p>
                                    </div>
                                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Alerts</p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {activeAlerts.length}
                                        </p>
                                    </div>
                                    <Bell className="h-6 w-6 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">This Week</p>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                            {activeAlerts.reduce((sum, alert) => sum + alert.triggeredCount, 0)}
                                        </p>
                                    </div>
                                    <Activity className="h-6 w-6 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </DialogHeader>

                <div className="px-1">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="manage">Manage</TabsTrigger>
                            <TabsTrigger value="create">Create New</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Active Alerts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        Active Alerts
                                    </CardTitle>
                                    <CardDescription>
                                        Currently monitoring {activeAlerts.filter(a => a.status === 'active').length} alerts
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {activeAlerts.slice(0, 5).map((alert, index) => (
                                            <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "flex h-10 w-10 items-center justify-center rounded-lg",
                                                        getAlertTypeColor(alert.type)
                                                    )}>
                                                        {getAlertTypeIcon(alert.type)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold">{alert.name}</h4>
                                                            <Badge className={cn(
                                                                "text-xs flex items-center gap-1",
                                                                getStatusColor(alert.status)
                                                            )}>
                                                                {getStatusIcon(alert.status)}
                                                                {alert.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {alert.type} • Triggered {alert.triggeredCount} times • 
                                                            Created {alert.createdAt.toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {alert.lastTriggered && (
                                                        <div className="text-xs text-muted-foreground text-right">
                                                            Last triggered<br />
                                                            {alert.lastTriggered.toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    <Switch
                                                        checked={alert.status === 'active'}
                                                        onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Alert Categories */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alert Categories</CardTitle>
                                    <CardDescription>
                                        Overview of alert types and their purposes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                                                        Portfolio Alerts
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                                    Monitor portfolio value, allocation drift, and position sizes
                                                </p>
                                                <Badge variant="secondary" className="mt-2">
                                                    {activeAlerts.filter(a => a.type === 'portfolio').length} active
                                                </Badge>
                                            </div>

                                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Shield className="h-5 w-5 text-red-600" />
                                                    <h4 className="font-semibold text-red-900 dark:text-red-100">
                                                        Risk Management
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-red-800 dark:text-red-200">
                                                    VaR limits, concentration risk, and correlation alerts
                                                </p>
                                                <Badge variant="secondary" className="mt-2">
                                                    {activeAlerts.filter(a => a.type === 'risk').length} active
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                                                        Tax Optimization
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                                    Tax liability thresholds and harvest opportunities
                                                </p>
                                                <Badge variant="secondary" className="mt-2">
                                                    {activeAlerts.filter(a => a.type === 'tax').length} active
                                                </Badge>
                                            </div>

                                            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                                                        Market Conditions
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-purple-800 dark:text-purple-200">
                                                    Fear & Greed index, market cap, and volatility alerts
                                                </p>
                                                <Badge variant="secondary" className="mt-2">
                                                    {activeAlerts.filter(a => a.type === 'market').length} active
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Manage Tab */}
                        <TabsContent value="manage" className="space-y-6">
                            <div className="space-y-4">
                                {activeAlerts.map((alert, index) => (
                                    <Card key={alert.id} className="transition-all duration-200 hover:shadow-md">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className={cn(
                                                        "flex h-12 w-12 items-center justify-center rounded-lg",
                                                        getAlertTypeColor(alert.type)
                                                    )}>
                                                        {getAlertTypeIcon(alert.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="text-lg font-semibold">{alert.name}</h4>
                                                            <Badge className={cn(
                                                                "flex items-center gap-1",
                                                                getStatusColor(alert.status)
                                                            )}>
                                                                {getStatusIcon(alert.status)}
                                                                {alert.status}
                                                            </Badge>
                                                            <Badge variant="outline" className="capitalize">
                                                                {alert.type}
                                                            </Badge>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                                            <div>
                                                                <span className="font-medium">Created:</span> {alert.createdAt.toLocaleDateString()}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Triggered:</span> {alert.triggeredCount} times
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Last trigger:</span>{' '}
                                                                {alert.lastTriggered 
                                                                    ? alert.lastTriggered.toLocaleDateString()
                                                                    : 'Never'
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingAlert(alert.id)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Switch
                                                        checked={alert.status === 'active'}
                                                        onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteAlert(alert.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Create New Tab */}
                        <TabsContent value="create" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plus className="h-5 w-5 text-green-600" />
                                        Create New Alert
                                    </CardTitle>
                                    <CardDescription>
                                        Configure a new smart alert for your portfolio
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="alert-name">Alert Name</Label>
                                            <Input
                                                id="alert-name"
                                                placeholder="Portfolio Value Alert"
                                                value={newAlertForm.name}
                                                onChange={(e) => setNewAlertForm(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="alert-type">Alert Type</Label>
                                            <Select 
                                                value={newAlertForm.type} 
                                                onValueChange={(value: SmartAlertConfig['type']) => 
                                                    setNewAlertForm(prev => ({ ...prev, type: value, thresholds: [{ metric: '', condition: 'above', value: 0 }] }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="portfolio">
                                                        <div className="flex items-center gap-2">
                                                            <BarChart3 className="h-4 w-4" />
                                                            Portfolio
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="tax">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4" />
                                                            Tax Optimization
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="market">
                                                        <div className="flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4" />
                                                            Market Conditions
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="risk">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-4 w-4" />
                                                            Risk Management
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="alert-description">Description</Label>
                                        <Textarea
                                            id="alert-description"
                                            placeholder="Describe what this alert monitors and when it should trigger..."
                                            value={newAlertForm.description}
                                            onChange={(e) => setNewAlertForm(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                    </div>

                                    {/* Thresholds */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Alert Conditions</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addThreshold}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Condition
                                            </Button>
                                        </div>

                                        {newAlertForm.thresholds.map((threshold, index) => (
                                            <div key={index} className="flex items-end gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className="flex-1 space-y-2">
                                                    <Label>Metric</Label>
                                                    <Select 
                                                        value={threshold.metric} 
                                                        onValueChange={(value) => updateThreshold(index, { metric: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select metric" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {getMetricOptions(newAlertForm.type).map((option) => (
                                                                <SelectItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="w-32 space-y-2">
                                                    <Label>Condition</Label>
                                                    <Select 
                                                        value={threshold.condition} 
                                                        onValueChange={(value: AlertThreshold['condition']) => updateThreshold(index, { condition: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="above">Above</SelectItem>
                                                            <SelectItem value="below">Below</SelectItem>
                                                            <SelectItem value="equals">Equals</SelectItem>
                                                            <SelectItem value="change">Change by</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="w-32 space-y-2">
                                                    <Label>Value</Label>
                                                    <Input
                                                        type="number"
                                                        value={threshold.value}
                                                        onChange={(e) => updateThreshold(index, { value: Number(e.target.value) })}
                                                    />
                                                </div>

                                                {newAlertForm.thresholds.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeThreshold(index)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Notification Settings */}
                                    <div className="space-y-4">
                                        <Label>Notification Preferences</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium">Email</span>
                                                </div>
                                                <Switch
                                                    checked={newAlertForm.notifications.email}
                                                    onCheckedChange={(checked) => 
                                                        setNewAlertForm(prev => ({
                                                            ...prev,
                                                            notifications: { ...prev.notifications, email: checked }
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium">Push</span>
                                                </div>
                                                <Switch
                                                    checked={newAlertForm.notifications.push}
                                                    onCheckedChange={(checked) => 
                                                        setNewAlertForm(prev => ({
                                                            ...prev,
                                                            notifications: { ...prev.notifications, push: checked }
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="h-4 w-4 text-purple-600" />
                                                    <span className="text-sm font-medium">SMS</span>
                                                </div>
                                                <Switch
                                                    checked={newAlertForm.notifications.sms}
                                                    onCheckedChange={(checked) => 
                                                        setNewAlertForm(prev => ({
                                                            ...prev,
                                                            notifications: { ...prev.notifications, sms: checked }
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Frequency */}
                                    <div className="space-y-2">
                                        <Label>Alert Frequency</Label>
                                        <Select 
                                            value={newAlertForm.frequency} 
                                            onValueChange={(value: SmartAlertConfig['frequency']) => 
                                                setNewAlertForm(prev => ({ ...prev, frequency: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="instant">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="h-4 w-4" />
                                                        Instant
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="15min">Every 15 minutes</SelectItem>
                                                <SelectItem value="1hour">Every hour</SelectItem>
                                                <SelectItem value="1day">Once per day</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setNewAlertForm(initialFormState)}
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            onClick={handleCreateAlert}
                                            disabled={creatingAlert || !newAlertForm.name || !newAlertForm.thresholds[0].metric}
                                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            {creatingAlert ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Create Alert
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        {activeAlerts.length} alerts configured • {activeAlerts.filter(a => a.status === 'active').length} active
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button 
                            onClick={() => setActiveTab('create')}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Alert
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}