/**
 * Notifications Store - Manages user notifications state
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { notificationService } from 'src/services/notification.service';
import { useEntityStore } from 'src/stores/entity';
import type {
  Notification,
  NotificationSummary,
  PaginationMeta,
} from 'src/types';

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([]);
  const summary = ref<NotificationSummary | null>(null);
  const pagination = ref<PaginationMeta | null>(null);
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const error = ref<string | null>(null);

  // Filter
  const showUnreadOnly = ref(false);

  // Computed
  const unreadCount = computed(() => summary.value?.unread || 0);

  const hasUnread = computed(() => unreadCount.value > 0);

  const filteredNotifications = computed(() => {
    if (!showUnreadOnly.value) return notifications.value;
    return notifications.value.filter((n) => !n.read_at);
  });

  const hasMore = computed(() => {
    if (!pagination.value) return false;
    return pagination.value.current_page < pagination.value.last_page;
  });

  // Actions
  async function fetchNotifications(): Promise<void> {
    const entityStore = useEntityStore();
    const entityId = entityStore.selectedEntityId;
    if (!entityId) return;

    isLoading.value = true;
    error.value = null;

    try {
      const params: Record<string, unknown> = {};
      if (showUnreadOnly.value) {
        params['filter[read]'] = false;
      }

      const response = await notificationService.getNotifications(entityId, params);

      notifications.value = response.data || [];

      if (response.meta) {
        pagination.value = response.meta;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Eroare la încărcarea notificărilor';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value || isLoadingMore.value) return;

    const entityStore = useEntityStore();
    const entityId = entityStore.selectedEntityId;
    if (!entityId) return;

    isLoadingMore.value = true;

    try {
      const params: Record<string, unknown> = {
        page: (pagination.value?.current_page || 0) + 1,
      };
      if (showUnreadOnly.value) {
        params['filter[read]'] = false;
      }

      const response = await notificationService.getNotifications(entityId, params);

      if (response.data) {
        notifications.value = [...notifications.value, ...response.data];
      }

      if (response.meta) {
        pagination.value = response.meta;
      }
    } catch (err) {
      console.error('Failed to load more notifications:', err);
    } finally {
      isLoadingMore.value = false;
    }
  }

  function fetchSummary(): void {
    // Summary is derived locally from the notifications list.
    // BE does not expose a dedicated summary endpoint.
    summary.value = {
      total: notifications.value.length,
      unread: notifications.value.filter((n) => !n.read_at).length,
    };
  }

  async function markAsRead(id: string): Promise<void> {
    const entityStore = useEntityStore();
    const entityId = entityStore.selectedEntityId;
    if (!entityId) return;

    try {
      await notificationService.markAsRead(entityId, id);

      // Update local state
      const notification = notifications.value.find((n) => n.id === id);
      if (notification && !notification.read_at) {
        notification.read_at = new Date().toISOString();

        // Update summary
        if (summary.value && summary.value.unread > 0) {
          summary.value.unread--;
        }
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      throw err;
    }
  }

  async function markAllAsRead(): Promise<void> {
    const entityStore = useEntityStore();
    const entityId = entityStore.selectedEntityId;
    if (!entityId) throw new Error('No entity selected');

    try {
      await notificationService.markAllAsRead(entityId);

      // Update local state
      notifications.value.forEach((n) => {
        if (!n.read_at) {
          n.read_at = new Date().toISOString();
        }
      });

      // Update summary
      if (summary.value) {
        summary.value.unread = 0;
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      throw err;
    }
  }

  async function deleteNotification(id: string): Promise<void> {
    const entityStore = useEntityStore();
    const entityId = entityStore.selectedEntityId;
    if (!entityId) throw new Error('No entity selected');

    try {
      await notificationService.deleteNotification(entityId, id);

      // Remove from local state
      const index = notifications.value.findIndex((n) => n.id === id);
      if (index > -1) {
        const notification = notifications.value[index];
        if (notification) {
          notifications.value.splice(index, 1);

          // Update summary
          if (summary.value) {
            summary.value.total--;
            if (!notification.read_at) {
              summary.value.unread--;
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
      throw err;
    }
  }

  function setShowUnreadOnly(value: boolean): void {
    showUnreadOnly.value = value;
  }

  function reset(): void {
    notifications.value = [];
    summary.value = null;
    pagination.value = null;
    showUnreadOnly.value = false;
    error.value = null;
  }

  return {
    // State
    notifications,
    summary,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    showUnreadOnly,

    // Computed
    unreadCount,
    hasUnread,
    filteredNotifications,
    hasMore,

    // Actions
    fetchNotifications,
    loadMore,
    fetchSummary,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setShowUnreadOnly,
    reset,
  };
});
