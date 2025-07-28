<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Get user notifications
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $notifications = Notification::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get(['id', 'type', 'title', 'message', 'data', 'read_at', 'created_at']);

            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $notifications->whereNull('read_at')->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch notifications',
                'notifications' => [],
                'unread_count' => 0
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        try {
            $notification = Notification::where('user_id', $request->user()->id)
                ->where('id', $id)
                ->first();

            if (!$notification) {
                return response()->json(['error' => 'Notification not found'], 404);
            }

            $notification->update(['read_at' => now()]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to mark notification as read'], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            Notification::where('user_id', $request->user()->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to mark all notifications as read'], 500);
        }
    }

    /**
     * Check for new alerts
     */
    public function checkAlerts(Request $request): JsonResponse
    {
        try {
            $notificationService = app(\App\Services\NotificationService::class);
            $alerts = $notificationService->checkAlerts();

            return response()->json([
                'success' => true,
                'alerts_checked' => count($alerts),
                'new_notifications' => $alerts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to check for new alerts',
                'alerts_checked' => 0,
                'new_notifications' => []
            ], 500);
        }
    }
}
