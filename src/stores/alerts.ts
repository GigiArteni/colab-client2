/**
 * Alerts Store
 * Manages customer alerts with pagination and real-time updates
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { alertService } from 'src/services';
import { useProfileStore } from './profile';
import { useEntityStore } from './entity';
import type { Alert } from 'src/types';

export const useAlertsStore = defineStore('alerts', () => {
  // State
  const alerts = ref<Alert[]>([]);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalAlerts = ref(0);
  const perPage = ref(20);
  const isLoading = ref(false);
  const isLoaded = ref(false);
  const dismissing = ref(new Set<string>());

  // Computed
  const hasMore = computed(() => currentPage.value < totalPages.value);
  const unreadAlerts = computed(() =>
    alerts.value.filter(a => !a.dismissed_at)
  );
  const unreadCount = computed(() => unreadAlerts.value.length);

  /**
   * Fetch initial page of alerts
   */
  async function fetchAlerts(filters: {
    status?: string;
    priority?: string;
    channel?: string;
    dismissed?: boolean;
  } = {}): Promise<void> {
    const profileStore = useProfileStore();
    const entityStore = useEntityStore();

    if (!entityStore.selectedEntityId || !profileStore.contact?.id) {
      console.warn('[AlertsStore] Missing entity or contact ID');
      return;
    }

    isLoading.value = true;

    try {
      const response = await alertService.getAlerts(
        entityStore.selectedEntityId,
        profileStore.contact.id,
        {
          page: 1,
          per_page: perPage.value,
          ...filters,
        }
      );

      alerts.value = response.data || [];
      currentPage.value = response.meta.current_page;
      totalPages.value = response.meta.last_page;
      totalAlerts.value = response.meta.total;
      isLoaded.value = true;
    } catch (error) {
      console.error('[AlertsStore] Error fetching alerts:', error);
      alerts.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load next page of alerts
   */
  async function loadMore(filters: {
    status?: string;
    priority?: string;
    channel?: string;
    dismissed?: boolean;
  } = {}): Promise<void> {
    if (!hasMore.value || isLoading.value) {
      return;
    }

    const profileStore = useProfileStore();
    const entityStore = useEntityStore();

    if (!entityStore.selectedEntityId || !profileStore.contact?.id) {
      return;
    }

    isLoading.value = true;

    try {
      const response = await alertService.getAlerts(
        entityStore.selectedEntityId,
        profileStore.contact.id,
        {
          page: currentPage.value + 1,
          per_page: perPage.value,
          ...filters,
        }
      );

      alerts.value = [...alerts.value, ...(response.data || [])];
      currentPage.value = response.meta.current_page;
      totalPages.value = response.meta.last_page;
      totalAlerts.value = response.meta.total;
    } catch (error) {
      console.error('[AlertsStore] Error loading more alerts:', error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Dismiss a single alert
   */
  async function dismissAlert(alertId: string): Promise<boolean> {
    if (dismissing.value.has(alertId)) {
      return false;
    }

    const profileStore = useProfileStore();
    const entityStore = useEntityStore();

    if (!entityStore.selectedEntityId || !profileStore.contact?.id) {
      return false;
    }

    dismissing.value.add(alertId);

    // Optimistic update
    const alert = alerts.value.find(a => a.id === alertId);
    const originalDismissedAt = alert?.dismissed_at;

    if (alert) {
      alert.dismissed_at = new Date().toISOString();
    }

    try {
      await alertService.dismissAlert(
        entityStore.selectedEntityId,
        profileStore.contact.id,
        alertId
      );

      return true;
    } catch (error) {
      console.error('[AlertsStore] Error dismissing alert:', error);

      // Rollback optimistic update
      if (alert) {
        alert.dismissed_at = originalDismissedAt;
      }

      return false;
    } finally {
      dismissing.value.delete(alertId);
    }
  }

  /**
   * Bulk dismiss multiple alerts
   */
  async function bulkDismissAlerts(alertIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const profileStore = useProfileStore();
    const entityStore = useEntityStore();

    if (!entityStore.selectedEntityId || !profileStore.contact?.id) {
      return { success: [], failed: alertIds };
    }

    try {
      const result = await alertService.bulkDismissAlerts(
        entityStore.selectedEntityId,
        profileStore.contact.id,
        alertIds
      );

      // Update dismissed alerts
      result.success.forEach(alertId => {
        const alert = alerts.value.find(a => a.id === alertId);
        if (alert) {
          alert.dismissed_at = new Date().toISOString();
        }
      });

      return result;
    } catch (error) {
      console.error('[AlertsStore] Error bulk dismissing alerts:', error);
      return { success: [], failed: alertIds };
    }
  }

  /**
   * Dismiss all unread alerts
   */
  async function dismissAllUnread(): Promise<void> {
    const alertIds = unreadAlerts.value.map(a => a.id);
    if (alertIds.length === 0) return;

    await bulkDismissAlerts(alertIds);
  }

  /**
   * Add a new alert (for real-time updates)
   */
  function prependAlert(alert: Alert): void {
    alerts.value = [alert, ...alerts.value];
    totalAlerts.value += 1;
  }

  /**
   * Update an existing alert (for real-time updates)
   */
  function updateAlert(alertId: string, updates: Partial<Alert>): void {
    const index = alerts.value.findIndex(a => a.id === alertId);
    if (index !== -1) {
      alerts.value[index] = { ...alerts.value[index], ...updates };
    }
  }

  /**
   * Remove an alert from the list
   */
  function removeAlert(alertId: string): void {
    alerts.value = alerts.value.filter(a => a.id !== alertId);
    totalAlerts.value = Math.max(0, totalAlerts.value - 1);
  }

  /**
   * Reset store state
   */
  function $reset(): void {
    alerts.value = [];
    currentPage.value = 1;
    totalPages.value = 1;
    totalAlerts.value = 0;
    isLoaded.value = false;
    isLoading.value = false;
    dismissing.value.clear();
  }

  return {
    // State
    alerts,
    currentPage,
    totalPages,
    totalAlerts,
    perPage,
    isLoading,
    isLoaded,
    dismissing,

    // Computed
    hasMore,
    unreadAlerts,
    unreadCount,

    // Actions
    fetchAlerts,
    loadMore,
    dismissAlert,
    bulkDismissAlerts,
    dismissAllUnread,
    prependAlert,
    updateAlert,
    removeAlert,
    $reset,
  };
});
