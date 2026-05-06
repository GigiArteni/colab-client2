/**
 * Notification Service - API calls for user notifications
 */

import api from './api';
import type {
  Notification,
  NotificationListParams,
  PaginatedResponse,
} from 'src/types';

const notificationBase = (entityId: string) =>
  `/entities/${entityId}/colab/notifications`;

const NOTIFICATION_ENDPOINTS = {
  LIST: (entityId: string) => notificationBase(entityId),
  DETAIL: (entityId: string, id: string) => `${notificationBase(entityId)}/${id}`,
  MARK_READ: (entityId: string, id: string) => `${notificationBase(entityId)}/${id}/read`,
  MARK_ALL_READ: (entityId: string) => `${notificationBase(entityId)}/mark-all-read`,
};

export const notificationService = {
  /**
   * Get all notifications for the current user within an entity
   */
  async getNotifications(
    entityId: string,
    params?: NotificationListParams
  ): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<PaginatedResponse<Notification>>(
      NOTIFICATION_ENDPOINTS.LIST(entityId),
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
  async getNotification(entityId: string, id: string): Promise<Notification> {
    const response = await api.get<{ data: Notification }>(
      NOTIFICATION_ENDPOINTS.DETAIL(entityId, id)
    );
    return response.data.data;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(entityId: string, id: string): Promise<void> {
    await api.post(NOTIFICATION_ENDPOINTS.MARK_READ(entityId, id));
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(entityId: string): Promise<void> {
    await api.post(NOTIFICATION_ENDPOINTS.MARK_ALL_READ(entityId));
  },

  /**
   * Delete a notification
   */
  async deleteNotification(entityId: string, id: string): Promise<void> {
    await api.delete(NOTIFICATION_ENDPOINTS.DETAIL(entityId, id));
  },
};
