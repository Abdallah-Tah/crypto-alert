import { useEcho } from '@laravel/echo-react';
import { useEffect, useState } from 'react';

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

interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (notificationId: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    checkForNewAlerts: () => Promise<void>;
}

export function useNotifications(userId?: number): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const echo = useEcho();

    // Fetch initial notifications
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Set up real-time listeners (temporarily disabled for debugging)
    useEffect(() => {
        if (!echo || !userId) {
            console.log('Echo not available or no userId:', { echo: !!echo, userId });
            return;
        }

        console.log('Echo setup temporarily disabled for debugging');
        
        // TODO: Re-enable after fixing API issues
        /*
        console.log('Setting up notification channel for user:', userId);
        console.log('Echo instance:', echo);
        console.log('Echo methods:', Object.keys(echo));

        try {
            // Type assertion to work around TypeScript issue
            const echoInstance = echo as any;
            
            // Check if private method exists
            if (typeof echoInstance.private !== 'function') {
                console.error('Echo.private is not a function:', typeof echoInstance.private);
                return;
            }
            
            // Listen for notifications on private user channel
            const channel = echoInstance.private(`notifications.${userId}`);
            
            channel.subscribed(() => {
                console.log(`Connected to notifications channel for user ${userId}`);
            });

            channel.error((error: unknown) => {
                console.error('Notifications channel error:', error);
            });
            
            channel.listen('.notification.created', (event: { notification: Notification }) => {
                console.log('New notification received:', event.notification);
                setNotifications(prev => [event.notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // Show browser notification if permission granted
                if (Notification.permission === 'granted') {
                    new Notification(event.notification.title, {
                        body: event.notification.message,
                        icon: '/favicon.ico',
                        tag: `notification-${event.notification.id}`
                    });
                }
            });

            return () => {
                console.log('Cleaning up notification channel');
                channel.stopListening('.notification.created');
            };
        } catch (error) {
            console.error('Error setting up notification channel:', error);
        }
        */
    }, [echo, userId]);

    const fetchNotifications = async () => {
        setLoading(true);
        console.log('Fetching notifications...');
        
        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch('/api/notifications', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            console.log('Notifications API response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Notifications data received:', data);
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            } else {
                console.error('Notifications API error:', response.status, response.statusText);
                // Set empty state on error
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // Set empty state on error
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId 
                        ? { ...notification, read_at: new Date().toISOString() }
                        : notification
                )
            );
            
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            setNotifications(prev =>
                prev.map(notification => ({
                    ...notification,
                    read_at: notification.read_at || new Date().toISOString()
                }))
            );
            
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const checkForNewAlerts = async () => {
        try {
            await fetch('/api/notifications/check-alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            // Refresh notifications after checking for new alerts
            await fetchNotifications();
        } catch (error) {
            console.error('Failed to check for new alerts:', error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        checkForNewAlerts,
    };
}

// Request browser notification permission on first use
export function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}
