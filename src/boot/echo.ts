/**
 * Laravel Echo Boot File
 * Initializes WebSocket connection for real-time features
 */

import { boot } from 'quasar/wrappers';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAuthStore } from 'src/stores/auth';
import { watch } from 'vue';

// Make Pusher available globally for Echo
declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo | null;
  }
}

window.Pusher = Pusher;

/**
 * Create Echo instance with authentication
 */
function createEchoInstance(accessToken: string): Echo {
  return new Echo({
    broadcaster: 'pusher',
    key: process.env.APP_PUSHER_APP_KEY || '',
    wsHost: process.env.APP_PUSHER_HOST || 'localhost',
    wsPort: parseInt(process.env.APP_PUSHER_PORT || '6001'),
    wssPort: parseInt(process.env.APP_PUSHER_PORT || '6001'),
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    cluster: '',
    authEndpoint: `${process.env.APP_PUSHER_AUTH_URL || 'http://localhost:8081/broadcasting/auth'}`,
    auth: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    },
  });
}

export default boot(({ app }) => {
  const authStore = useAuthStore();

  // Watch for token changes and manage Echo lifecycle
  watch(
    () => authStore.accessToken,
    (accessToken) => {
      // Cleanup existing instance
      if (window.Echo) {
        console.log('[Echo] Disconnecting existing instance');
        window.Echo.disconnect();
      }

      // Create new instance if authenticated
      if (accessToken) {
        console.log('[Echo] Creating new instance with authentication');
        const echoInstance = createEchoInstance(accessToken);
        window.Echo = echoInstance;
        app.config.globalProperties.$echo = echoInstance;
      } else {
        console.log('[Echo] No access token, Echo disabled');
        window.Echo = null;
        app.config.globalProperties.$echo = null;
      }
    },
    { immediate: true }
  );
});
