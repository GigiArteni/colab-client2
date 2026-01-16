/**
 * Browser Notifications Composable
 * Handles browser notification permissions and display
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Alert } from 'src/types/alert.types';

// Global notification preference (stored in localStorage)
const NOTIFICATION_PREF_KEY = 'colab_notifications_enabled';

export function useBrowserNotifications() {
  const router = useRouter();

  // Check if browser supports notifications
  const isSupported = computed(() => 'Notification' in window);

  // Current permission state
  const permission = ref<NotificationPermission>(
    isSupported.value ? Notification.permission : 'denied'
  );

  // User preference (even if granted, user can disable in app)
  const isEnabled = ref<boolean>(
    localStorage.getItem(NOTIFICATION_PREF_KEY) === 'true'
  );

  /**
   * Check if notifications are available
   */
  const isAvailable = computed(() => {
    return isSupported.value && permission.value === 'granted' && isEnabled.value;
  });

  /**
   * Request notification permission
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      console.warn('[Notifications] Browser does not support notifications');
      return false;
    }

    if (permission.value === 'granted') {
      isEnabled.value = true;
      localStorage.setItem(NOTIFICATION_PREF_KEY, 'true');
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      permission.value = result;

      if (result === 'granted') {
        isEnabled.value = true;
        localStorage.setItem(NOTIFICATION_PREF_KEY, 'true');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Notifications] Error requesting permission:', error);
      return false;
    }
  };

  /**
   * Enable notifications (if permission already granted)
   */
  const enable = () => {
    if (permission.value === 'granted') {
      isEnabled.value = true;
      localStorage.setItem(NOTIFICATION_PREF_KEY, 'true');
    }
  };

  /**
   * Disable notifications
   */
  const disable = () => {
    isEnabled.value = false;
    localStorage.setItem(NOTIFICATION_PREF_KEY, 'false');
  };

  /**
   * Show a browser notification for an alert
   */
  const showNotification = (alert: Alert, options?: {
    icon?: string;
    badge?: string;
    vibrate?: number[];
    requireInteraction?: boolean;
  }): Notification | null => {
    if (!isAvailable.value) {
      return null;
    }

    try {
      // Strip HTML from content
      const body = stripHtml(alert.content_rendered || '');

      const notification = new Notification(alert.subject, {
        body: body.substring(0, 200), // Limit to 200 chars
        icon: options?.icon || '/icons/icon-192x192.png',
        badge: options?.badge || '/icons/icon-128x128.png',
        tag: alert.id, // Prevents duplicate notifications
        data: {
          alertId: alert.id,
          alertableType: alert.alertable_type,
          alertableId: alert.alertable_id,
        },
        requireInteraction: options?.requireInteraction || alert.priority === 'urgent',
        vibrate: options?.vibrate || (alert.priority === 'urgent' ? [200, 100, 200] : undefined),
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Navigate to related resource
        const route = getAlertRoute(alert);
        if (route) {
          void router.push(route);
        }

        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('[Notifications] Error showing notification:', error);
      return null;
    }
  };

  /**
   * Show a simple notification (not tied to alert)
   */
  const showSimpleNotification = (
    title: string,
    body: string,
    options?: NotificationOptions
  ): Notification | null => {
    if (!isAvailable.value) {
      return null;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-128x128.png',
        ...options,
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('[Notifications] Error showing notification:', error);
      return null;
    }
  };

  /**
   * Get route path for alert navigation
   */
  function getAlertRoute(alert: Alert): string | null {
    const routes: Record<string, string> = {
      Subscription: `/subscriptions/${alert.alertable_id}`,
      Invoice: `/invoices/${alert.alertable_id}`,
      Payment: `/payments/${alert.alertable_id}`,
    };

    return alert.alertable_type ? routes[alert.alertable_type] || null : null;
  }

  /**
   * Strip HTML tags from content
   */
  function stripHtml(html: string): string {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  return {
    // State
    isSupported,
    permission,
    isEnabled,
    isAvailable,

    // Methods
    requestPermission,
    enable,
    disable,
    showNotification,
    showSimpleNotification,
  };
}
