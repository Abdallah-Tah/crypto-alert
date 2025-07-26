import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { AlertCircle, Bell, BellOff, Check, CheckCheck, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface NotificationData {
    symbol?: string;
    current_price?: number;
    alert_target?: number;
    percentage_change?: number;
    direction?: string;
}

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    data: NotificationData | null;
    read_at: string | null;
    created_at: string;
}

interface NotificationsProps {
    notifications: Notification[];
    unreadCount: number;
}

export default function Notifications({ notifications: initialNotifications, unreadCount: initialUnreadCount }: NotificationsProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [loading, setLoading] = useState(false);

    const markAsRead = async (notificationId: number) => {
        try {
            await fetch(`/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId ? { ...notification, read_at: new Date().toISOString() } : notification,
                ),
            );

            if (unreadCount > 0) {
                setUnreadCount((prev) => prev - 1);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            await fetch('/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    read_at: notification.read_at || new Date().toISOString(),
                })),
            );

            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (type: string, data: NotificationData | null) => {
        switch (type) {
            case 'price_alert':
                if (data?.direction === 'gain') {
                    return <TrendingUp className="h-5 w-5 text-green-500" />;
                } else if (data?.direction === 'loss') {
                    return <TrendingDown className="h-5 w-5 text-red-500" />;
                }
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
            case 'portfolio_change':
                return <TrendingUp className="h-5 w-5 text-blue-500" />;
            case 'market_sentiment':
                return <AlertCircle className="h-5 w-5 text-orange-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getNotificationBadge = (type: string) => {
        const badges = {
            price_alert: { label: 'Price Alert', variant: 'default' as const },
            portfolio_change: { label: 'Portfolio', variant: 'secondary' as const },
            market_sentiment: { label: 'Market', variant: 'outline' as const },
        };

        return badges[type as keyof typeof badges] || { label: 'Notification', variant: 'default' as const };
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateString));
    };

    return (
        <AppLayout>
            <Head title="Notifications" />

            <div className="container mx-auto px-4 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="h-6 w-6" />
                        <h1 className="text-2xl font-bold">Notifications</h1>
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {unreadCount} unread
                            </Badge>
                        )}
                    </div>

                    {unreadCount > 0 && (
                        <Button onClick={markAllAsRead} disabled={loading} variant="outline" size="sm">
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Mark All Read
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <BellOff className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">No notifications</h3>
                                <p className="text-center text-muted-foreground">
                                    You'll see price alerts, portfolio updates, and market insights here.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        notifications.map((notification) => {
                            const isUnread = !notification.read_at;
                            const badge = getNotificationBadge(notification.type);

                            return (
                                <Card
                                    key={notification.id}
                                    className={cn(
                                        'cursor-pointer transition-colors hover:bg-muted/50',
                                        isUnread && 'border-l-4 border-l-blue-500 bg-blue-50/50',
                                    )}
                                    onClick={() => isUnread && markAsRead(notification.id)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {getNotificationIcon(notification.type, notification.data)}
                                                <div className="flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <CardTitle className="text-base">{notification.title}</CardTitle>
                                                        <Badge variant={badge.variant} className="text-xs">
                                                            {badge.label}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription className="text-sm">{notification.message}</CardDescription>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</span>
                                                {isUnread && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notification.id);
                                                        }}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {notification.data && (
                                        <CardContent className="pt-0">
                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                {notification.data.symbol && (
                                                    <span>
                                                        Symbol: <strong>{notification.data.symbol}</strong>
                                                    </span>
                                                )}
                                                {notification.data.current_price && (
                                                    <span>
                                                        Price: <strong>{formatPrice(notification.data.current_price)}</strong>
                                                    </span>
                                                )}
                                                {notification.data.percentage_change && (
                                                    <span
                                                        className={cn(
                                                            'font-semibold',
                                                            notification.data.percentage_change > 0 ? 'text-green-600' : 'text-red-600',
                                                        )}
                                                    >
                                                        {notification.data.percentage_change > 0 ? '+' : ''}
                                                        {notification.data.percentage_change.toFixed(2)}%
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
