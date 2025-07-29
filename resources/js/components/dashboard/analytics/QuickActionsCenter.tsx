import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRightLeft, Calculator, FileText, Target, TrendingUp, Zap } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    href: string;
    priority: 'high' | 'medium' | 'low';
    category: 'tax' | 'portfolio' | 'alert' | 'analysis';
    urgent?: boolean;
}

interface QuickActionsCenterProps {
    className?: string;
}

export function QuickActionsCenter({ className = '' }: QuickActionsCenterProps) {
    const actions: QuickAction[] = [
        {
            id: 'tax-loss-harvest',
            title: 'Tax-Loss Harvesting',
            description: 'Offset gains with DOGE losses',
            icon: Calculator,
            href: '/portfolio/tax-loss-harvesting',
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
            priority: 'medium',
            category: 'portfolio',
        },
        {
            id: 'set-stop-loss',
            title: 'Set Stop Losses',
            description: '2 positions lack risk protection',
            icon: Target,
            href: '/watchlist',
            priority: 'high',
            category: 'alert',
            urgent: true,
        },
        {
            id: 'generate-tax-report',
            title: 'Generate Tax Report',
            description: 'Q3 report ready for download',
            icon: FileText,
            href: '/tax-report',
            priority: 'medium',
            category: 'tax',
        },
        {
            id: 'analyze-performance',
            title: 'Performance Analysis',
            description: 'Review last 30 days metrics',
            icon: TrendingUp,
            href: '/portfolio/full-analysis',
            priority: 'low',
            category: 'analysis',
        },
        {
            id: 'market-alert',
            title: 'Market Alert Setup',
            description: 'Fear & Greed Index threshold',
            icon: AlertTriangle,
            href: '/notifications',
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
                    {actions.slice(0, 4).map((action) => (
                        <Link key={action.id} href={action.href}>
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
                        </Link>
                    ))}
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
        </Card>
    );
}
