<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    private NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Display notifications page
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $notifications = $this->notificationService->getUserNotifications($user->id);
        $unreadCount = $this->notificationService->getUnreadCount($user->id);

        return Inertia::render('Notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }

    /**
     * Get notifications API endpoint
     */
    public function getNotifications(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = $request->input('limit', 50);

        $notifications = $this->notificationService->getUserNotifications($user->id, $limit);
        $unreadCount = $this->notificationService->getUnreadCount($user->id);

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, int $notificationId): JsonResponse
    {
        $user = $request->user();
        $success = $this->notificationService->markAsRead($notificationId, $user->id);

        if ($success) {
            return response()->json(['message' => 'Notification marked as read']);
        }

        return response()->json(['error' => 'Notification not found'], 404);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get all unread notifications and mark them as read
        $notifications = \App\Models\Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->get();

        foreach ($notifications as $notification) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'All notifications marked as read',
            'count' => $notifications->count()
        ]);
    }

    /**
     * Get unread count API endpoint
     */
    public function getUnreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $count = $this->notificationService->getUnreadCount($user->id);

        return response()->json(['unreadCount' => $count]);
    }

    /**
     * Check alerts manually (for testing)
     */
    public function checkAlerts(): JsonResponse
    {
        $alerts = $this->notificationService->checkAlerts();

        return response()->json([
            'message' => 'Alerts checked successfully',
            'triggeredAlerts' => count($alerts),
            'alerts' => $alerts
        ]);
    }
}
