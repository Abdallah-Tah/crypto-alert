import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Bell, Plus, Settings, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface SmartAlert {
    id: string;
    name: string;
    type: 'price_target' | 'portfolio_rebalance' | 'tax_opportunity' | 'risk_threshold';
    condition: string;
    isActive: boolean;
    lastTriggered?: string;
    description: string;
}

interface Props {
    alerts?: SmartAlert[];
}

export default function SmartAlerts({ alerts }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [newAlert, setNewAlert] = useState({
        name: '',
        type: 'price_target' as SmartAlert['type'],
        condition: '',
        description: '',
    });

    const defaultAlerts: SmartAlert[] = [
        {
            id: '1',
            name: 'BTC Price Target',
            type: 'price_target',
            condition: 'BTC >= $75,000',
            isActive: true,
            description: 'Alert when Bitcoin reaches $75,000 target',
        },
        {
            id: '2',
            name: 'Portfolio Rebalancing',
            type: 'portfolio_rebalance',
            condition: 'ETH allocation > 35%',
            isActive: true,
            lastTriggered: '2 days ago',
            description: 'Rebalance when Ethereum allocation exceeds target',
        },
        {
            id: '3',
            name: 'Tax Loss Opportunity',
            type: 'tax_opportunity',
            condition: 'Unrealized loss > $1,000',
            isActive: false,
            description: 'Identify tax-loss harvesting opportunities',
        },
        {
            id: '4',
            name: 'High Risk Warning',
            type: 'risk_threshold',
            condition: 'Portfolio VaR > 15%',
            isActive: true,
            description: 'Alert when portfolio risk exceeds threshold',
        },
    ];

    const alertData = alerts || defaultAlerts;

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'price_target':
                return Target;
            case 'portfolio_rebalance':
                return TrendingUp;
            case 'tax_opportunity':
                return TrendingDown;
            case 'risk_threshold':
                return AlertTriangle;
            default:
                return Bell;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'price_target':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'portfolio_rebalance':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'tax_opportunity':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            case 'risk_threshold':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const handleToggleAlert = async (alertId: string, isActive: boolean) => {
        try {
            router.put(`/alerts/${alertId}`, { isActive });
        } catch {
            console.error('Failed to toggle alert');
        }
    };

    const handleCreateAlert = async () => {
        setIsCreating(true);
        try {
            router.post('/alerts/setup', newAlert, {
                onSuccess: () => {
                    setNewAlert({ name: '', type: 'price_target', condition: '', description: '' });
                },
                onFinish: () => {
                    setIsCreating(false);
                },
            });
        } catch {
            setIsCreating(false);
        }
    };

    return (
        <>
            <Head title="Smart Alerts" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Smart Alerts</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Intelligent monitoring for your portfolio</p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Alert
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Total Alerts</span>
                            </div>
                            <div className="mt-2 text-2xl font-bold">{alertData.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Active</span>
                            </div>
                            <div className="mt-2 text-2xl font-bold text-green-600">{alertData.filter((a) => a.isActive).length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium">Triggered</span>
                            </div>
                            <div className="mt-2 text-2xl font-bold text-orange-600">{alertData.filter((a) => a.lastTriggered).length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium">Risk Alerts</span>
                            </div>
                            <div className="mt-2 text-2xl font-bold text-red-600">{alertData.filter((a) => a.type === 'risk_threshold').length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Active Alerts
                        </CardTitle>
                        <CardDescription>Manage your portfolio monitoring alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {alertData.map((alert) => {
                                const Icon = getAlertIcon(alert.type);
                                return (
                                    <div key={alert.id} className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-700">
                                        <div className="flex flex-1 items-center gap-4">
                                            <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center gap-3">
                                                    <h3 className="font-medium">{alert.name}</h3>
                                                    <Badge className={getAlertColor(alert.type)}>{alert.type.replace('_', ' ')}</Badge>
                                                    {alert.lastTriggered && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Triggered {alert.lastTriggered}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">{alert.description}</p>
                                                <p className="font-mono text-xs text-gray-500">{alert.condition}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Switch checked={alert.isActive} onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)} />
                                            <Button variant="ghost" size="sm">
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Create New Alert */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Create New Alert
                        </CardTitle>
                        <CardDescription>Set up intelligent monitoring for your portfolio</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Alert Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., BTC Price Alert"
                                    value={newAlert.name}
                                    onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Alert Type</Label>
                                <Select
                                    value={newAlert.type}
                                    onValueChange={(value) => setNewAlert({ ...newAlert, type: value as SmartAlert['type'] })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="price_target">Price Target</SelectItem>
                                        <SelectItem value="portfolio_rebalance">Portfolio Rebalance</SelectItem>
                                        <SelectItem value="tax_opportunity">Tax Opportunity</SelectItem>
                                        <SelectItem value="risk_threshold">Risk Threshold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <Input
                                    id="condition"
                                    placeholder="e.g., BTC >= $75,000"
                                    value={newAlert.condition}
                                    onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Brief description of the alert"
                                    value={newAlert.description}
                                    onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button onClick={handleCreateAlert} disabled={isCreating || !newAlert.name || !newAlert.condition} className="w-full">
                                {isCreating ? 'Creating Alert...' : 'Create Alert'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
