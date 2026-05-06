/**
 * Echo Composable
 * Provides reactive access to Laravel Echo instance
 */

import { computed, getCurrentInstance } from 'vue';
import type Echo from 'laravel-echo';

/**
 * Composable for accessing Laravel Echo instance
 * @returns Echo utilities and connection status
 */
export function useEcho() {
  const instance = getCurrentInstance();

  // Get Echo instance from global properties
  const echo = computed<Echo<'pusher'> | null>(() => {
    return instance?.appContext.config.globalProperties.$echo || window.Echo || null;
  });

  // Check if Echo is connected
  const isConnected = computed(() => !!echo.value);

  /**
   * Subscribe to a private channel
   * @param channelName - Channel name (e.g., 'contact.xxx.alerts')
   * @param eventName - Event name with dot prefix (e.g., '.alert.created')
   * @param callback - Event handler callback
   * @returns Channel subscription object or null
   */
  const subscribe = (
    channelName: string,
    eventName: string,
    callback: (data: unknown) => void
  ) => {
    if (!echo.value) {
      console.warn('[useEcho] Cannot subscribe: Echo not connected');
      return null;
    }

    console.log(`[useEcho] Subscribing to ${channelName} event ${eventName}`);
    return echo.value.private(channelName).listen(eventName, callback);
  };

  /**
   * Unsubscribe from a channel
   * @param channelName - Full channel name
   */
  const unsubscribe = (channelName: string) => {
    if (!echo.value) {
      return;
    }

    console.log(`[useEcho] Unsubscribing from ${channelName}`);
    echo.value.leave(channelName);
  };

  /**
   * Subscribe to a public channel
   * @param channelName - Channel name
   * @param eventName - Event name with dot prefix
   * @param callback - Event handler callback
   * @returns Channel subscription object or null
   */
  const subscribePublic = (
    channelName: string,
    eventName: string,
    callback: (data: unknown) => void
  ) => {
    if (!echo.value) {
      console.warn('[useEcho] Cannot subscribe: Echo not connected');
      return null;
    }

    return echo.value.channel(channelName).listen(eventName, callback);
  };

  return {
    echo,
    isConnected,
    subscribe,
    unsubscribe,
    subscribePublic,
  };
}
