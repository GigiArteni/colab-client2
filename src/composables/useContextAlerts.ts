/**
 * Context Alerts Composable
 * Fetches and manages alerts related to specific resources (subscriptions, invoices, etc.)
 */

import { ref, watch, onMounted } from 'vue';
import { useEntityStore } from 'src/stores/entity';
import { useProfileStore } from 'src/stores/profile';
import * as alertService from 'src/services/alert.service';
import type { Alert } from 'src/types/alert.types';

export interface UseContextAlertsOptions {
  /**
   * Resource type (e.g., 'subscriptions', 'invoices')
   */
  resourceType: string;

  /**
   * Resource ID
   */
  resourceId: string | (() => string);

  /**
   * Auto-load on mount (default: true)
   */
  autoLoad?: boolean;

  /**
   * Only show unread alerts (default: true)
   */
  unreadOnly?: boolean;

  /**
   * Callback when alert is dismissed
   */
  onDismissed?: (alertId: string) => void;
}

export function useContextAlerts(options: UseContextAlertsOptions) {
  const entityStore = useEntityStore();
  const profileStore = useProfileStore();

  const alerts = ref<Alert[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Get resource ID (handle both static and computed)
  const getResourceId = (): string => {
    return typeof options.resourceId === 'function'
      ? options.resourceId()
      : options.resourceId;
  };

  /**
   * Map frontend resource type to backend model class
   */
  const getAlertableType = (resourceType: string): string => {
    const typeMap: Record<string, string> = {
      subscriptions: 'Subscription',
      invoices: 'Invoice',
      payments: 'Payment',
      meters: 'Meter',
    };
    return typeMap[resourceType] || resourceType;
  };

  /**
   * Load context-specific alerts
   */
  const loadAlerts = async () => {
    const entityId = entityStore.selectedEntityId;
    const contactId = profileStore.contact?.id;
    const resourceId = getResourceId();

    if (!entityId || !contactId || !resourceId) {
      console.warn('[useContextAlerts] Missing required IDs');
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      // Fetch all alerts for this contact
      const alertParams: { per_page: number; dismissed?: boolean } = { per_page: 50 };
      if (options.unreadOnly !== false) alertParams.dismissed = false;
      const response = await alertService.getAlerts(entityId, contactId, alertParams);

      // Filter to only alerts about this specific resource
      const alertableType = getAlertableType(options.resourceType);
      alerts.value = (response.data || []).filter((alert: Alert) => {
        return (
          alert.alertable_type === alertableType &&
          alert.alertable_id === resourceId
        );
      });
    } catch (err) {
      console.error('[useContextAlerts] Error loading alerts:', err);
      error.value = 'Failed to load alerts';
      alerts.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Dismiss a single alert
   */
  const dismissAlert = async (alertId: string) => {
    const entityId = entityStore.selectedEntityId;
    const contactId = profileStore.contact?.id;

    if (!entityId || !contactId) {
      return false;
    }

    try {
      await alertService.dismissAlert(entityId, contactId, alertId);

      // Remove from local list
      alerts.value = alerts.value.filter((a) => a.id !== alertId);

      // Callback
      options.onDismissed?.(alertId);

      return true;
    } catch (err) {
      console.error('[useContextAlerts] Error dismissing alert:', err);
      return false;
    }
  };

  /**
   * Dismiss all context alerts
   */
  const dismissAll = async () => {
    const alertIds = alerts.value.map((a) => a.id);
    if (alertIds.length === 0) return;

    const entityId = entityStore.selectedEntityId;
    const contactId = profileStore.contact?.id;

    if (!entityId || !contactId) {
      return;
    }

    try {
      await alertService.bulkDismissAlerts(entityId, contactId, alertIds);

      // Clear local list
      alerts.value = [];
    } catch (err) {
      console.error('[useContextAlerts] Error dismissing all alerts:', err);
    }
  };

  /**
   * Refresh alerts
   */
  const refresh = async () => {
    await loadAlerts();
  };

  // Watch for resource ID changes
  watch(
    () => getResourceId(),
    () => {
      if (options.autoLoad !== false) {
        void loadAlerts();
      }
    }
  );

  // Auto-load on mount if enabled
  onMounted(() => {
    if (options.autoLoad !== false) {
      void loadAlerts();
    }
  });

  return {
    alerts,
    loading,
    error,
    loadAlerts,
    dismissAlert,
    dismissAll,
    refresh,
  };
}
