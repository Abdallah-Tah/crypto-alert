import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { requestNotificationPermission, useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Bell, BellOff, CheckCheck, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';

interface NotificationBellProps {
    userId?: number;
    className?: string;
}

export function NotificationBell({ userId, className }: NotificationBellProps) {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(userId);

    useEffect(() => {
        // Request notification permission when component mounts
        requestNotificationPermission();
    }, []);

    const recentNotifications = notifications.slice(0, 5);

    const getNotificationIcon = (type: string, data: any) => {
        switch (type) {
            case 'price_alert':
                return data?.direction === 'above' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                );
            case 'portfolio_alert':
                return <TrendingUp className="h-4 w-4 text-blue-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={cn('relative p-2', className)} disabled={loading}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 px-2 text-xs">
                                        <CheckCheck className="mr-1 h-3 w-3" />
                                        Mark all read
                                    </Button>
                                )}
                                <Link href="/notifications">
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                        View all
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <CardDescription>
                                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentNotifications.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground">
                                <BellOff className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                                <p className="text-xs">You'll see your price alerts and portfolio updates here</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-72">
                                {recentNotifications.map((notification, index) => (
                                    <div key={notification.id}>
                                        <div
                                            className={cn(
                                                'cursor-pointer p-3 transition-colors hover:bg-muted/50',
                                                !notification.read_at && 'bg-blue-50/50 dark:bg-blue-950/20',
                                            )}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {getNotificationIcon(notification.type, notification.data)}
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm leading-none font-medium">{notification.title}</p>
                                                        {!notification.read_at && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                                    </div>
                                                    <p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-muted-foreground">{formatTimeAgo(notification.created_at)}</p>
                                                        {notification.data?.symbol && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {notification.data.symbol}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {index < recentNotifications.length - 1 && <Separator />}
                                    </div>
                                ))}
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}
