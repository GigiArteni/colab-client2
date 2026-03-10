/**
 * Notification Service - API calls for user notifications
 */

import api from './api';
import type {
  Notification,
  NotificationListParams,
  NotificationSummary,
  ApiResponse,
} from 'src/types';

const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  DETAIL: (id: string) => `/notifications/${id}`,
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
  SUMMARY: '/notifications/summary',
};

export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(
    params?: NotificationListParams
  ): Promise<ApiResponse<Notification[]>> {
    const response = await api.get<ApiResponse<Notification[]>>(
      NOTIFICATION_ENDPOINTS.LIST,
      {
        params: {
          sort: '-created_at',
          per_page: 20,
          ...params,
        },
      }
    );
    return response.data;
  },

  /**
   * Get a single notification by ID
   */
  async getNotification(id: string): Promise<Notification> {
    const response = await api.get<{ data: Notification }>(
      NOTIFICATION_ENDPOINTS.DETAIL(id)
    );
    return response.data.data;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await api.post(NOTIFICATION_ENDPOINTS.MARK_READ(id));
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.post(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
  },

  /**
   * Get notification summary (total, unread count)
   */
  async getSummary(): Promise<NotificationSummary> {
    const response = await api.get<{ data: NotificationSummary }>(
      NOTIFICATION_ENDPOINTS.SUMMARY
    );
    return response.data.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(NOTIFICATION_ENDPOINTS.DETAIL(id));
  },
};
